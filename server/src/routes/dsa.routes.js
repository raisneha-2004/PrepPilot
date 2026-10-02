import { Router } from 'express';
import { z } from 'zod';
import { DSAController } from '../controllers/dsa.controller.js';
import { validate } from '../middleware/validate.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const getProblemsQuerySchema = z.object({
  topic: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  search: z.string().optional()
});

const hintBodySchema = z.object({
  level: z.coerce.number().min(1).max(3).default(1)
});

const feedbackBodySchema = z.object({
  language: z.string().min(1).default('javascript'),
  code: z.string().min(1, 'Code snippet cannot be empty'),
  testResults: z.any().optional(),
  userMessage: z.string().optional()
});

const executeBodySchema = z.object({
  language: z.string().min(1),
  sourceCode: z.string().min(1),
  stdin: z.string().optional()
});

router.get('/topics', DSAController.getTopics);
router.get('/problems', validate({ query: getProblemsQuerySchema }), DSAController.getProblems);
router.get('/problems/:id', DSAController.getProblemById);
router.post('/problems/:id/hint', validate({ body: hintBodySchema }), DSAController.getHint);
router.post('/problems/:id/feedback', aiRateLimiter, validate({ body: feedbackBodySchema }), DSAController.getFeedback);
router.post('/execute', validate({ body: executeBodySchema }), DSAController.executeCode);

export default router;
