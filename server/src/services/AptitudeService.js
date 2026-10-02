import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { aptitudeRepo } from '../repositories/index.js';
import { GamificationService } from './GamificationService.js';
import { RevisionService } from './RevisionService.js';
import { XP_REWARDS, APTITUDE_TOPICS } from '../config/constants.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_APTITUDE_PATH = path.resolve(__dirname, '../data/seedAptitude.json');

let cachedAptitude = null;

// In-memory active exam sessions (examId -> session details with server answer key)
const activeExamSessions = new Map();

async function getSeedAptitude() {
  if (!cachedAptitude) {
    const raw = await fs.readFile(SEED_APTITUDE_PATH, 'utf-8');
    cachedAptitude = JSON.parse(raw);
  }
  return cachedAptitude;
}

/**
 * Seeded shuffle to ensure deterministic reshuffling per exam attempt
 */
function seededShuffle(array, seed) {
  const arr = [...array];
  let s = Math.abs(seed) || 12345;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const rnd = s / 233280;
    const j = Math.floor(rnd * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class AptitudeService {
  /**
   * Returns all 9 topics with counts per difficulty and mode pool
   */
  static async getTopics() {
    const questions = await getSeedAptitude();
    return APTITUDE_TOPICS.map((topic) => {
      const matching = questions.filter(
        (q) => q.topic.toLowerCase() === topic.toLowerCase()
      );
      const easy = matching.filter((q) => q.difficulty === 'easy').length;
      const medium = matching.filter((q) => q.difficulty === 'medium').length;
      const hard = matching.filter((q) => q.difficulty === 'hard').length;
      const practiceCount = matching.filter((q) => q.pool === 'practice' || q.pool === 'both').length;
      const examCount = matching.filter((q) => q.pool === 'exam' || q.pool === 'both').length;

      // Extract unique subtopics
      const subtopics = Array.from(new Set(matching.map((q) => q.subtopic).filter(Boolean)));

      return {
        topic,
        count: matching.length,
        total: matching.length,
        easy,
        medium,
        hard,
        practiceCount,
        examCount,
        subtopics
      };
    });
  }

  /**
   * Fetch questions for Practice or Exam.
   * If mode === 'exam', strips out answers, explanations, shortcuts, and hints.
   */
  static async getQuestions({
    topic,
    subtopic,
    difficulty,
    mode = 'practice',
    count = 10,
    exclude = []
  } = {}) {
    const questions = await getSeedAptitude();
    const excludeSet = new Set(Array.isArray(exclude) ? exclude : (exclude ? [exclude] : []));

    let filtered = questions.filter((q) => !excludeSet.has(q.id));

    // Filter by mode pool
    if (mode === 'practice') {
      filtered = filtered.filter((q) => q.pool === 'practice' || q.pool === 'both');
    } else if (mode === 'exam') {
      filtered = filtered.filter((q) => q.pool === 'exam' || q.pool === 'both');
    }

    // Filter by topic
    if (topic) {
      filtered = filtered.filter(
        (q) => q.topic.toLowerCase() === topic.toLowerCase()
      );
    }

    // Filter by subtopic
    if (subtopic) {
      filtered = filtered.filter(
        (q) => q.subtopic?.toLowerCase() === subtopic.toLowerCase()
      );
    }

    // Filter by difficulty (if not adaptive/all)
    if (difficulty && difficulty !== 'all' && difficulty !== 'adaptive') {
      filtered = filtered.filter((q) => q.difficulty === difficulty);
    }

    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const targetCount = count === 'all' ? shuffled.length : Math.min(Number(count) || 10, shuffled.length);
    const selected = shuffled.slice(0, targetCount);

    return selected.map((q) => {
      // In practice mode, return hints and structure.
      // In exam mode, never leak answers or hints.
      const base = {
        id: q.id,
        topic: q.topic,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        pool: q.pool,
        timeHintSeconds: q.timeHintSeconds || 60,
        dataset: q.dataset,
        passageId: q.passageId,
        passage: q.passage,
        mode
      };

      if (mode === 'practice') {
        return {
          ...base,
          hints: q.hints || []
        };
      }

      return base;
    });
  }

  /**
   * Practice mode instant feedback evaluation
   */
  static async evaluatePracticeAnswer({ questionId, selectedOption }) {
    const questions = await getSeedAptitude();
    const q = questions.find((item) => item.id === questionId);

    if (!q) {
      throw new NotFoundError(`Question ${questionId} not found`);
    }

    const isCorrect = q.correctOption === selectedOption;

    return {
      questionId,
      isCorrect,
      correctOption: q.correctOption,
      explanation: q.explanation,
      shortcut: q.shortcut || '',
      hints: q.hints || []
    };
  }

  /**
   * Start a Timed Exam Session with server-held answer keys
   */
  static async startExam(userId, {
    preset = 'mini',
    topic,
    count,
    durationMinutes,
    negativeMarking = true
  } = {}) {
    const questions = await getSeedAptitude();
    const examPool = questions.filter((q) => q.pool === 'exam' || q.pool === 'both');

    let selectedQuestions = [];
    let durationSeconds = 15 * 60; // 15 min default

    if (preset === 'mini') {
      // 10 random questions across all topics
      const shuffled = [...examPool].sort(() => 0.5 - Math.random());
      selectedQuestions = shuffled.slice(0, 10);
      durationSeconds = 15 * 60;
    } else if (preset === 'sectional') {
      // 20 questions in chosen topic
      const topicQuestions = examPool.filter(
        (q) => q.topic.toLowerCase() === (topic || 'Quantitative Aptitude').toLowerCase()
      );
      const shuffled = [...topicQuestions].sort(() => 0.5 - Math.random());
      selectedQuestions = shuffled.slice(0, Math.min(20, shuffled.length));
      durationSeconds = 30 * 60;
    } else if (preset === 'full') {
      // 45 questions: 5 questions from each of the 9 topics (2 Easy, 2 Med, 1 Hard)
      selectedQuestions = [];
      for (const t of APTITUDE_TOPICS) {
        const topicQs = examPool.filter((q) => q.topic.toLowerCase() === t.toLowerCase());
        const easy = topicQs.filter((q) => q.difficulty === 'easy').sort(() => 0.5 - Math.random()).slice(0, 2);
        const med = topicQs.filter((q) => q.difficulty === 'medium').sort(() => 0.5 - Math.random()).slice(0, 2);
        const hard = topicQs.filter((q) => q.difficulty === 'hard').sort(() => 0.5 - Math.random()).slice(0, 1);
        selectedQuestions.push(...easy, ...med, ...hard);
      }
      durationSeconds = 60 * 60;
    } else {
      // Custom
      let filtered = examPool;
      if (topic) {
        filtered = filtered.filter((q) => q.topic.toLowerCase() === topic.toLowerCase());
      }
      const qCount = Number(count) || 15;
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      selectedQuestions = shuffled.slice(0, Math.min(qCount, shuffled.length));
      durationSeconds = (Number(durationMinutes) || 20) * 60;
    }

    const seed = Math.floor(Math.random() * 1000000);
    const examId = 'exam_' + crypto.randomBytes(6).toString('hex');
    const startTime = new Date().toISOString();

    // Store server session with complete answer keys
    activeExamSessions.set(examId, {
      examId,
      userId,
      preset,
      topic: topic || 'All Topics',
      questions: selectedQuestions,
      seed,
      durationSeconds,
      startTime,
      negativeMarking
    });

    // Strip answers before sending to client
    const sanitizedQuestions = selectedQuestions.map((q) => ({
      id: q.id,
      topic: q.topic,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      timeHintSeconds: q.timeHintSeconds || 60,
      dataset: q.dataset,
      passageId: q.passageId,
      passage: q.passage
    }));

    return {
      examId,
      preset,
      durationSeconds,
      startTime,
      negativeMarking,
      seed,
      questions: sanitizedQuestions
    };
  }

  /**
   * Submit Timed Exam and score on server
   */
  static async submitExam(userId, examId, { answers = {}, timeTakenSeconds = 0, tabSwitches = 0 } = {}) {
    let session = activeExamSessions.get(examId);

    // Fallback: If session not in memory (e.g. server restart), reconstruct from seed questions
    if (!session) {
      const allQs = await getSeedAptitude();
      const qIds = Object.keys(answers);
      const matched = allQs.filter((q) => qIds.includes(q.id));
      session = {
        examId,
        userId,
        preset: matched.length > 25 ? 'full' : (matched.length > 15 ? 'sectional' : 'mini'),
        questions: matched.length > 0 ? matched : allQs.slice(0, 10),
        negativeMarking: true
      };
    }

    const questions = session.questions;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    let rawScore = 0;

    const questionReview = [];
    const sectionScores = {};

    for (const q of questions) {
      const userSelected = answers[q.id];
      const isAttempted = userSelected !== undefined && userSelected !== null && userSelected >= 0;
      const isCorrect = isAttempted && userSelected === q.correctOption;

      if (!sectionScores[q.topic]) {
        sectionScores[q.topic] = { total: 0, attempted: 0, correct: 0, score: 0 };
      }
      sectionScores[q.topic].total++;

      if (!isAttempted) {
        unattemptedCount++;
      } else if (isCorrect) {
        correctCount++;
        sectionScores[q.topic].attempted++;
        sectionScores[q.topic].correct++;
        rawScore += 1;
        sectionScores[q.topic].score += 1;
      } else {
        wrongCount++;
        sectionScores[q.topic].attempted++;
        const penalty = session.negativeMarking ? 0.25 : 0;
        rawScore -= penalty;
        sectionScores[q.topic].score -= penalty;

        // Record wrong answers into Spaced Revision
        await RevisionService.recordReview(userId, {
          topic: q.topic,
          questionId: q.id,
          isCorrect: false
        }).catch(() => {});
      }

      questionReview.push({
        id: q.id,
        topic: q.topic,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        userOption: userSelected ?? null,
        correctOption: q.correctOption,
        isCorrect,
        isAttempted,
        explanation: q.explanation,
        shortcut: q.shortcut || '',
        timeHintSeconds: q.timeHintSeconds || 60,
        dataset: q.dataset,
        passageId: q.passageId,
        passage: q.passage
      });
    }

    const totalQuestions = questions.length || 1;
    const score = Math.max(0, Number(rawScore.toFixed(2)));
    const maxScore = totalQuestions;
    const accuracy = correctCount + wrongCount > 0
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
      : 0;

    // XP Reward mapping
    let xpEarned = 20;
    if (session.preset === 'full') xpEarned = 120;
    else if (session.preset === 'sectional') xpEarned = 50;
    else if (session.preset === 'mini') xpEarned = 20;

    // Persist exam submission in database
    const submissionDoc = {
      id: examId,
      examId,
      userId,
      preset: session.preset,
      score,
      maxScore,
      accuracy,
      totalQuestions,
      attemptedCount: correctCount + wrongCount,
      correctCount,
      wrongCount,
      unattemptedCount,
      timeTakenSeconds,
      tabSwitches,
      sectionScores,
      xpEarned,
      submittedAt: new Date().toISOString()
    };

    await aptitudeRepo.create(submissionDoc).catch(() => {});

    // Award XP and streak update
    await GamificationService.recordActivity(userId, {
      xpGain: xpEarned,
      activityType: 'aptitude'
    }).catch(() => {});

    // Clean up memory
    activeExamSessions.delete(examId);

    return {
      ...submissionDoc,
      questionReview
    };
  }

  /**
   * Get past exam submissions for historical comparison
   */
  static async getExamHistory(userId) {
    const history = await aptitudeRepo.find((item) => item.userId === userId);
    return {
      count: history.length,
      history: history.sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
    };
  }

  /**
   * Legacy wrapper for backwards compatibility
   */
  static async submitAptitude(userId, payload) {
    if (payload.mode === 'exam' && payload.examId) {
      return this.submitExam(userId, payload.examId, payload);
    }
    return this.submitExam(userId, 'practice_' + Date.now(), payload);
  }
}
