import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { revisionRepo, assessmentRepo } from '../repositories/index.js';
import { LEITNER_INTERVALS, MAX_REVISION_BOX, XP_REWARDS } from '../config/constants.js';
import { GamificationService } from './GamificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

let cachedQuestions = null;

async function getAllQuestionsPool() {
  if (!cachedQuestions) {
    const aptRaw = await fs.readFile(path.join(DATA_DIR, 'seedAptitude.json'), 'utf-8');
    const csRaw = await fs.readFile(path.join(DATA_DIR, 'seedCS.json'), 'utf-8');
    const aptitude = JSON.parse(aptRaw);
    const cs = JSON.parse(csRaw);

    const pool = [];
    aptitude.forEach((q) => pool.push({ id: q.id, topic: q.topic, question: q.question, options: q.options, correctOption: q.correctOption, explanation: q.explanation, type: 'aptitude' }));
    Object.keys(cs).forEach((sec) => {
      cs[sec].mcqs.forEach((m) => pool.push({ id: m.id, topic: cs[sec].name, question: m.question, options: m.options, correctOption: m.correctOption, explanation: m.explanation, type: 'cs' }));
    });
    cachedQuestions = pool;
  }
  return cachedQuestions;
}

export class RevisionService {
  /**
   * Record Leitner spaced repetition review result
   */
  static async recordReview(userId, { topic, questionId, isCorrect }) {
    const userRevision = (await revisionRepo.findById(userId)) || {
      userId,
      items: {},
      totalReviews: 0,
      updatedAt: new Date().toISOString()
    };

    const items = userRevision.items || {};
    const itemKey = questionId || topic;
    const currentItem = items[itemKey] || {
      topic,
      questionId: questionId || null,
      box: 1,
      consecutiveSuccesses: 0,
      lastReviewedAt: null,
      nextReviewDate: new Date().toISOString().split('T')[0]
    };

    const now = new Date();
    let newBox = currentItem.box || 1;
    let consecutiveSuccesses = currentItem.consecutiveSuccesses || 0;

    if (isCorrect) {
      consecutiveSuccesses++;
      newBox = Math.min(MAX_REVISION_BOX, newBox + 1);
    } else {
      consecutiveSuccesses = 0;
      newBox = 1; // Reset to Box 1 for immediate recall
    }

    const intervalDays = LEITNER_INTERVALS[newBox] || 1;
    const nextDateObj = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    const nextReviewDate = nextDateObj.toISOString().split('T')[0];

    items[itemKey] = {
      topic,
      questionId: questionId || null,
      box: newBox,
      intervalDays,
      consecutiveSuccesses,
      lastReviewedAt: now.toISOString(),
      nextReviewDate
    };

    userRevision.items = items;
    userRevision.totalReviews = (userRevision.totalReviews || 0) + 1;
    userRevision.updatedAt = now.toISOString();

    await revisionRepo.upsert(userId, userRevision);

    // Award XP
    await GamificationService.recordActivity(userId, {
      xpGain: isCorrect ? XP_REWARDS.SPACED_REVISION_SESSION : 10,
      activityType: 'revision',
      topic
    });

    return {
      topic,
      questionId,
      isCorrect,
      promotedToBox: newBox,
      nextReviewInDays: intervalDays,
      nextReviewDate
    };
  }

  /**
   * Fetch today's due topics (5 questions, ~10 min target)
   */
  static async getTodayDue(userId) {
    const pool = await getAllQuestionsPool();
    const userRevision = (await revisionRepo.findById(userId)) || { items: {} };
    const items = userRevision.items || {};

    const todayStr = new Date().toISOString().split('T')[0];
    const dueQuestionIds = [];
    const dueTopics = new Set();

    Object.values(items).forEach((item) => {
      if (item.nextReviewDate <= todayStr) {
        if (item.questionId) dueQuestionIds.push(item.questionId);
        if (item.topic) dueTopics.add(item.topic);
      }
    });

    let dueQuestions = pool.filter((q) => dueQuestionIds.includes(q.id));

    // If fewer than 5 items are due, pick questions matching due topics or user weak areas
    if (dueQuestions.length < 5) {
      const assessment = await assessmentRepo.findById(userId);
      const weakTopics = assessment?.weaknesses || ['Arrays', 'Quantitative Aptitude', 'DBMS'];
      
      const candidateQuestions = pool.filter(
        (q) => !dueQuestionIds.includes(q.id) && weakTopics.some((wt) => q.topic.toLowerCase().includes(wt.toLowerCase()))
      );

      const shuffled = candidateQuestions.sort(() => 0.5 - Math.random());
      const needed = 5 - dueQuestions.length;
      dueQuestions = [...dueQuestions, ...shuffled.slice(0, needed)];
    }

    // If still under 5, fill from general pool
    if (dueQuestions.length < 5) {
      const fallback = pool.filter((q) => !dueQuestions.some((dq) => dq.id === q.id)).sort(() => 0.5 - Math.random());
      dueQuestions = [...dueQuestions, ...fallback.slice(0, 5 - dueQuestions.length)];
    }

    return {
      date: todayStr,
      estimatedMinutes: 10,
      targetCount: 5,
      dueTopicsCount: dueTopics.size,
      dueTopics: [...dueTopics],
      questions: dueQuestions.map((q) => ({
        id: q.id,
        topic: q.topic,
        type: q.type,
        question: q.question,
        options: q.options
      }))
    };
  }
}
