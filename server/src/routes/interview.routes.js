import { Router } from 'express';
import { z } from 'zod';
import { InterviewController } from '../controllers/interview.controller.js';
import { validate } from '../middleware/validate.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { ROLES } from '../config/constants.js';

const router = Router();

const startBodySchema = z.object({
  role: z.enum(ROLES).default('SDE'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  resumeId: z.string().optional().nullable()
});

const answerBodySchema = z.object({
  candidateAnswer: z.string().min(1, 'Answer text cannot be empty'),
  questionId: z.string().optional()
});

router.post('/start', aiRateLimiter, validate({ body: startBodySchema }), InterviewController.start);
router.post('/:id/answer', aiRateLimiter, validate({ body: answerBodySchema }), InterviewController.submitAnswer);
router.post('/:id/finish', InterviewController.finish);
router.get('/history', InterviewController.getHistory);

export default router;
