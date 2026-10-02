import { AIProvider } from './AIProvider.js';
import { AIServiceError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export class OpenAIProvider extends AIProvider {
  async generateText({ messages, systemPrompt, maxTokens = 1000, temperature = 0.7, onToken }) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const formattedMessages = [];
    if (systemPrompt) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }
    for (const msg of messages) {
      formattedMessages.push({ role: msg.role, content: msg.content });
    }

    const payload = {
      model: this.model,
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
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timer);

        if (!res.ok) {
          const errorText = await res.text();
          logger.error({ status: res.status, errorText }, 'OpenAI API call failed');
          if (res.status === 429) {
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempts)));
            continue;
          }
          throw new AIServiceError(`AI Provider Error (${res.status})`);
        }

        const data = await res.json();
        const outputText = data.choices?.[0]?.message?.content || '';

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

    throw new AIServiceError(lastError?.message || 'OpenAI Provider Request Failed');
  }
}
