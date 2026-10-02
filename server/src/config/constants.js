export const ROLES = ['SDE', 'Frontend', 'Backend', 'AI-ML'];
export const EXPERIENCE_LEVELS = ['fresher', '1-2-years', '3+-years'];

export const SUBJECTS = ['oop', 'dbms', 'os', 'cn', 'sql'];

export const APTITUDE_TOPICS = [
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
  'Data Interpretation',
  'Probability & Permutations',
  'Speed & Distance',
  'Profit & Loss',
  'Syllogisms',
  'Number Series'
];

export const DSA_TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Stacks & Queues',
  'Binary Search',
  'Greedy'
];

// Readiness Score Weights (Descriptive metric only, never probability of selection)
export const READINESS_WEIGHTS = {
  dsa: 0.30,
  aptitude: 0.20,
  csCore: 0.20,
  interview: 0.20,
  consistency: 0.10
};

export const READINESS_DISCLAIMER =
  'The Placement Readiness Score is a descriptive metric reflecting your tracked preparation activity, problem-solving accuracy, and mock interview performance across PrepPilot modules. It does NOT represent a statistical probability of job selection or placement guarantee.';

// Gamification rules
export const XP_REWARDS = {
  DAILY_CHALLENGE: 100,
  DSA_EASY: 30,
  DSA_MEDIUM: 60,
  DSA_HARD: 100,
  APTITUDE_QUESTION: 10,
  CS_MCQ: 10,
  MOCK_INTERVIEW_COMPLETED: 150,
  RESUME_UPLOAD: 50,
  SPACED_REVISION_SESSION: 40,
  STREAK_BONUS_PER_DAY: 15
};

export const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, title: 'Novice Prepster' },
  { level: 2, minXp: 200, title: 'Code Initiate' },
  { level: 3, minXp: 500, title: 'Algorithm Explorer' },
  { level: 4, minXp: 1000, title: 'Problem Solver' },
  { level: 5, minXp: 2000, title: 'Tech Aspirant' },
  { level: 6, minXp: 3500, title: 'Interview Contender' },
  { level: 7, minXp: 5500, title: 'System Architect' },
  { level: 8, minXp: 8000, title: 'Placement Ace' },
  { level: 9, minXp: 12000, title: 'Grandmaster Engineer' },
  { level: 10, minXp: 18000, title: 'Offer Magnet' }
];

export const BADGES = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Completed your first assessment or problem',
    icon: '🚀'
  },
  {
    id: 'array_master',
    name: 'Array Master',
    description: 'Solved 10+ Array problems',
    icon: '📊'
  },
  {
    id: 'sql_beginner',
    name: 'SQL Beginner',
    description: 'Answered 10+ SQL questions correctly',
    icon: '🗄️'
  },
  {
    id: 'streak_3',
    name: 'Bronze Streak',
    description: 'Maintained a 3-day continuous preparation streak',
    icon: '🥉',
    tier: 'Bronze'
  },
  {
    id: 'streak_7',
    name: 'Silver Streak',
    description: 'Maintained a 7-day continuous preparation streak',
    icon: '🥈',
    tier: 'Silver'
  },
  {
    id: 'streak_14',
    name: 'Gold Streak',
    description: 'Maintained a 14-day continuous preparation streak',
    icon: '🥇',
    tier: 'Gold'
  },
  {
    id: 'streak_30',
    name: 'Platinum Streak',
    description: 'Maintained a 30-day continuous preparation streak',
    icon: '⚡',
    tier: 'Platinum'
  },
  {
    id: 'streak_60',
    name: 'Diamond Streak',
    description: 'Maintained a 60-day continuous preparation streak',
    icon: '💎',
    tier: 'Diamond'
  },
  {
    id: 'streak_100',
    name: 'Centurion Streak',
    description: 'Maintained a 100-day continuous preparation streak',
    icon: '👑',
    tier: 'Master'
  },
  {
    id: 'questions_100',
    name: 'Centurion',
    description: 'Solved 100 total questions across all modules',
    icon: '💯'
  },
  {
    id: 'mock_champion',
    name: 'Interview Ready',
    description: 'Completed 5 mock interview sessions',
    icon: '🎙️'
  },
  {
    id: 'resume_optimized',
    name: 'Resume Polished',
    description: 'Uploaded and analyzed your resume for targeting',
    icon: '📄'
  },
  {
    id: 'dsa_pro',
    name: 'DSA Virtuoso',
    description: 'Solved at least 25 DSA problems',
    icon: '🧠'
  }
];

// Leitner Spaced Revision Box intervals (in days)
export const LEITNER_INTERVALS = {
  1: 1,    // Box 1: review every 1 day
  2: 3,    // Box 2: review every 3 days
  3: 7,    // Box 3: review every 7 days
  4: 14,   // Box 4: review every 14 days
  5: 30    // Box 5: review every 30 days
};

export const MAX_REVISION_BOX = 5;

export const TOKEN_LIMITS = {
  COACH_MAX_HISTORY_TOKENS: 3000,
  COACH_RESPONSE_MAX_TOKENS: 1000,
  INTERVIEW_RESPONSE_MAX_TOKENS: 1200,
  PLANNER_MAX_TOKENS: 2500,
  RESUME_ANALYSIS_MAX_TOKENS: 2000
};
