import { z } from 'zod';
import { plannerRepo, profileRepo, assessmentRepo } from '../repositories/index.js';
import { aiProvider } from './ai/index.js';
import { buildPlannerPrompt } from './ai/prompts/planner.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

const blockSchema = z.object({
  type: z.enum(['Learn', 'Practice', 'Quiz', 'Revision']),
  title: z.string(),
  description: z.string(),
  durationMinutes: z.number().default(45),
  resources: z.array(z.string()).optional(),
  problems: z.array(z.string()).optional()
});

const dayPlanSchema = z.object({
  dayNumber: z.number(),
  dateOffsetDays: z.number(),
  focusTopic: z.string(),
  estimatedMinutes: z.number(),
  completed: z.boolean().default(false),
  blocks: z.array(blockSchema)
});

const plannerOutputSchema = z.object({
  summary: z.string(),
  totalDays: z.number(),
  dailyHours: z.number(),
  days: z.array(dayPlanSchema)
});

export class PlannerService {
  static async generatePlan(userId, customOptions = {}) {
    const profile = await profileRepo.findById(userId);
    const assessment = await assessmentRepo.findById(userId);

    const targetRole = customOptions.targetRole || profile?.targetRole || 'SDE';
    const experienceLevel = customOptions.experienceLevel || profile?.experienceLevel || 'fresher';
    const dailyHours = Number(customOptions.dailyHours || profile?.dailyHours || 3);
    
    // Calculate days left to placement
    let daysLeft = customOptions.daysLeft;
    if (!daysLeft && profile?.placementDate) {
      const targetTime = new Date(profile.placementDate).getTime();
      const now = new Date().getTime();
      daysLeft = Math.max(1, Math.round((targetTime - now) / (1000 * 60 * 60 * 24)));
    }
    daysLeft = Math.min(Math.max(Number(daysLeft) || 14, 1), 30);

    const promptText = buildPlannerPrompt({
      targetRole,
      experienceLevel,
      daysLeft,
      dailyHours,
      currentSkills: customOptions.currentSkills || profile?.currentSkills || [],
      targetCompanies: customOptions.targetCompanies || profile?.targetCompanies || [],
      assessmentResults: assessment ? { weaknesses: assessment.weaknesses, strengths: assessment.strengths, overallPercentage: assessment.overallPercentage } : null,
      preferredLanguage: customOptions.preferredLanguage || profile?.preferredLanguage || 'English'
    });

    const aiPlan = await aiProvider.generateJSON({
      messages: [{ role: 'user', content: promptText }],
      systemPrompt: 'You are an elite placement roadmap curriculum architect.',
      schema: plannerOutputSchema,
      maxTokens: 3500
    });

    const planDoc = {
      userId,
      targetRole,
      experienceLevel,
      dailyHours,
      totalDays: aiPlan.totalDays || daysLeft,
      summary: aiPlan.summary,
      days: (aiPlan.days || []).map((d, index) => ({
        id: `day_${d.dayNumber || index + 1}`,
        dayNumber: d.dayNumber || index + 1,
        dateOffsetDays: d.dateOffsetDays ?? index,
        focusTopic: d.focusTopic,
        estimatedMinutes: d.estimatedMinutes || dailyHours * 60,
        completed: false,
        blocks: d.blocks || []
      })),
      generatedAt: new Date().toISOString()
    };

    return plannerRepo.upsert(userId, planDoc);
  }

  static async getPlan(userId) {
    const plan = await plannerRepo.findById(userId);
    if (!plan) {
      return null;
    }
    return plan;
  }

  static async updateDayStatus(userId, dayId, { completed, rescheduledTo }) {
    const plan = await plannerRepo.findById(userId);
    if (!plan) {
      throw new NotFoundError('No study plan found for user. Generate a plan first.');
    }

    const day = (plan.days || []).find((d) => d.id === dayId || String(d.dayNumber) === String(dayId));
    if (!day) {
      throw new NotFoundError(`Day ${dayId} not found in current study plan`);
    }

    if (typeof completed === 'boolean') {
      day.completed = completed;
      day.completedAt = completed ? new Date().toISOString() : null;
    }

    if (rescheduledTo) {
      day.rescheduledTo = rescheduledTo;
    }

    const updated = await plannerRepo.update(userId, { days: plan.days });
    return updated;
  }
}
