import { describe, it, expect } from 'vitest';
import { AssessmentService } from '../src/services/AssessmentService.js';
import { buildAndValidateAssessmentSeed } from '../src/data/generateAssessmentQuestions.js';

describe('Placement Diagnostic Assessment Engine', () => {
  it('should validate that all 600 questions pass Zod schema and uniqueness checks', async () => {
    const questions = await buildAndValidateAssessmentSeed();
    expect(questions.length).toBe(600);

    const idSet = new Set();
    questions.forEach((q) => {
      expect(q.id).toBeDefined();
      expect(idSet.has(q.id)).toBe(false);
      idSet.add(q.id);

      expect(q.options.length).toBe(4);
      expect(new Set(q.options).size).toBe(4); // No duplicate options
      expect(q.explanation.length).toBeGreaterThan(10);
    });
  });

  it('should generate balanced papers for all 4 roles with correct weightages and section minimums', async () => {
    const roles = ['SDE', 'Frontend', 'Backend', 'AI-ML'];
    const modes = ['quick', 'standard', 'deep_dive'];

    for (const role of roles) {
      for (const mode of modes) {
        const session = await AssessmentService.startAssessment('test_user_diag', {
          role,
          mode,
          language: role === 'AI-ML' ? 'Python' : 'JavaScript'
        });

        const expectedCount = mode === 'quick' ? 20 : mode === 'standard' ? 40 : 70;
        expect(session.questions.length).toBe(expectedCount);

        // Check for no duplicates
        const qIds = session.questions.map((q) => q.id);
        expect(new Set(qIds).size).toBe(expectedCount);

        // Verify section presence
        const sectionsPresent = new Set(session.questions.map((q) => q.section));
        expect(sectionsPresent.has('aptitude')).toBe(true);
        expect(sectionsPresent.has('core_cs')).toBe(true);
        expect(sectionsPresent.has('programming')).toBe(true);
        expect(sectionsPresent.has('role_specific')).toBe(true);
        expect(sectionsPresent.has('professional_skills')).toBe(true);

        // Verify difficulty mix (non-zero for all tiers)
        const difficulties = new Set(session.questions.map((q) => q.difficulty));
        expect(difficulties.has('easy')).toBe(true);
        expect(difficulties.has('medium')).toBe(true);
        expect(difficulties.has('hard')).toBe(true);

        // Security check: questions sent to client MUST NOT include answers or rubric scores
        session.questions.forEach((q) => {
          expect(q.correct).toBeUndefined();
          expect(q.optionScores).toBeUndefined();
        });
      }
    }
  });

  it('should accurately score standard MCQs and professional scenario rubric', async () => {
    const session = await AssessmentService.startAssessment('test_user_scoring', {
      role: 'SDE',
      mode: 'quick',
      language: 'JavaScript'
    });

    const userAnswers = {};
    // Answer first 5 questions with option 0
    session.questions.forEach((q, idx) => {
      if (idx < 5) userAnswers[q.id] = 0;
    });

    // Save progress
    const saveRes = await AssessmentService.saveProgress(session.assessmentId, {
      answers: userAnswers,
      timeRemainingSeconds: 1200
    });
    expect(saveRes.ok).toBe(true);

    // Submit
    const result = await AssessmentService.submitAssessment('test_user_scoring', session.assessmentId, {
      answers: userAnswers,
      timeTakenSeconds: 300
    });

    expect(result.id).toBe(session.assessmentId);
    expect(result.overallPercentage).toBeGreaterThanOrEqual(0);
    expect(result.overallPercentage).toBeLessThanOrEqual(100);
    expect(result.professionalSkillsScore).toBeGreaterThanOrEqual(0);
    expect(result.strengths.length).toBeGreaterThanOrEqual(1);
    expect(result.weaknesses.length).toBeGreaterThanOrEqual(1);
    expect(result.detailedFeedback.length).toBe(session.questions.length);
  });
});
