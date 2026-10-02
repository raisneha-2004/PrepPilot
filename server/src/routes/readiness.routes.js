import { Router } from 'express';
import { ReadinessController } from '../controllers/readiness.controller.js';

const router = Router();

router.get('/readiness', ReadinessController.getReadiness);
router.get('/progress', ReadinessController.getProgress);

export default router;
