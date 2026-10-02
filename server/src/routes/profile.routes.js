import { Router } from 'express';
import { z } from 'zod';
import { ProfileController } from '../controllers/profile.controller.js';
import { validate } from '../middleware/validate.js';
import { ROLES, EXPERIENCE_LEVELS } from '../config/constants.js';

const router = Router();

const profileBodySchema = z.object({
  targetRole: z.enum(ROLES),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  placementDate: z.string().optional(),
  dailyHours: z.number().min(1).max(16).default(3),
  currentSkills: z.array(z.string()).default([]),
  targetCompanies: z.array(z.string()).default([]),
  preferredLanguage: z.enum(['English', 'Hindi', 'Hinglish']).default('English')
});

router.get('/', ProfileController.getProfile);
router.post('/', validate({ body: profileBodySchema }), ProfileController.saveProfile);

export default router;
