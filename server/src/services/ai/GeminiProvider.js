import { AIProvider } from './AIProvider.js';
import { AIServiceError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export class GeminiProvider extends AIProvider {
  async generateText({ messages, systemPrompt, maxTokens = 1000, temperature = 0.7, onToken }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    // Convert standard messages to Gemini contents format
    const contents = [];
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}` }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will strictly follow these instructions.' }]
      });
    }

    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    const payload = {
      contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature
      }
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timer);

        if (!res.ok) {
          const errorText = await res.text();
          logger.error({ status: res.status, errorText }, 'Gemini API call failed');
          if (res.status === 429) {
            // Backoff on rate limit
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempts)));
            continue;
          }
          throw new AIServiceError(`AI Provider Error (${res.status})`);
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];
        const outputText = candidate?.content?.parts?.[0]?.text || '';

        if (typeof onToken === 'function') {
          // Stream chunks simulation if streaming handler supplied
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

    throw new AIServiceError(lastError?.message || 'Gemini Provider Request Failed');
  }
}
