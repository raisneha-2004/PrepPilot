import { Router } from 'express';
import { z } from 'zod';
import { AptitudeController } from '../controllers/aptitude.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const getQuestionsQuerySchema = z.object({
  topic: z.string().optional(),
  subtopic: z.string().optional(),
  difficulty: z.string().optional(),
  mode: z.enum(['practice', 'exam', 'both']).default('practice'),
  count: z.union([z.coerce.number().min(1).max(100), z.literal('all')]).default(10),
  exclude: z.union([z.string(), z.array(z.string())]).optional()
});

const practiceAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedOption: z.number().int().min(0).max(3)
});

const startExamSchema = z.object({
  preset: z.enum(['mini', 'sectional', 'full', 'custom']).default('mini'),
  topic: z.string().optional(),
  count: z.number().int().min(1).max(100).optional(),
  durationMinutes: z.number().int().min(1).max(180).optional(),
  negativeMarking: z.boolean().default(true)
});

const submitExamSchema = z.object({
  answers: z.record(z.string(), z.number().int()).default({}),
  timeTakenSeconds: z.number().min(0).default(0),
  tabSwitches: z.number().min(0).default(0)
});

const submitBodySchema = z.object({
  mode: z.enum(['practice', 'exam']).default('practice'),
  answers: z.union([
    z.record(z.string(), z.number().int()),
    z.array(
      z.object({
        questionId: z.string(),
        selectedOption: z.number().int().min(0).max(3)
      })
    )
  ]),
  timeTakenSeconds: z.number().min(0).default(0),
  examId: z.string().optional(),
  tabSwitches: z.number().min(0).default(0)
});

router.get('/topics', AptitudeController.getTopics);
router.get('/questions', validate({ query: getQuestionsQuerySchema }), AptitudeController.getQuestions);
router.post('/practice/answer', validate({ body: practiceAnswerSchema }), AptitudeController.evaluatePracticeAnswer);
router.post('/exam/start', validate({ body: startExamSchema }), AptitudeController.startExam);
router.post('/exam/:id/submit', validate({ body: submitExamSchema }), AptitudeController.submitExam);
router.get('/exam/history', AptitudeController.getExamHistory);
router.post('/submit', validate({ body: submitBodySchema }), AptitudeController.submit);

export default router;
