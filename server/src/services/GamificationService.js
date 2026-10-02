import { gamificationRepo } from '../repositories/index.js';
import { LEVEL_THRESHOLDS, BADGES, XP_REWARDS } from '../config/constants.js';

export class GamificationService {
  static async getGamificationState(userId) {
    let state = await gamificationRepo.findById(userId);
    if (!state) {
      state = {
        userId,
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        streakFreezes: 1, // Start with 1 streak freeze
        lastActiveDate: null,
        lastCompletedDate: null,
        freezeUsedNotice: null,
        earnedBadges: [],
        stats: {
          totalQuestionsSolved: 0,
          dsaSolved: 0,
          aptitudeSolved: 0,
          csSolved: 0,
          mockInterviewsCompleted: 0,
          revisionSessionsCompleted: 0,
          dailyChallengesCompleted: 0,
          topicCounts: {}
        }
      };
      state = await gamificationRepo.create({ id: userId, ...state });
    }
    if (state.streakFreezes === undefined) {
      state.streakFreezes = 1;
    }
    return state;
  }

  /**
   * Timezone-aware streak computation with Streak Freeze mechanics
   * @param {number} currentStreak
   * @param {string|null} lastActiveDate 'YYYY-MM-DD'
   * @param {string} currentDate 'YYYY-MM-DD'
   * @param {number} availableFreezes
   */
  static calculateStreak(currentStreak, lastActiveDate, currentDate, availableFreezes = 0) {
    if (!lastActiveDate) {
      return { streak: 1, isNewDay: true, freezeUsed: false, remainingFreezes: availableFreezes, newFreezes: availableFreezes };
    }

    if (lastActiveDate === currentDate) {
      return { streak: currentStreak || 1, isNewDay: false, freezeUsed: false, remainingFreezes: availableFreezes, newFreezes: availableFreezes };
    }

    const lastDate = new Date(`${lastActiveDate}T00:00:00Z`);
    const currDate = new Date(`${currentDate}T00:00:00Z`);
    const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Successive day completion
      return { streak: (currentStreak || 0) + 1, isNewDay: true, freezeUsed: false, remainingFreezes: availableFreezes, newFreezes: availableFreezes };
    } else if (diffDays === 2 && availableFreezes > 0) {
      // Exactly 1 day missed, but Streak Freeze is available -> Consume 1 freeze & preserve streak
      const remaining = availableFreezes - 1;
      return {
        streak: (currentStreak || 0) + 1,
        isNewDay: true,
        freezeUsed: true,
        remainingFreezes: remaining,
        newFreezes: remaining
      };
    } else if (diffDays > 1) {
      // Missed without available freeze -> reset to 1
      return { streak: 1, isNewDay: true, freezeUsed: false, remainingFreezes: availableFreezes, newFreezes: availableFreezes };
    }

