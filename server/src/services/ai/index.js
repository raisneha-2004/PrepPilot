import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { GeminiProvider } from './GeminiProvider.js';
import { OpenAIProvider } from './OpenAIProvider.js';
import { AnthropicProvider } from './AnthropicProvider.js';
import { MockAIProvider } from './MockAIProvider.js';
import { AIProvider } from './AIProvider.js';

export function createAIProvider(providerType = env.AI_PROVIDER, config = {}) {
  switch (providerType) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'mock':
    default:
      if (providerType !== 'mock') {
        logger.warn({ providerType }, 'Unknown AI provider requested, falling back to mock provider');
      }
      return new MockAIProvider(config);
  }
}

export const aiProvider = createAIProvider();
export { AIProvider, GeminiProvider, OpenAIProvider, AnthropicProvider, MockAIProvider };
