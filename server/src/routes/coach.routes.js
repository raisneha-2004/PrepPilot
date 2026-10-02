import { Router } from 'express';
import { z } from 'zod';
import { CoachController } from '../controllers/coach.controller.js';
import { validate } from '../middleware/validate.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const messageBodySchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(3000),
  stream: z.boolean().optional().default(false)
});

router.post('/message', aiRateLimiter, validate({ body: messageBodySchema }), CoachController.sendMessage);
router.get('/history', CoachController.getHistory);

export default router;
