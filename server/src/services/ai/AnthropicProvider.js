import { AIProvider } from './AIProvider.js';
import { AIServiceError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export class AnthropicProvider extends AIProvider {
  async generateText({ messages, systemPrompt, maxTokens = 1000, temperature = 0.7, onToken }) {
    const url = 'https://api.anthropic.com/v1/messages';
    const formattedMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const payload = {
      model: this.model,
      system: systemPrompt || undefined,
      messages: formattedMessages,
      max_tokens: maxTokens,
      temperature
    };

    let attempts = 0;
    let lastError = null;

    while (attempts <= this.maxRetries) {
      attempts++;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timer);

        if (!res.ok) {
          const errorText = await res.text();
          logger.error({ status: res.status, errorText }, 'Anthropic API call failed');
          if (res.status === 429) {
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempts)));
            continue;
          }
          throw new AIServiceError(`AI Provider Error (${res.status})`);
        }

        const data = await res.json();
        const outputText = data.content?.[0]?.text || '';

        if (typeof onToken === 'function') {
          const words = outputText.split(' ');
          for (const word of words) {
            onToken(`${word} `);
          }
        }

        return outputText;
      } catch (err) {
        clearTimeout(timer);
        lastError = err;
        if (err.name === 'AbortError') {
          throw new AIServiceError('AI request timed out');
        }
        if (attempts <= this.maxRetries) {
          await new Promise((r) => setTimeout(r, 800 * attempts));
        }
      }
    }

    throw new AIServiceError(lastError?.message || 'Anthropic Provider Request Failed');
  }
}
