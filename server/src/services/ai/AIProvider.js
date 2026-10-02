import { z } from 'zod';
import { AIServiceError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

/**
 * Base AI Provider Abstract Class
 */
export class AIProvider {
  constructor(config = {}) {
    this.apiKey = config.apiKey || env.AI_API_KEY;
    this.model = config.model || env.AI_MODEL;
    this.timeoutMs = config.timeoutMs || env.AI_REQUEST_TIMEOUT_MS;
    this.maxRetries = config.maxRetries ?? env.AI_MAX_RETRIES;
  }

  /**
   * Helper to strip markdown JSON fences
   */
  _extractJSON(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    let text = rawText.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return text.trim();
  }

  /**
   * Abstract text generation - must be implemented by subclasses
   * @param {Object} options { messages, systemPrompt, maxTokens, temperature, onToken }
   * @returns {Promise<string>}
   */
  async generateText(_options) {
    throw new Error('Method generateText must be implemented by subclass');
  }

  /**
   * Strict structured JSON generation with Zod validation and single auto-retry
   * @param {Object} options { messages, systemPrompt, schema, maxTokens, temperature }
   * @returns {Promise<any>} validated parsed JSON
   */
  async generateJSON({ messages, systemPrompt, schema, maxTokens = 2000, temperature = 0.2 }) {
    const strictSystemPrompt = `${systemPrompt || ''}
IMPORTANT: You MUST respond ONLY with valid JSON. Do not include introductory or concluding remarks. Output strictly valid JSON matching the requested schema.`;

    let attempts = 0;
    let lastError = null;
    let lastResponseText = '';

    while (attempts < 2) {
      attempts++;
      try {
        let currentMessages = messages;
        if (attempts > 1 && lastError) {
          logger.warn({ attempt: attempts, error: lastError.message }, 'Retrying JSON generation due to schema parse error');
          currentMessages = [
            ...messages,
            { role: 'assistant', content: lastResponseText },
            {
              role: 'user',
              content: `Your previous output had a JSON schema or syntax issue: ${lastError.message}. Please fix it and output ONLY valid JSON.`
            }
          ];
        }

        const rawText = await this.generateText({
          messages: currentMessages,
          systemPrompt: strictSystemPrompt,
          maxTokens,
          temperature
        });

        lastResponseText = rawText;
        const cleaned = this._extractJSON(rawText);
        
        let parsed;
        try {
          parsed = JSON.parse(cleaned);
        } catch (jsonParseErr) {
          lastError = new Error(`Invalid JSON syntax: ${jsonParseErr.message}`);
          continue;
        }

        if (schema instanceof z.ZodType) {
          const validated = schema.safeParse(parsed);
          if (!validated.success) {
            lastError = new Error(`Zod validation failed: ${validated.error.message}`);
            continue;
          }
          return validated.data;
        }

        return parsed;
      } catch (err) {
        lastError = err;
        logger.error({ err: err.message, attempt: attempts }, 'AI generateJSON error');
      }
    }

    throw new AIServiceError('Failed to generate valid structured data from AI service', {
      details: lastError ? lastError.message : 'Unknown parse failure'
    });
  }
}
