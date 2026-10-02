import { Router } from 'express';
import { z } from 'zod';
import { RevisionController } from '../controllers/revision.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const recordBodySchema = z.object({
  topic: z.string().min(1, 'Topic name is required'),
  questionId: z.string().optional(),
  isCorrect: z.boolean()
});

router.post('/record', validate({ body: recordBodySchema }), RevisionController.record);
router.get('/today', RevisionController.getToday);

export default router;
