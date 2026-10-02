import { Router } from 'express';
import { z } from 'zod';
import { PlannerController } from '../controllers/planner.controller.js';
import { validate } from '../middleware/validate.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { ROLES, EXPERIENCE_LEVELS } from '../config/constants.js';

const router = Router();

const generateBodySchema = z.object({
  targetRole: z.enum(ROLES).optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
  daysLeft: z.number().min(1).max(365).optional(),
  dailyHours: z.number().min(1).max(16).optional(),
  currentSkills: z.array(z.string()).optional(),
  targetCompanies: z.array(z.string()).optional(),
  preferredLanguage: z.enum(['English', 'Hindi', 'Hinglish']).optional()
});

const updateDayBodySchema = z.object({
  completed: z.boolean().optional(),
  rescheduledTo: z.string().optional()
});

router.post('/generate', aiRateLimiter, validate({ body: generateBodySchema }), PlannerController.generate);
router.get('/', PlannerController.getPlan);
router.patch('/day/:id', validate({ body: updateDayBodySchema }), PlannerController.updateDay);

export default router;
