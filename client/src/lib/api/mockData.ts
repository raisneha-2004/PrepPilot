export const mockProfile = {
  targetRole: 'SDE',
  experienceLevel: 'fresher',
  placementDate: '2026-11-30',
  dailyHours: 3,
  currentSkills: ['Java', 'Data Structures', 'SQL', 'JavaScript', 'React'],
  targetCompanies: ['Google', 'Amazon', 'Microsoft', 'Flipkart'],
  preferredLanguage: 'English',
  onboarded: true
};

export const mockReadiness = {
  readinessScore: 78,
  scale: '0-100 (Descriptive Tracked Metric)',
  disclaimer: 'The Placement Readiness Score is a descriptive metric reflecting your tracked preparation activity, problem-solving accuracy, and mock interview performance across PrepPilot modules. It does NOT represent a statistical probability of job selection or placement guarantee.',
  formula: {
    description: 'ReadinessScore = (DSA * 0.30) + (Aptitude * 0.20) + (CSCore * 0.20) + (MockInterview * 0.20) + (Consistency * 0.10)',
    weights: { dsa: 0.3, aptitude: 0.2, csCore: 0.2, interview: 0.2, consistency: 0.1 }
  },
  breakdown: {
    dsa: { score: 82, weight: 0.3, metric: '18 problems solved', status: 'Strong' },
    aptitude: { score: 75, weight: 0.2, metric: '6 tests taken', status: 'Strong' },
    csCore: { score: 80, weight: 0.2, metric: 'Assessment completed', status: 'Strong' },
    interview: { score: 72, weight: 0.2, metric: '3 mock interviews completed', status: 'Strong' },
    consistency: { score: 85, weight: 0.1, metric: '6 day streak', status: 'Excellent' }
  }
};

export const mockGamification = {
  level: 4,
  title: 'Problem Solver',
  currentXp: 1450,
  nextLevelXp: 2000,
  progressPercent: 45,
  currentStreak: 6,
  longestStreak: 12,
  streakFreezes: 1,
  lastCompletedDate: '2026-09-28',
  freezeUsedNotice: null,
  badges: [
    { id: 'first_step', name: 'First Step', description: 'Completed your first assessment or problem', icon: '🚀', unlocked: true },
    { id: 'array_master', name: 'Array Master', description: 'Solved 10+ Array problems', icon: '📊', unlocked: true },
    { id: 'sql_beginner', name: 'SQL Beginner', description: 'Answered 10+ SQL questions correctly', icon: '🗄️', unlocked: true },
    { id: 'streak_3', name: 'Bronze Streak', description: 'Maintained a 3-day continuous preparation streak', icon: '🥉', tier: 'Bronze', unlocked: true },
    { id: 'streak_7', name: 'Silver Streak', description: 'Maintained a 7-day continuous preparation streak', icon: '🥈', tier: 'Silver', unlocked: false },
    { id: 'streak_14', name: 'Gold Streak', description: 'Maintained a 14-day continuous preparation streak', icon: '🥇', tier: 'Gold', unlocked: false },
    { id: 'streak_30', name: 'Platinum Streak', description: 'Maintained a 30-day continuous preparation streak', icon: '⚡', tier: 'Platinum', unlocked: false },
    { id: 'streak_60', name: 'Diamond Streak', description: 'Maintained a 60-day continuous preparation streak', icon: '💎', tier: 'Diamond', unlocked: false },
    { id: 'streak_100', name: 'Centurion Streak', description: 'Maintained a 100-day continuous preparation streak', icon: '👑', tier: 'Master', unlocked: false },
    { id: 'mock_champion', name: 'Interview Ready', description: 'Completed 5 mock interview sessions', icon: '🎙️', unlocked: false }
  ],
  stats: {
    totalQuestionsSolved: 54,
    dsaSolved: 18,
    aptitudeSolved: 24,
    csSolved: 12,
    mockInterviewsCompleted: 3
  }
};

export const mockPlanner = {
  totalDays: 14,
  dailyHours: 3,
  summary: '14-Day Intensive Placement Roadmap focusing on core DSA patterns, High-frequency SQL, and Mock Interviews.',
  days: Array.from({ length: 14 }, (_, i) => ({
    id: `day_${i + 1}`,
    dayNumber: i + 1,
    dateOffsetDays: i,
    focusTopic: i % 3 === 0 ? 'Arrays & Two Pointers' : (i % 3 === 1 ? 'Trees & Binary Search' : 'DBMS & SQL Aggregates'),
    estimatedMinutes: 180,
    completed: i < 3,
    blocks: [
      { type: 'Learn', title: 'Concept Foundations', description: 'Master two-pointer patterns and edge cases', durationMinutes: 45 },
      { type: 'Practice', title: 'Coding Workout', description: 'Solve 2 Medium problems', durationMinutes: 75, problems: ['Two Sum', 'Container With Most Water'] },
      { type: 'Quiz', title: 'Speed Checkpoint', description: '5 conceptual MCQs on current topic', durationMinutes: 30 },
      { type: 'Revision', title: 'Spaced Flashcards', description: 'Review past mistakes and formula notes', durationMinutes: 30 }
    ]
  }))
};
