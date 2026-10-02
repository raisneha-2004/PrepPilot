import { Router } from 'express';
import { z } from 'zod';
import { DailyController } from '../controllers/daily.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const completeBodySchema = z.object({
  dateStr: z.string().optional(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOption: z.number().int().optional()
    })
  ).default([]),
  timeTakenSeconds: z.number().min(0).default(0)
});

router.get('/', DailyController.getDaily);
router.post('/complete', validate({ body: completeBodySchema }), DailyController.completeDaily);

export default router;