    return { streak: currentStreak || 1, isNewDay: false, freezeUsed: false, remainingFreezes: availableFreezes, newFreezes: availableFreezes };
  }

  /**
   * Record user activity, recalculate streak and award XP
   */
  static async recordActivity(userId, { timezone = 'UTC', xpGain = 0, activityType = 'general', topic = null }) {
    const state = await this.getGamificationState(userId);

    // Format current date in user's timezone
    const now = new Date();
    let currentDate;
    try {
      currentDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(now);
    } catch {
      currentDate = now.toISOString().split('T')[0];
    }

    const lastDate = state.lastCompletedDate || state.lastActiveDate;
    const currentFreezes = state.streakFreezes !== undefined ? state.streakFreezes : 1;

    const { streak, isNewDay, freezeUsed, remainingFreezes } = this.calculateStreak(
      state.currentStreak,
      lastDate,
      currentDate,
      currentFreezes
    );

    let totalXpGain = xpGain;
    if (isNewDay && streak > 1) {
      // Award daily streak bonus
      totalXpGain += XP_REWARDS.STREAK_BONUS_PER_DAY;
    }

    const updatedXp = (state.xp || 0) + totalXpGain;
    const longestStreak = Math.max(state.longestStreak || 0, streak);

    // Award +1 streak freeze when hitting any 7-day milestone (max 3 freezes)
    let newFreezes = remainingFreezes;
    if (isNewDay && streak >= 7 && streak % 7 === 0) {
      newFreezes = Math.min(3, newFreezes + 1);
    }

    // Freeze notice if consumed
    let freezeNotice = state.freezeUsedNotice;
    if (freezeUsed) {
      freezeNotice = `Your streak freeze protected your ${state.currentStreak}-day streak!`;
    }

    // Update stats counters
    const stats = state.stats || {
      totalQuestionsSolved: 0,
      dsaSolved: 0,
      aptitudeSolved: 0,
      csSolved: 0,
      mockInterviewsCompleted: 0,
      revisionSessionsCompleted: 0,
      dailyChallengesCompleted: 0,
      topicCounts: {}
    };

    if (activityType === 'dsa') {
      stats.dsaSolved = (stats.dsaSolved || 0) + 1;
      stats.totalQuestionsSolved = (stats.totalQuestionsSolved || 0) + 1;
    } else if (activityType === 'aptitude') {
      stats.aptitudeSolved = (stats.aptitudeSolved || 0) + 1;
      stats.totalQuestionsSolved = (stats.totalQuestionsSolved || 0) + 1;
    } else if (activityType === 'cs') {
      stats.csSolved = (stats.csSolved || 0) + 1;
      stats.totalQuestionsSolved = (stats.totalQuestionsSolved || 0) + 1;
    } else if (activityType === 'mock_interview') {
      stats.mockInterviewsCompleted = (stats.mockInterviewsCompleted || 0) + 1;
    } else if (activityType === 'revision') {
      stats.revisionSessionsCompleted = (stats.revisionSessionsCompleted || 0) + 1;
    } else if (activityType === 'daily_challenge') {
      stats.dailyChallengesCompleted = (stats.dailyChallengesCompleted || 0) + 1;
    }

    if (topic) {
      stats.topicCounts = stats.topicCounts || {};
      stats.topicCounts[topic] = (stats.topicCounts[topic] || 0) + 1;
    }

    // Check & evaluate badges
    const earnedBadges = [...(state.earnedBadges || [])];
    const newlyUnlockedBadges = [];
    const checkBadge = (id) => {
      if (!earnedBadges.includes(id)) {
        earnedBadges.push(id);
        const bInfo = BADGES.find((b) => b.id === id);
        if (bInfo) newlyUnlockedBadges.push(bInfo);
      }
    };

    if (stats.totalQuestionsSolved >= 1 || stats.mockInterviewsCompleted >= 1) checkBadge('first_step');
    if ((stats.topicCounts?.['Arrays'] || 0) >= 10) checkBadge('array_master');
    if ((stats.topicCounts?.['SQL'] || 0) >= 10 || (stats.topicCounts?.['sql'] || 0) >= 10) checkBadge('sql_beginner');
    if (streak >= 3) checkBadge('streak_3');
    if (streak >= 7) checkBadge('streak_7');
    if (streak >= 14) checkBadge('streak_14');
    if (streak >= 30) checkBadge('streak_30');
    if (streak >= 60) checkBadge('streak_60');
    if (streak >= 100) checkBadge('streak_100');
    if (stats.totalQuestionsSolved >= 100) checkBadge('questions_100');
    if (stats.mockInterviewsCompleted >= 5) checkBadge('mock_champion');
    if (stats.dsaSolved >= 25) checkBadge('dsa_pro');

    const updated = await gamificationRepo.update(userId, {
      xp: updatedXp,
      currentStreak: streak,
      longestStreak,
      streakFreezes: newFreezes,
      lastActiveDate: currentDate,
      lastCompletedDate: currentDate,
      freezeUsedNotice: freezeNotice,
      earnedBadges,
      stats
    });

    return {
      ...updated,
      freezeUsed,
      newlyUnlockedBadges
    };
  }

  static async addXP(userId, amount, _reason = '') {
    return this.recordActivity(userId, { xpGain: amount });
  }

  static getLevelInfo(totalXp = 0) {
    let currentLevel = LEVEL_THRESHOLDS[0];
    let nextLevel = LEVEL_THRESHOLDS[1];

    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (totalXp >= LEVEL_THRESHOLDS[i].minXp) {
        currentLevel = LEVEL_THRESHOLDS[i];
        nextLevel = LEVEL_THRESHOLDS[i + 1] || null;
      } else {
        break;
      }
    }

    const minXp = currentLevel.minXp;
    const maxXp = nextLevel ? nextLevel.minXp : currentLevel.minXp * 2;
    const progressPercent = nextLevel
      ? Math.min(100, Math.max(0, Math.round(((totalXp - minXp) / (maxXp - minXp)) * 100)))
      : 100;

    return {
      level: currentLevel.level,
      title: currentLevel.title,
      currentXp: totalXp,
      nextLevelXp: nextLevel ? nextLevel.minXp : null,
      progressPercent
    };
  }

  static async getFullGamificationStatus(userId) {
    const state = await this.getGamificationState(userId);
    const levelInfo = this.getLevelInfo(state.xp || 0);

    const detailedBadges = BADGES.map((b) => ({
      ...b,
      unlocked: (state.earnedBadges || []).includes(b.id)
    }));

    return {
      ...levelInfo,
      currentStreak: state.currentStreak || 0,
      longestStreak: state.longestStreak || 0,
      streakFreezes: state.streakFreezes !== undefined ? state.streakFreezes : 1,
      lastActiveDate: state.lastActiveDate,
      lastCompletedDate: state.lastCompletedDate || state.lastActiveDate,
      freezeUsedNotice: state.freezeUsedNotice || null,
      badges: detailedBadges,
      stats: state.stats || {}
    };
  }

  static async dismissFreezeNotice(userId) {
    const state = await this.getGamificationState(userId);
    if (state.freezeUsedNotice) {
      await gamificationRepo.update(userId, { freezeUsedNotice: null });
    }
    return { success: true };
  }
}
