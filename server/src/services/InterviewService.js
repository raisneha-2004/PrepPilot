import { z } from 'zod';
import { interviewRepo, resumeRepo } from '../repositories/index.js';
import { aiProvider } from './ai/index.js';
import { buildInterviewQuestionPrompt } from './ai/prompts/interviewQuestion.js';
import { buildInterviewEvaluationPrompt } from './ai/prompts/interviewEvaluation.js';
import { GamificationService } from './GamificationService.js';
import { XP_REWARDS } from '../config/constants.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

const interviewEvalSchema = z.object({
  scores: z.object({
    technicalCorrectness: z.number().min(0).max(100),
    relevance: z.number().min(0).max(100),
    clarity: z.number().min(0).max(100),
    overallScore: z.number().min(0).max(100)
  }),
  feedback: z.string(),
  strengths: z.array(z.string()),
  missingConcepts: z.array(z.string()),
  improvedSampleAnswer: z.string(),
  nextQuestion: z.object({
    question: z.string(),
    category: z.string(),
    expectedCoreConcepts: z.array(z.string()).optional()
  })
});

const questionGenSchema = z.object({
  question: z.string(),
  category: z.string(),
  expectedCoreConcepts: z.array(z.string()).optional(),
  hints: z.array(z.string()).optional()
});

export class InterviewService {
  static async startInterview(userId, { role = 'SDE', difficulty = 'medium', resumeId = null }) {
    let resumeContext = null;
    if (resumeId) {
      const resumeDoc = await resumeRepo.findById(resumeId);
      if (resumeDoc) {
        resumeContext = {
          skills: resumeDoc.analysis?.skills,
          projects: resumeDoc.analysis?.projects
        };
      }
    }

    const firstQuestionAI = await aiProvider.generateJSON({
      messages: [
        {
          role: 'user',
          content: buildInterviewQuestionPrompt({
            role,
            difficulty,
            previousQuestions: [],
            resumeContext,
            roundNumber: 1
          })
        }
      ],
      systemPrompt: 'You are an experienced technical interviewer.',
      schema: questionGenSchema,
      maxTokens: 1000
    });

    const firstQuestion = {
      id: `q_1`,
      questionNumber: 1,
      question: firstQuestionAI.question,
      category: firstQuestionAI.category || 'General',
      expectedCoreConcepts: firstQuestionAI.expectedCoreConcepts || []
    };

    const sessionDoc = {
      userId,
      role,
      difficulty,
      resumeId,
      status: 'active',
      currentQuestionIndex: 0,
      questions: [firstQuestion],
      answers: [],
      evaluations: [],
      startedAt: new Date().toISOString()
    };

    const session = await interviewRepo.create(sessionDoc);

    return {
      interviewId: session.id,
      role: session.role,
      difficulty: session.difficulty,
      firstQuestion
    };
  }

  static async submitAnswer(userId, interviewId, { candidateAnswer, questionId }) {
    const session = await interviewRepo.findById(interviewId);
    if (!session || session.userId !== userId) {
      throw new NotFoundError(`Interview session ${interviewId} not found`);
    }

    if (session.status !== 'active') {
      throw new BadRequestError(`Interview session is already marked as ${session.status}`);
    }

    const currentQuestion = session.questions[session.questions.length - 1];
    if (questionId && currentQuestion.id !== questionId) {
      // Allow if valid, or use current question
    }

    const evaluation = await aiProvider.generateJSON({
      messages: [
        {
          role: 'user',
          content: buildInterviewEvaluationPrompt({
            question: currentQuestion.question,
            expectedConcepts: currentQuestion.expectedCoreConcepts,
            candidateAnswer,
            role: session.role,
            difficulty: session.difficulty,
            questionNumber: session.questions.length
          })
        }
      ],
      systemPrompt: 'You are a technical interview evaluator.',
      schema: interviewEvalSchema,
      maxTokens: 2000
    });

    // Save answer & evaluation
    session.answers.push({
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      candidateAnswer,
      submittedAt: new Date().toISOString()
    });

    session.evaluations.push(evaluation);

    // Prepare next question if round continues
    const nextQNumber = session.questions.length + 1;
    const nextQuestionObj = {
      id: `q_${nextQNumber}`,
      questionNumber: nextQNumber,
      question: evaluation.nextQuestion.question,
      category: evaluation.nextQuestion.category || 'Technical',
      expectedCoreConcepts: evaluation.nextQuestion.expectedCoreConcepts || []
    };

    session.questions.push(nextQuestionObj);
    session.currentQuestionIndex = session.questions.length - 1;

    await interviewRepo.update(interviewId, {
      answers: session.answers,
      evaluations: session.evaluations,
      questions: session.questions,
      currentQuestionIndex: session.currentQuestionIndex
    });

    return {
      interviewId,
      evaluatedQuestionNumber: session.questions.length - 1,
      scores: evaluation.scores,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      missingConcepts: evaluation.missingConcepts,
      improvedSampleAnswer: evaluation.improvedSampleAnswer,
      nextQuestion: nextQuestionObj
    };
  }

  static async finishInterview(userId, interviewId) {
    const session = await interviewRepo.findById(interviewId);
    if (!session || session.userId !== userId) {
      throw new NotFoundError(`Interview session ${interviewId} not found`);
    }

    if (session.answers.length === 0) {
      throw new BadRequestError('Cannot finish interview session with zero answered questions');
    }

    const totalEvals = session.evaluations.length;
    let sumTech = 0;
    let sumRelevance = 0;
    let sumClarity = 0;
    let sumOverall = 0;

    const allStrengths = [];
    const allAreasToImprove = [];

    session.evaluations.forEach((ev) => {
      sumTech += ev.scores?.technicalCorrectness || 0;
      sumRelevance += ev.scores?.relevance || 0;
      sumClarity += ev.scores?.clarity || 0;
      sumOverall += ev.scores?.overallScore || 0;
      if (Array.isArray(ev.strengths)) allStrengths.push(...ev.strengths);
      if (Array.isArray(ev.missingConcepts)) allAreasToImprove.push(...ev.missingConcepts);
    });

    const averageScores = {
      technicalCorrectness: Math.round(sumTech / totalEvals),
      relevance: Math.round(sumRelevance / totalEvals),
      clarity: Math.round(sumClarity / totalEvals),
      overallScore: Math.round(sumOverall / totalEvals)
    };

    const summaryReport = {
      interviewId,
      role: session.role,
      difficulty: session.difficulty,
      totalQuestionsAnswered: session.answers.length,
      averageScores,
      keyStrengths: [...new Set(allStrengths)].slice(0, 5),
      recommendedAreasToImprove: [...new Set(allAreasToImprove)].slice(0, 5),
      verdict: averageScores.overallScore >= 75 ? 'Strong Hire' : (averageScores.overallScore >= 60 ? 'Hire' : 'Needs Practice'),
      completedAt: new Date().toISOString()
    };

    await interviewRepo.update(interviewId, {
      status: 'completed',
      summaryReport,
      completedAt: new Date().toISOString()
    });

    // Award XP
    await GamificationService.recordActivity(userId, {
      xpGain: XP_REWARDS.MOCK_INTERVIEW_COMPLETED,
      activityType: 'mock_interview'
    });

    return summaryReport;
  }

  static async getHistory(userId) {
    const all = await interviewRepo.find((s) => s.userId === userId);
    return all.map((s) => ({
      interviewId: s.id,
      role: s.role,
      difficulty: s.difficulty,
      status: s.status,
      questionsAnswered: s.answers?.length || 0,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      summaryReport: s.summaryReport || null
    }));
  }
}
