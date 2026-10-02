import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { AIProvider } from '../src/services/ai/AIProvider.js';
import { AIServiceError } from '../src/utils/errors.js';

class TestAIProvider extends AIProvider {
  constructor(mockResponses = []) {
    super({ apiKey: 'test-key', model: 'test-model' });
    this.mockResponses = [...mockResponses];
    this.callCount = 0;
  }

  async generateText() {
    this.callCount++;
    if (this.mockResponses.length > 0) {
      return this.mockResponses.shift();
    }
    return '{}';
  }
}

describe('AI JSON Validator & Auto-Retry', () => {
  const testSchema = z.object({
    name: z.string(),
    score: z.number()
  });

  it('should parse and validate valid JSON response', async () => {
    const provider = new TestAIProvider(['{"name": "Alice", "score": 95}']);
    const result = await provider.generateJSON({
      messages: [{ role: 'user', content: 'test' }],
      schema: testSchema
    });

    expect(result).toEqual({ name: 'Alice', score: 95 });
    expect(provider.callCount).toBe(1);
  });

  it('should strip markdown backticks before JSON parsing', async () => {
    const provider = new TestAIProvider(['```json\n{"name": "Bob", "score": 88}\n```']);
    const result = await provider.generateJSON({
      messages: [{ role: 'user', content: 'test' }],
      schema: testSchema
    });

    expect(result).toEqual({ name: 'Bob', score: 88 });
  });

  it('should automatically retry once when first response fails JSON parsing', async () => {
    const provider = new TestAIProvider([
      'Invalid non-json response text',
      '{"name": "Charlie", "score": 90}'
    ]);

    const result = await provider.generateJSON({
      messages: [{ role: 'user', content: 'test' }],
      schema: testSchema
    });

    expect(result).toEqual({ name: 'Charlie', score: 90 });
    expect(provider.callCount).toBe(2);
  });

  it('should automatically retry once when first response fails Zod schema validation', async () => {
    const provider = new TestAIProvider([
      '{"name": "Dave", "score": "ninety"}', // invalid type for score
      '{"name": "Dave", "score": 90}'
    ]);

    const result = await provider.generateJSON({
      messages: [{ role: 'user', content: 'test' }],
      schema: testSchema
    });

    expect(result).toEqual({ name: 'Dave', score: 90 });
    expect(provider.callCount).toBe(2);
  });

  it('should throw AIServiceError when retries are exhausted on persistent invalid output', async () => {
    const provider = new TestAIProvider([
      'bad output 1',
      'bad output 2'
    ]);

    await expect(
      provider.generateJSON({
        messages: [{ role: 'user', content: 'test' }],
        schema: testSchema
      })
    ).rejects.toThrow(AIServiceError);

    expect(provider.callCount).toBe(2);
  });
});
