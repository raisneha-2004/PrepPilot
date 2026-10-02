import {
  READINESS_WEIGHTS,
  READINESS_DISCLAIMER
} from '../config/constants.js';
import {
  dsaRepo,
  aptitudeRepo,
  interviewRepo,
  assessmentRepo,
  gamificationRepo
} from '../repositories/index.js';
import { GamificationService } from './GamificationService.js';

export class ReadinessService {
  /**
   * Calculates deterministic placement readiness score from tracked metrics
   */
  static async calculateReadinessScore(userId) {
    // 1. DSA Component (30%)
    const dsaSubmissions = await dsaRepo.find((d) => d.userId === userId);
    const dsaSolvedCount = dsaSubmissions.filter((d) => d.solved).length;
    // Normalized out of target 30 solved problems
    const dsaScore = Math.min(100, Math.round((dsaSolvedCount / 30) * 100));

    // 2. Aptitude Component (20%)
    const aptSubmissions = await aptitudeRepo.find((a) => a.userId === userId);
    let aptitudeScore = 0;
    if (aptSubmissions.length > 0) {
      const avgPct =
        aptSubmissions.reduce((acc, curr) => acc + (curr.scorePercentage || 0), 0) /
        aptSubmissions.length;
      aptitudeScore = Math.round(avgPct);
    }

    // 3. CS Core Component (20%)
    const assessment = await assessmentRepo.findById(userId);
    let csScore = 50; // Default baseline
    if (assessment?.overallPercentage !== undefined) {
      csScore = assessment.overallPercentage;
    }

    // 4. Mock Interview Component (20%)
    const interviews = await interviewRepo.find((i) => i.userId === userId && i.status === 'completed');
    let interviewScore = 0;
    if (interviews.length > 0) {
      const avgScore =
        interviews.reduce(
          (acc, curr) => acc + (curr.summaryReport?.averageScores?.overallScore || 70),
          0
        ) / interviews.length;
      interviewScore = Math.round(avgScore);
    } else {
      // Baseline minimal if no mock interview completed yet
      interviewScore = 30;
    }

    // 5. Consistency Component (10%)
    const gamification = await gamificationRepo.findById(userId);
    const currentStreak = gamification?.currentStreak || 0;
    // Normalized out of 14-day streak target
    const consistencyScore = Math.min(100, Math.round((currentStreak / 14) * 100));

    // Weighted Overall Calculation
    const overallReadinessScore = Math.round(
      dsaScore * READINESS_WEIGHTS.dsa +
      aptitudeScore * READINESS_WEIGHTS.aptitude +
      csScore * READINESS_WEIGHTS.csCore +
      interviewScore * READINESS_WEIGHTS.interview +
      consistencyScore * READINESS_WEIGHTS.consistency
    );

    return {
      readinessScore: overallReadinessScore,
      scale: '0-100 (Descriptive Tracked Metric)',
      disclaimer: READINESS_DISCLAIMER,
      formula: {
        description: 'ReadinessScore = (DSA * 0.30) + (Aptitude * 0.20) + (CSCore * 0.20) + (MockInterview * 0.20) + (Consistency * 0.10)',
        weights: READINESS_WEIGHTS
      },
      breakdown: {
        dsa: {
          score: dsaScore,
          weight: READINESS_WEIGHTS.dsa,
          metric: `${dsaSolvedCount} problems solved`,
          status: dsaScore >= 70 ? 'Strong' : (dsaScore >= 40 ? 'Moderate' : 'Needs Focus')
        },
        aptitude: {
          score: aptitudeScore,
          weight: READINESS_WEIGHTS.aptitude,
          metric: `${aptSubmissions.length} tests taken`,
          status: aptitudeScore >= 70 ? 'Strong' : (aptitudeScore >= 40 ? 'Moderate' : 'Needs Focus')
        },
        csCore: {
          score: csScore,
          weight: READINESS_WEIGHTS.csCore,
          metric: assessment ? 'Assessment completed' : 'Initial assessment pending',
          status: csScore >= 70 ? 'Strong' : (csScore >= 40 ? 'Moderate' : 'Needs Focus')
        },
        interview: {
          score: interviewScore,
          weight: READINESS_WEIGHTS.interview,
          metric: `${interviews.length} mock interviews completed`,
          status: interviewScore >= 70 ? 'Strong' : (interviewScore >= 40 ? 'Moderate' : 'Needs Focus')
        },
        consistency: {
          score: consistencyScore,
          weight: READINESS_WEIGHTS.consistency,
          metric: `${currentStreak} day streak`,
          status: consistencyScore >= 70 ? 'Excellent' : 'Building Habit'
        }
      },
      calculatedAt: new Date().toISOString()
    };
  }

  static async getOverallProgress(userId) {
    const gamification = await GamificationService.getFullGamificationStatus(userId);
    const assessment = await assessmentRepo.findById(userId);
    const dsaSubmissions = await dsaRepo.find((d) => d.userId === userId);
    const interviews = await interviewRepo.find((i) => i.userId === userId);

    return {
      userId,
      xp: gamification.currentXp,
      level: gamification.level,
      levelTitle: gamification.title,
      progressPercent: gamification.progressPercent,
      currentStreak: gamification.currentStreak,
      longestStreak: gamification.longestStreak,
      badges: gamification.badges,
      totalQuestionsSolved: gamification.stats.totalQuestionsSolved || 0,
      dsaSolved: dsaSubmissions.filter((d) => d.solved).length,
      mockInterviewsCompleted: interviews.filter((i) => i.status === 'completed').length,
      weakAreas: assessment?.weaknesses || ['Data Structures', 'Quantitative Aptitude'],
      strengths: assessment?.strengths || ['Problem Solving']
    };
  }
}
