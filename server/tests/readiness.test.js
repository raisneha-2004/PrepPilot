import { describe, it, expect } from 'vitest';
import { ReadinessService } from '../src/services/ReadinessService.js';
import { READINESS_WEIGHTS, READINESS_DISCLAIMER } from '../src/config/constants.js';

describe('Readiness Score Service', () => {
  const testUserId = 'test-user-readiness-001';

  it('should calculate readiness score with correct weights and bounds', async () => {
    const result = await ReadinessService.calculateReadinessScore(testUserId);

    expect(result).toHaveProperty('readinessScore');
    expect(result.readinessScore).toBeGreaterThanOrEqual(0);
    expect(result.readinessScore).toBeLessThanOrEqual(100);

    // Verify weights sum to 1.0
    const weightSum = Object.values(READINESS_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(weightSum).toBeCloseTo(1.0, 5);

    // Verify formula explanation and disclaimer
    expect(result.disclaimer).toBe(READINESS_DISCLAIMER);
    expect(result.breakdown).toHaveProperty('dsa');
    expect(result.breakdown).toHaveProperty('aptitude');
    expect(result.breakdown).toHaveProperty('csCore');
    expect(result.breakdown).toHaveProperty('interview');
    expect(result.breakdown).toHaveProperty('consistency');
  });

  it('should aggregate overall progress statistics correctly', async () => {
    const progress = await ReadinessService.getOverallProgress(testUserId);
    expect(progress).toHaveProperty('xp');
    expect(progress).toHaveProperty('level');
    expect(progress).toHaveProperty('badges');
    expect(progress).toHaveProperty('weakAreas');
    expect(Array.isArray(progress.weakAreas)).toBe(true);
  });
});
