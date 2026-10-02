import { describe, it, expect } from 'vitest';
import { RevisionService } from '../src/services/RevisionService.js';
import { LEITNER_INTERVALS } from '../src/config/constants.js';

describe('Spaced Revision Service (Leitner / SM-2)', () => {
  const testUserId = 'test-user-revision-001';

  it('should promote item to box 2 upon first correct answer', async () => {
    const result = await RevisionService.recordReview(testUserId, {
      topic: 'Arrays & Two Pointers',
      questionId: 'test_q_1',
      isCorrect: true
    });

    expect(result.promotedToBox).toBe(2);
    expect(result.nextReviewInDays).toBe(LEITNER_INTERVALS[2]);
    expect(result.nextReviewDate).toBeDefined();
  });

  it('should reset item to box 1 when answered incorrectly', async () => {
    // Record incorrect answer
    const result = await RevisionService.recordReview(testUserId, {
      topic: 'Arrays & Two Pointers',
      questionId: 'test_q_1',
      isCorrect: false
    });

    expect(result.promotedToBox).toBe(1);
    expect(result.nextReviewInDays).toBe(LEITNER_INTERVALS[1]);
  });

  it('should fetch today due questions session matching target count', async () => {
    const todayDue = await RevisionService.getTodayDue(testUserId);
    expect(todayDue).toHaveProperty('questions');
    expect(todayDue.questions.length).toBe(5);
    expect(todayDue.estimatedMinutes).toBe(10);
  });
});
