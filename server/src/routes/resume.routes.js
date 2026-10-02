import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller.js';
import { uploadResume } from '../middleware/upload.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/upload', aiRateLimiter, uploadResume, ResumeController.uploadResume);
router.post('/:id/questions', ResumeController.getPersonalizedQuestions);

export default router;
