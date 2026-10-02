import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { dsaRepo } from '../repositories/index.js';
import { aiProvider } from './ai/index.js';
import { buildDSAFeedbackPrompt } from './ai/prompts/dsaFeedback.js';
import { GamificationService } from './GamificationService.js';
import { XP_REWARDS, DSA_TOPICS } from '../config/constants.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_DSA_PATH = path.resolve(__dirname, '../data/seedDSA.json');

let cachedProblems = null;

async function getSeedProblems() {
  if (!cachedProblems) {
    const raw = await fs.readFile(SEED_DSA_PATH, 'utf-8');
    cachedProblems = JSON.parse(raw);
  }
  return cachedProblems;
}

const dsaFeedbackSchema = z.object({
  verdict: z.enum(['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compile Error', 'Needs Improvement']),
  score: z.number().min(0).max(100),
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
  isOptimal: z.boolean(),
  logicSummary: z.string(),
  issues: z.array(z.string()),
  improvements: z.array(z.string()),
  betterApproach: z.string(),
  sampleOptimizedCode: z.string().optional(),
  encouragement: z.string()
});

export class DSAService {
  static async getTopics() {
    const problems = await getSeedProblems();
    const topicStats = DSA_TOPICS.map((topic) => {
      const matching = problems.filter((p) => p.topic.toLowerCase() === topic.toLowerCase());
      return {
        topic,
        count: matching.length,
        easy: matching.filter((p) => p.difficulty === 'easy').length,
        medium: matching.filter((p) => p.difficulty === 'medium').length,
        hard: matching.filter((p) => p.difficulty === 'hard').length
      };
    });
    return topicStats;
  }

  static async getProblems({ topic, difficulty, search } = {}) {
    const problems = await getSeedProblems();
    let filtered = problems;

    if (topic) {
      filtered = filtered.filter((p) => p.topic.toLowerCase() === topic.toLowerCase());
    }

    if (difficulty) {
      filtered = filtered.filter((p) => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    return filtered.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty,
      topic: p.topic,
      descriptionSnippet: p.description.substring(0, 140) + '...',
      timeComplexity: p.timeComplexity,
      spaceComplexity: p.spaceComplexity,
      hintsCount: p.hints?.length || 0
    }));
  }

  static async getProblemById(idOrSlug) {
    const problems = await getSeedProblems();
    const problem = problems.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    if (!problem) {
      throw new NotFoundError(`DSA problem not found: ${idOrSlug}`);
    }

    return {
      ...problem,
      // Hide hidden test cases from direct client inspection
      testCases: (problem.testCases || []).filter((tc) => !tc.isHidden),
      totalTestCases: problem.testCases?.length || 0,
      hints: problem.hints.map((_, idx) => ({ level: idx + 1 }))
    };
  }

  static async getHint(problemId, level = 1) {
    const problems = await getSeedProblems();
    const problem = problems.find((p) => p.id === problemId || p.slug === problemId);
    if (!problem) {
      throw new NotFoundError(`Problem ${problemId} not found`);
    }

    const hintIndex = Number(level) - 1;
    if (hintIndex < 0 || hintIndex >= (problem.hints?.length || 0)) {
      throw new BadRequestError(`Hint level ${level} not available. Max hint level is ${problem.hints.length}`);
    }

    return {
      problemId: problem.id,
      title: problem.title,
      level: Number(level),
      totalHints: problem.hints.length,
      hint: problem.hints[hintIndex]
    };
  }

  static async reviewCode(userId, problemId, { language, code, testResults, userMessage }) {
    const problems = await getSeedProblems();
    const problem = problems.find((p) => p.id === problemId || p.slug === problemId);
    if (!problem) {
      throw new NotFoundError(`Problem ${problemId} not found`);
    }

    const promptText = buildDSAFeedbackPrompt({
      problemTitle: problem.title,
      problemDescription: problem.description,
      language: language || 'javascript',
      userCode: code,
      testResults,
      userMessage
    });

    const feedback = await aiProvider.generateJSON({
      messages: [{ role: 'user', content: promptText }],
      systemPrompt: 'You are an expert DSA coding review AI.',
      schema: dsaFeedbackSchema,
      maxTokens: 2500
    });

    // Record submission progress
    await dsaRepo.upsert(`${userId}_${problem.id}`, {
      userId,
      problemId: problem.id,
      topic: problem.topic,
      difficulty: problem.difficulty,
      language,
      verdict: feedback.verdict,
      score: feedback.score,
      solved: feedback.verdict === 'Accepted',
      submittedAt: new Date().toISOString()
    });

    if (feedback.verdict === 'Accepted') {
      const xp = problem.difficulty === 'hard' ? XP_REWARDS.DSA_HARD : (problem.difficulty === 'medium' ? XP_REWARDS.DSA_MEDIUM : XP_REWARDS.DSA_EASY);
      await GamificationService.recordActivity(userId, {
        xpGain: xp,
        activityType: 'dsa',
        topic: problem.topic
      });
    }

    return feedback;
  }

  /**
   * Judge0 remote code execution interface (guarded behind env.JUDGE0_ENABLED flag)
   */
  static async executeCodeWithJudge0({ language, sourceCode, stdin = '' }) {
    if (!env.JUDGE0_ENABLED || !env.JUDGE0_API_KEY) {
      return {
        executed: false,
        mode: 'client-side-worker',
        message: 'Judge0 execution is disabled. The client frontend should execute JS in a Web Worker or sandbox and send outputs for feedback.'
      };
    }

    const languageMap = {
      javascript: 63,
      python: 71,
      cpp: 54,
      java: 62
    };

    const languageId = languageMap[language.toLowerCase()] || 63;

    try {
      const res = await fetch(`${env.JUDGE0_API_URL}/submissions?wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': env.JUDGE0_HOST_HEADER
        },
        body: JSON.stringify({
          source_code: Buffer.from(sourceCode).toString('base64'),
          language_id: languageId,
          stdin: Buffer.from(stdin).toString('base64')
        })
      });

      const data = await res.json();
      return {
        executed: true,
        mode: 'judge0',
        stdout: data.stdout ? Buffer.from(data.stdout, 'base64').toString('utf-8') : null,
        stderr: data.stderr ? Buffer.from(data.stderr, 'base64').toString('utf-8') : null,
        compileOutput: data.compile_output ? Buffer.from(data.compile_output, 'base64').toString('utf-8') : null,
        status: data.status,
        time: data.time,
        memory: data.memory
      };
    } catch (err) {
      logger.error({ err }, 'Judge0 execution failed');
      return {
        executed: false,
        mode: 'fallback',
        error: 'Remote code execution service unavailable'
      };
    }
  }
}
