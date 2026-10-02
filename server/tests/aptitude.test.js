import { describe, it, expect } from 'vitest';
import { AptitudeService } from '../src/services/AptitudeService.js';
import { generateAndValidateAllAptitude } from '../src/data/generateAptitudeQuestions.js';

describe('Aptitude Module & Scoring Engine', () => {
  it('should validate that all 9 topics have at least 40 questions and pass Zod schema', async () => {
    const { total, topicCounts } = await generateAndValidateAllAptitude();
    expect(total).toBeGreaterThanOrEqual(360);

    for (const [topic, counts] of Object.entries(topicCounts)) {
      expect(counts.total).toBeGreaterThanOrEqual(40);
      expect(counts.easy).toBeGreaterThanOrEqual(15);
      expect(counts.medium).toBeGreaterThanOrEqual(15);
      expect(counts.hard).toBeGreaterThanOrEqual(10);
      expect(counts.practice + counts.both).toBeGreaterThan(20);
      expect(counts.exam + counts.both).toBeGreaterThan(15);
    }
  });

  it('should return topics with real metrics matching dataset', async () => {
    const topics = await AptitudeService.getTopics();
    expect(topics).toHaveLength(9);
    for (const t of topics) {
      expect(t.total).toBeGreaterThanOrEqual(40);
      expect(t.easy).toBeGreaterThanOrEqual(15);
      expect(t.medium).toBeGreaterThanOrEqual(15);
      expect(t.hard).toBeGreaterThanOrEqual(10);
      expect(t.subtopics.length).toBeGreaterThan(0);
    }
  });

  it('should evaluate practice answers instantly with explanations and hints', async () => {
    const questions = await AptitudeService.getQuestions({ topic: 'Quantitative Aptitude', mode: 'practice', count: 1 });
    expect(questions).toHaveLength(1);
    const q = questions[0];

    const result = await AptitudeService.evaluatePracticeAnswer({
      questionId: q.id,
      selectedOption: 0
    });

    expect(result).toHaveProperty('isCorrect');
    expect(result).toHaveProperty('correctOption');
    expect(result).toHaveProperty('explanation');
    expect(result.explanation.length).toBeGreaterThan(0);
    expect(result.hints.length).toBeGreaterThanOrEqual(2);
  });

  it('should start an exam session without leaking answer keys or hints to client', async () => {
    const session = await AptitudeService.startExam('user_test_123', {
      preset: 'mini',
      negativeMarking: true
    });

    expect(session.examId).toBeDefined();
    expect(session.questions).toHaveLength(10);
    expect(session.durationSeconds).toBe(15 * 60);

    for (const q of session.questions) {
      expect(q).not.toHaveProperty('correctOption');
      expect(q).not.toHaveProperty('explanation');
      expect(q).not.toHaveProperty('shortcut');
      expect(q).not.toHaveProperty('hints');
      expect(q.options).toHaveLength(4);
    }
  });

  it('should correctly calculate score with negative marking (+1 for correct, -0.25 for wrong, 0 for unattempted)', async () => {
    const session = await AptitudeService.startExam('user_test_scoring', {
      preset: 'mini',
      negativeMarking: true
    });

    // Submit 2 correct, 2 wrong, 6 unattempted
    // Score expected = (2 * 1) - (2 * 0.25) + 0 = 2 - 0.5 = 1.5
    const examQuestions = await AptitudeService.getQuestions({ count: 10, mode: 'exam' });
    const fullQs = await AptitudeService.startExam('user_test_scoring', { preset: 'mini', negativeMarking: true });

    // Simulate answer map
    const answers = {};
    // Get server question list
    const q1 = fullQs.questions[0];
    const q2 = fullQs.questions[1];
    const q3 = fullQs.questions[2];
    const q4 = fullQs.questions[3];

    // Evaluate answer keys
    const q1Key = await AptitudeService.evaluatePracticeAnswer({ questionId: q1.id, selectedOption: 0 });
    const q2Key = await AptitudeService.evaluatePracticeAnswer({ questionId: q2.id, selectedOption: 0 });
    const q3Key = await AptitudeService.evaluatePracticeAnswer({ questionId: q3.id, selectedOption: 0 });
    const q4Key = await AptitudeService.evaluatePracticeAnswer({ questionId: q4.id, selectedOption: 0 });

    answers[q1.id] = q1Key.correctOption; // Correct
    answers[q2.id] = q2Key.correctOption; // Correct
    answers[q3.id] = (q3Key.correctOption + 1) % 4; // Wrong
    answers[q4.id] = (q4Key.correctOption + 2) % 4; // Wrong
    // Remaining 6 unattempted

    const report = await AptitudeService.submitExam('user_test_scoring', fullQs.examId, {
      answers,
      timeTakenSeconds: 300,
      tabSwitches: 1
    });

    expect(report.totalQuestions).toBe(10);
    expect(report.correctCount).toBe(2);
    expect(report.wrongCount).toBe(2);
    expect(report.unattemptedCount).toBe(6);
    expect(report.score).toBe(1.5);
    expect(report.accuracy).toBe(50); // 2 out of 4 attempted
    expect(report.tabSwitches).toBe(1);
    expect(report.questionReview).toHaveLength(10);
  });
});
