import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GamificationService } from './GamificationService.js';
import { XP_REWARDS } from '../config/constants.js';
import { NotFoundError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_CS_PATH = path.resolve(__dirname, '../data/seedCS.json');

let cachedCS = null;

async function getSeedCS() {
  if (!cachedCS) {
    const raw = await fs.readFile(SEED_CS_PATH, 'utf-8');
    cachedCS = JSON.parse(raw);
  }
  return cachedCS;
}

export class CSService {
  static async getSubjectOverview(subjectKey) {
    const cs = await getSeedCS();
    const key = subjectKey.toLowerCase().trim();
    const subjectData = cs[key];
    if (!subjectData) {
      throw new NotFoundError(`CS Subject '${subjectKey}' not found. Valid subjects: ${Object.keys(cs).join(', ')}`);
    }

    return {
      subject: key,
      name: subjectData.name,
      concept: subjectData.concept,
      simpleExplanation: subjectData.simpleExplanation,
      example: subjectData.example,
      keyInterviewQuestions: subjectData.keyInterviewQuestions,
      mcqs: (subjectData.mcqs || []).map((m) => ({
        id: m.id,
        question: m.question,
        options: m.options,
        difficulty: 'medium'
      }))
    };
  }

  static async submitSubjectMCQs(userId, subjectKey, { answers = [] }) {
    const cs = await getSeedCS();
    const key = subjectKey.toLowerCase().trim();
    const subjectData = cs[key];
    if (!subjectData) {
      throw new NotFoundError(`CS Subject '${subjectKey}' not found`);
    }

    const mcqMap = new Map((subjectData.mcqs || []).map((m) => [m.id, m]));
    let totalCorrect = 0;
    const feedback = [];

    for (const ans of answers) {
      const mcq = mcqMap.get(ans.questionId);
      const isCorrect = mcq ? mcq.correctOption === ans.selectedOption : false;
      if (isCorrect) totalCorrect++;

      feedback.push({
        questionId: ans.questionId,
        question: mcq?.question,
        options: mcq?.options,
        userOption: ans.selectedOption,
        correctOption: mcq ? mcq.correctOption : null,
        isCorrect,
        explanation: mcq?.explanation || ''
      });
    }

    const xpGain = totalCorrect * XP_REWARDS.CS_MCQ;
    if (xpGain > 0) {
      await GamificationService.recordActivity(userId, {
        xpGain,
        activityType: 'cs',
        topic: key
      });
    }

    return {
      subject: key,
      totalQuestions: answers.length,
      totalCorrect,
      scorePercentage: Math.round((totalCorrect / (answers.length || 1)) * 100),
      feedback
    };
  }
}
