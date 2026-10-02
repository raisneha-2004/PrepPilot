import { describe, it, expect } from 'vitest';
import { PlannerService } from '../src/services/PlannerService.js';

describe('Study Planner Service', () => {
  const testUserId = 'test-user-planner-001';

  it('should generate a structured day-wise plan with 4 required blocks per day', async () => {
    const plan = await PlannerService.generatePlan(testUserId, {
      targetRole: 'SDE',
      experienceLevel: 'fresher',
      daysLeft: 14,
      dailyHours: 3
    });

    expect(plan).toBeDefined();
    expect(plan.userId).toBe(testUserId);
    expect(plan.days).toBeDefined();
    expect(plan.days.length).toBe(14);

    const firstDay = plan.days[0];
    expect(firstDay).toHaveProperty('focusTopic');
    expect(firstDay).toHaveProperty('blocks');
    expect(firstDay.blocks.length).toBe(4);

    const blockTypes = firstDay.blocks.map((b) => b.type);
    expect(blockTypes).toContain('Learn');
    expect(blockTypes).toContain('Practice');
    expect(blockTypes).toContain('Quiz');
    expect(blockTypes).toContain('Revision');
  });

  it('should allow marking a day complete or rescheduling', async () => {
    const updated = await PlannerService.updateDayStatus(testUserId, 'day_1', {
      completed: true
    });

    const day1 = updated.days.find((d) => d.id === 'day_1');
    expect(day1.completed).toBe(true);
    expect(day1.completedAt).toBeDefined();
  });
});
