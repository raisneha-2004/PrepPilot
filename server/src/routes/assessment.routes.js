import { Router } from 'express';
import { z } from 'zod';
import { AssessmentController } from '../controllers/assessment.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const startAssessmentSchema = z.object({
  role: z.enum(['SDE', 'Frontend', 'Backend', 'AI-ML', 'AI/ML']).optional().default('SDE'),
  mode: z.enum(['quick', 'standard', 'deep_dive']).optional().default('standard'),
  language: z.enum(['Python', 'Java', 'C/C++', 'JavaScript']).optional().default('JavaScript')
});

const progressSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(0).max(3)).optional().default({}),
  timeRemainingSeconds: z.number().min(0).optional(),
  markedForReview: z.array(z.string()).optional()
});

const submitAssessmentSchema = z.object({
  answers: z.union([
    z.record(z.string(), z.number().int().min(0).max(3)),
    z.array(
      z.object({
        questionId: z.string(),
        section: z.string().optional(),
        selectedOption: z.number().int().min(0).max(3)
      })
    )
  ]),
  timeTakenSeconds: z.number().min(0).default(0),
  assessmentId: z.string().optional()
});

// Routes
router.get('/config', AssessmentController.getConfig);
router.post('/start', validate({ body: startAssessmentSchema }), AssessmentController.startAssessment);
router.patch('/:id/progress', validate({ body: progressSchema }), AssessmentController.saveProgress);
router.post('/:id/submit', validate({ body: submitAssessmentSchema }), AssessmentController.submitAssessment);
router.post('/submit', validate({ body: submitAssessmentSchema }), AssessmentController.submitAssessment);
router.get('/history', AssessmentController.getHistory);
router.get('/latest', AssessmentController.getLatest);
router.get('/questions', AssessmentController.getQuestions);

export default router;
