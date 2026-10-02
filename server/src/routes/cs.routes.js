import { Router } from 'express';
import { z } from 'zod';
import { CSController } from '../controllers/cs.controller.js';
import { validate } from '../middleware/validate.js';
import { SUBJECTS } from '../config/constants.js';

const router = Router();

const subjectParamSchema = z.object({
  subject: z.enum(SUBJECTS)
});

const submitBodySchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOption: z.number().int().min(0).max(3)
    })
  )
});

router.get('/:subject', validate({ params: subjectParamSchema }), CSController.getSubject);
router.post('/:subject/submit', validate({ params: subjectParamSchema, body: submitBodySchema }), CSController.submitQuiz);

export default router;
