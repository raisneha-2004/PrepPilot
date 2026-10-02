import { describe, it, expect } from 'vitest';
import { GamificationService } from '../src/services/GamificationService.js';

describe('Gamification & Streak Logic', () => {
  it('should initialize streak to 1 for first activity', () => {
    const result = GamificationService.calculateStreak(0, null, '2026-09-28');
    expect(result.streak).toBe(1);
    expect(result.isNewDay).toBe(true);
  });

  it('should maintain the same streak when active multiple times on the same date', () => {
    const result = GamificationService.calculateStreak(3, '2026-09-28', '2026-09-28');
    expect(result.streak).toBe(3);
    expect(result.isNewDay).toBe(false);
  });

  it('should increment streak by 1 on consecutive next day', () => {
    const result = GamificationService.calculateStreak(5, '2026-09-27', '2026-09-28');
    expect(result.streak).toBe(6);
    expect(result.isNewDay).toBe(true);
  });

  it('should reset streak to 1 when more than 1 day is skipped', () => {
    const result = GamificationService.calculateStreak(10, '2026-09-20', '2026-09-28');
    expect(result.streak).toBe(1);
    expect(result.isNewDay).toBe(true);
  });

  it('should consume streak freeze and preserve streak when exactly 1 day is missed', () => {
    // Day 1 completed on 2026-09-01
    const day1 = GamificationService.calculateStreak(0, null, '2026-09-01', 1);
    expect(day1.streak).toBe(1);
    expect(day1.freezeUsed).toBe(false);

    // Day 2 completed on 2026-09-02
    const day2 = GamificationService.calculateStreak(day1.streak, '2026-09-01', '2026-09-02', 1);
    expect(day2.streak).toBe(2);
    expect(day2.freezeUsed).toBe(false);

    // Day 3 skipped (2026-09-03 missed). Day 4 completed on 2026-09-04 with 1 freeze available
    const day4WithFreeze = GamificationService.calculateStreak(day2.streak, '2026-09-02', '2026-09-04', 1);
    expect(day4WithFreeze.streak).toBe(3); // Streak preserved & incremented!
    expect(day4WithFreeze.freezeUsed).toBe(true);
    expect(day4WithFreeze.newFreezes).toBe(0);

    // Day 5 completed on 2026-09-05 (consecutive)
    const day5 = GamificationService.calculateStreak(day4WithFreeze.streak, '2026-09-04', '2026-09-05', 0);
    expect(day5.streak).toBe(4);
    expect(day5.freezeUsed).toBe(false);
  });

  it('should reset streak to 1 when a day is missed and no streak freeze is available', () => {
    // Day 1 completed on 2026-09-01, Day 2 missed, Day 3 completed with 0 freezes
    const result = GamificationService.calculateStreak(5, '2026-09-01', '2026-09-03', 0);
    expect(result.streak).toBe(1);
    expect(result.freezeUsed).toBe(false);
    expect(result.newFreezes).toBe(0);
  });

  it('should reset streak to 1 when multiple days are missed even if 1 freeze exists', () => {
    // Missed 3 days (from 2026-09-01 to 2026-09-05)
    const result = GamificationService.calculateStreak(5, '2026-09-01', '2026-09-05', 1);
    expect(result.streak).toBe(1);
    expect(result.freezeUsed).toBe(false);
  });

  it('should compute level information correctly based on XP thresholds', () => {
    const lvl1 = GamificationService.getLevelInfo(50);
    expect(lvl1.level).toBe(1);
    expect(lvl1.title).toBe('Novice Prepster');
    expect(lvl1.nextLevelXp).toBe(200);

    const lvl3 = GamificationService.getLevelInfo(650);
    expect(lvl3.level).toBe(3);
    expect(lvl3.title).toBe('Algorithm Explorer');
    expect(lvl3.nextLevelXp).toBe(1000);
  });
});
