import { Router } from 'express';
import { GamificationController } from '../controllers/gamification.controller.js';

const router = Router();

router.get('/', GamificationController.getGamification);
router.post('/dismiss-freeze', GamificationController.dismissFreeze);

export default router;
