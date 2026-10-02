import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dailyRepo } from '../repositories/index.js';
import { GamificationService } from './GamificationService.js';
import { XP_REWARDS } from '../config/constants.js';
import { BadRequestError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

let cachedSeeds = null;

async function getAllSeedData() {
  if (!cachedSeeds) {
    const aptRaw = await fs.readFile(path.join(DATA_DIR, 'seedAptitude.json'), 'utf-8');
    const dsaRaw = await fs.readFile(path.join(DATA_DIR, 'seedDSA.json'), 'utf-8');
    const csRaw = await fs.readFile(path.join(DATA_DIR, 'seedCS.json'), 'utf-8');
    const intRaw = await fs.readFile(path.join(DATA_DIR, 'seedInterview.json'), 'utf-8');
    cachedSeeds = {
      aptitude: JSON.parse(aptRaw),
      dsa: JSON.parse(dsaRaw),
      cs: JSON.parse(csRaw),
      interview: JSON.parse(intRaw)
    };
  }
  return cachedSeeds;
}

/**
 * Deterministic pseudo-random number generator from string seed
 */
function getDeterministicHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export class DailyService {
  /**
   * Returns deterministic challenge for user for current date
   */
  static async getDailyChallenge(userId, dateStr = null) {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const challengeKey = `${userId}_${today}`;
    const existing = await dailyRepo.findById(challengeKey);

    const { aptitude, dsa, cs, interview } = await getAllSeedData();
    const seedNum = getDeterministicHash(`${userId}_${today}`);

    // Pick 2 Aptitude questions deterministically
    const aptIndex1 = seedNum % aptitude.length;
    const aptIndex2 = (seedNum + 7) % aptitude.length;
    const selectedApt = [aptitude[aptIndex1], aptitude[aptIndex2]].map((q) => ({
      id: q.id,
      topic: q.topic,
      type: 'aptitude',
      question: q.question,
      options: q.options
    }));

    // Pick 1 DSA problem deterministically
    const dsaIndex = seedNum % dsa.length;
    const selectedDSA = dsa[dsaIndex];

    // Pick 3 CS MCQs deterministically
    const csSubjects = Object.keys(cs);
    const selectedCS = [];
    for (let i = 0; i < 3; i++) {
      const subjKey = csSubjects[(seedNum + i) % csSubjects.length];
      const mcqList = cs[subjKey].mcqs;
      const mcq = mcqList[(seedNum + i * 3) % mcqList.length];
      selectedCS.push({
        id: mcq.id,
        subject: subjKey,
        topic: cs[subjKey].name,
        type: 'cs_mcq',
        question: mcq.question,
        options: mcq.options
      });
    }

    // Pick 1 Interview question deterministically
    const intIndex = seedNum % interview.length;
    const selectedInterview = interview[intIndex];

    // Pick deterministic featured daily challenge for calendar day (rotating across DSA and Aptitude)
    const daySeed = getDeterministicHash(today);
    let featuredChallenge = null;
    if (daySeed % 2 === 0 && dsa.length > 0) {
      const q = dsa[daySeed % dsa.length];
      featuredChallenge = {
        id: q.id,
        title: q.title,
        topic: `DSA - ${q.topic || 'Algorithms'}`,
        difficulty: q.difficulty || 'Medium',
        xpReward: 15,
        type: 'dsa',
        slug: q.slug,
        targetUrl: '/daily?daily=true'
      };
    } else if (aptitude.length > 0) {
      const q = aptitude[daySeed % aptitude.length];
      featuredChallenge = {
        id: q.id,
        title: q.question && q.question.length > 70 ? q.question.slice(0, 67) + '...' : (q.question || 'Analytical Question'),
        topic: `Aptitude - ${q.topic || 'General'}`,
        difficulty: 'Medium',
        xpReward: 15,
        type: 'aptitude',
        targetUrl: '/daily?daily=true'
      };
    }

    return {
      challengeId: challengeKey,
      date: today,
      completed: existing ? existing.completed : false,
      completedAt: existing ? existing.completedAt : null,
      score: existing ? existing.score : null,
      featuredChallenge,
      items: {
        aptitude: selectedApt,
        dsa: {
          id: selectedDSA.id,
          title: selectedDSA.title,
          slug: selectedDSA.slug,
          difficulty: selectedDSA.difficulty,
          topic: selectedDSA.topic,
          description: selectedDSA.description,
          starterCode: selectedDSA.starterCode,
          hintsCount: selectedDSA.hints?.length || 0
        },
        csMCQs: selectedCS,
        interviewQuestion: {
          id: selectedInterview.id,
          category: selectedInterview.category,
          role: selectedInterview.role,
          question: selectedInterview.question,
          coreConceptsExpected: selectedInterview.coreConceptsExpected
        }
      }
    };
  }

  static async completeDailyChallenge(userId, { answers = [], timeTakenSeconds = 0, dateStr = null }) {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const challengeKey = `${userId}_${today}`;
    const existing = await dailyRepo.findById(challengeKey);

    if (existing && existing.completed) {
      return {
        alreadyCompleted: true,
        message: 'Daily challenge for today has already been completed',
        record: existing
      };
    }

    const { aptitude, cs } = await getAllSeedData();
    const answerKey = new Map();
    aptitude.forEach((q) => answerKey.set(q.id, q.correctOption));
    Object.keys(cs).forEach((subj) => {
      cs[subj].mcqs.forEach((m) => answerKey.set(m.id, m.correctOption));
    });

    let correctCount = 0;
    const detailedResults = [];

    for (const ans of answers) {
      const correctOpt = answerKey.get(ans.questionId);
      const isCorrect = correctOpt !== undefined ? correctOpt === ans.selectedOption : true;
      if (isCorrect) correctCount++;

      detailedResults.push({
        questionId: ans.questionId,
        userOption: ans.selectedOption,
        correctOption: correctOpt,
        isCorrect
      });
    }

    const record = {
      id: challengeKey,
      userId,
      date: today,
      completed: true,
      score: correctCount,
      totalQuestions: answers.length,
      timeTakenSeconds,
      completedAt: new Date().toISOString()
    };

    await dailyRepo.upsert(challengeKey, record);

    // Award Daily Challenge XP
    const activityResult = await GamificationService.recordActivity(userId, {
      xpGain: XP_REWARDS.DAILY_CHALLENGE,
      activityType: 'daily_challenge'
    });

    return {
      success: true,
      xpEarned: XP_REWARDS.DAILY_CHALLENGE,
      score: correctCount,
      totalQuestions: answers.length,
      detailedResults,
      gamification: activityResult
    };
  }
}

