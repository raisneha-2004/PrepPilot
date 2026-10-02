import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { assessmentRepo } from '../repositories/index.js';
import { GamificationService } from './GamificationService.js';
import { RevisionService } from './RevisionService.js';
import { XP_REWARDS } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/seedAssessment.json');

let cachedQuestions = null;
const activeAssessmentSessions = new Map();

// Helper: Seeded pseudo-random number generator
function createRng(seed) {
  let s = Math.abs(seed) || 123456789;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Helper: Seeded shuffle
function seededShuffle(arr, rng) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export class AssessmentService {
  /**
   * Load seed questions into memory
   */
  static async loadQuestions() {
    if (!cachedQuestions) {
      const raw = await fs.readFile(DATA_FILE, 'utf-8');
      cachedQuestions = JSON.parse(raw);
    }
    return cachedQuestions;
  }

  /**
   * Returns metadata config: modes, roles, languages, and section weightages
   */
  static async getConfig() {
    return {
      modes: {
        quick: { name: 'Quick Check', questions: 20, durationMinutes: 25, durationSeconds: 1500, xp: 50 },
        standard: { name: 'Standard Diagnostic', questions: 40, durationMinutes: 45, durationSeconds: 2700, xp: 100 },
        deep_dive: { name: 'Deep Dive Assessment', questions: 70, durationMinutes: 80, durationSeconds: 4800, xp: 200 }
      },
      roles: ['SDE', 'Frontend', 'Backend', 'AI-ML'],
      languages: ['Python', 'Java', 'C/C++', 'JavaScript'],
      sections: [
        { id: 'aptitude', name: 'Aptitude', topics: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation', 'Number Series'] },
        { id: 'core_cs', name: 'Core CS', topics: ['DSA', 'OOP', 'DBMS', 'SQL', 'Operating Systems', 'Computer Networks'] },
        { id: 'programming', name: 'Programming & Output Prediction', topics: ['Python', 'Java', 'C/C++', 'JavaScript'] },
        { id: 'role_specific', name: 'Role-Specific Technical Track', topics: ['SDE', 'Frontend', 'Backend', 'AI/ML'] },
        { id: 'professional_skills', name: 'Professional Skills (Self-Assessment)', topics: ['Situational Judgement'] }
      ],
      roleWeightages: {
        'SDE': { aptitude: 0.20, core_cs: 0.35, programming: 0.20, role_specific: 0.15, professional_skills: 0.10 },
        'Frontend': { aptitude: 0.20, core_cs: 0.20, programming: 0.25, role_specific: 0.25, professional_skills: 0.10 },
        'Backend': { aptitude: 0.20, core_cs: 0.25, programming: 0.20, role_specific: 0.25, professional_skills: 0.10 },
        'AI-ML': { aptitude: 0.20, core_cs: 0.20, programming: 0.25, role_specific: 0.25, professional_skills: 0.10 }
      }
    };
  }

  /**
   * Start a new diagnostic assessment session
   */
  static async startAssessment(userId, { role = 'SDE', mode = 'standard', language = 'JavaScript' }) {
    const all = await this.loadQuestions();
    const config = await this.getConfig();

    const modeConfig = config.modes[mode] || config.modes.standard;
    const totalCount = modeConfig.questions;
    const durationSeconds = modeConfig.durationSeconds;

    const seed = Date.now() ^ Math.floor(Math.random() * 100000);
    const rng = createRng(seed);

    // Normalize role string
    const normalizedRole = role === 'AI/ML' ? 'AI-ML' : role;
    const weights = config.roleWeightages[normalizedRole] || config.roleWeightages['SDE'];

    // Map role to target topic for role-specific section
    const roleTopicMap = {
      'SDE': 'SDE',
      'Frontend': 'Frontend',
      'Backend': 'Backend',
      'AI-ML': 'AI/ML'
    };
    const targetRoleTopic = roleTopicMap[normalizedRole] || 'SDE';

    // 1. Group questions by section
    const aptitudePool = all.filter((q) => q.section === 'aptitude');
    const coreCsPool = all.filter((q) => q.section === 'core_cs');
    const progPool = all.filter((q) => q.section === 'programming' && (q.topic.toLowerCase() === language.toLowerCase() || q.topic === language));
    const rolePool = all.filter((q) => q.section === 'role_specific' && q.topic === targetRoleTopic);
    const profPool = all.filter((q) => q.section === 'professional_skills');

    // 2. Determine question counts per section with minimum guarantees (at least 3 per section for standard/deep_dive, at least 2-3 for quick)
    const minSec = mode === 'quick' ? 2 : 3;
    let countApt = Math.max(minSec, Math.round(totalCount * weights.aptitude));
    let countCore = Math.max(minSec, Math.round(totalCount * weights.core_cs));
    let countProg = Math.max(minSec, Math.round(totalCount * weights.programming));
    let countRole = Math.max(minSec, Math.round(totalCount * weights.role_specific));
    let countProf = Math.max(minSec, Math.round(totalCount * weights.professional_skills));

    // Adjust total to match exact question count
    let currentTotal = countApt + countCore + countProg + countRole + countProf;
    while (currentTotal > totalCount) {
      if (countCore > minSec) countCore--;
      else if (countApt > minSec) countApt--;
      else if (countRole > minSec) countRole--;
      else if (countProg > minSec) countProg--;
      else if (countProf > minSec) countProf--;
      else break;
      currentTotal = countApt + countCore + countProg + countRole + countProf;
    }
    while (currentTotal < totalCount) {
      countCore++;
      currentTotal = countApt + countCore + countProg + countRole + countProf;
    }

    // Helper to sample balanced by difficulty (40% Easy, 40% Medium, 20% Hard)
    function sampleBalanced(pool, targetCount) {
      const shuffledPool = seededShuffle(pool, rng);
      const easy = shuffledPool.filter((q) => q.difficulty === 'easy');
      const medium = shuffledPool.filter((q) => q.difficulty === 'medium');
      const hard = shuffledPool.filter((q) => q.difficulty === 'hard');

      const targetEasy = Math.max(1, Math.round(targetCount * 0.4));
      const targetMed = Math.max(1, Math.round(targetCount * 0.4));
      const targetHard = Math.max(1, targetCount - targetEasy - targetMed);

      const sampled = [
        ...easy.slice(0, targetEasy),
        ...medium.slice(0, targetMed),
        ...hard.slice(0, targetHard)
      ];

      // If short due to pool boundary, top up from remaining
      const chosenIds = new Set(sampled.map((q) => q.id));
      for (const q of shuffledPool) {
        if (sampled.length >= targetCount) break;
        if (!chosenIds.has(q.id)) {
          sampled.push(q);
          chosenIds.add(q.id);
        }
      }
      return sampled.slice(0, targetCount);
    }

    const selectedQuestions = [
      ...sampleBalanced(aptitudePool, countApt),
      ...sampleBalanced(coreCsPool, countCore),
      ...sampleBalanced(progPool.length >= countProg ? progPool : all.filter((q) => q.section === 'programming'), countProg),
      ...sampleBalanced(rolePool.length >= countRole ? rolePool : all.filter((q) => q.section === 'role_specific'), countRole),
      ...sampleBalanced(profPool, countProf)
    ];

    // Seeded shuffle of options per question, keeping track of answers on server
    const clientQuestions = [];
    const answerKeyMap = new Map();

    selectedQuestions.forEach((q) => {
      if (q.type === 'scenario') {
        // Scenario question
        clientQuestions.push({
          id: q.id,
          section: q.section,
          sectionName: q.sectionName,
          topic: q.topic,
          subtopic: q.subtopic,
          difficulty: q.difficulty,
          type: 'scenario',
          question: q.question,
          options: q.options
        });

        answerKeyMap.set(q.id, {
          type: 'scenario',
          section: q.section,
          topic: q.topic,
          subtopic: q.subtopic,
          difficulty: q.difficulty,
          question: q.question,
          options: q.options,
          optionScores: q.optionScores || [3, 2, 1, 0],
          rubricExplanations: q.rubricExplanations || [],
          explanation: q.explanation
        });
      } else {
        // Standard MCQ or code output question
        clientQuestions.push({
          id: q.id,
          section: q.section,
          sectionName: q.sectionName,
          topic: q.topic,
          subtopic: q.subtopic,
          difficulty: q.difficulty,
          type: q.type || 'mcq',
          question: q.question,
          ...(q.code ? { code: q.code, language: q.language } : {}),
          options: q.options
        });

        answerKeyMap.set(q.id, {
          type: q.type || 'mcq',
          section: q.section,
          topic: q.topic,
          subtopic: q.subtopic,
          difficulty: q.difficulty,
          question: q.question,
          ...(q.code ? { code: q.code, language: q.language } : {}),
          options: q.options,
          correct: q.correct,
          explanation: q.explanation
        });
      }
    });

    const assessmentId = `diag_${crypto.randomBytes(6).toString('hex')}`;

    activeAssessmentSessions.set(assessmentId, {
      userId,
      assessmentId,
      mode,
      role: normalizedRole,
      language,
      durationSeconds,
      startTime: new Date().toISOString(),
      answerKeyMap,
      questions: clientQuestions,
      savedAnswers: {},
      timeRemaining: durationSeconds,
      markedForReview: []
    });

    return {
      assessmentId,
      mode,
      role: normalizedRole,
      language,
      durationSeconds,
      totalQuestions: clientQuestions.length,
      questions: clientQuestions,
      seed
    };
  }

  /**
   * Autosave active assessment progress
   */
  static async saveProgress(assessmentId, { answers = {}, timeRemainingSeconds, markedForReview = [] }) {
    const session = activeAssessmentSessions.get(assessmentId);
    if (!session) return { ok: true };

    session.savedAnswers = { ...session.savedAnswers, ...answers };
    if (timeRemainingSeconds !== undefined) {
      session.timeRemaining = timeRemainingSeconds;
    }
    if (markedForReview) {
      session.markedForReview = markedForReview;
    }

    return { ok: true, savedAt: new Date().toISOString() };
  }

  /**
   * Submit and score assessment
   */
  static async submitAssessment(userId, assessmentId, { answers = {}, timeTakenSeconds = 0 }) {
    const session = activeAssessmentSessions.get(assessmentId);
    const all = await this.loadQuestions();

    let answerKeyMap;
    let mode = 'standard';
    let role = 'SDE';
    let language = 'JavaScript';

    if (session) {
      answerKeyMap = session.answerKeyMap;
      mode = session.mode;
      role = session.role;
      language = session.language;
    } else {
      // Fallback: construct answer key from seed
      answerKeyMap = new Map();
      all.forEach((q) => {
        answerKeyMap.set(q.id, q);
      });
    }

    let technicalTotal = 0;
    let technicalCorrect = 0;
    let scenarioTotalScore = 0;
    let scenarioMaxScore = 0;

    const sectionScores = {};
    const topicScores = {};
    const detailedFeedback = [];

    // Evaluate answers
    for (const [qId, qMeta] of answerKeyMap.entries()) {
      const userChoice = answers[qId];
      const section = qMeta.section;
      const topic = qMeta.topic;

      if (!sectionScores[section]) {
        sectionScores[section] = { total: 0, correct: 0, percentage: 0, name: qMeta.sectionName || section };
      }
      if (!topicScores[topic]) {
        topicScores[topic] = { total: 0, correct: 0, section };
      }

      if (qMeta.type === 'scenario') {
        const scores = qMeta.optionScores || [3, 2, 1, 0];
        const earnedScore = userChoice !== undefined && scores[userChoice] !== undefined ? scores[userChoice] : 0;
        scenarioTotalScore += earnedScore;
        scenarioMaxScore += 3;

        sectionScores[section].total++;
        if (earnedScore >= 2) sectionScores[section].correct++;

        detailedFeedback.push({
          questionId: qId,
          section,
          topic,
          subtopic: qMeta.subtopic,
          difficulty: qMeta.difficulty,
          type: 'scenario',
          question: qMeta.question,
          options: qMeta.options,
          userOption: userChoice,
          earnedScore,
          maxScore: 3,
          isCorrect: earnedScore === 3,
          rubricExplanation: userChoice !== undefined && qMeta.rubricExplanations ? qMeta.rubricExplanations[userChoice] : null,
          explanation: qMeta.explanation
        });
      } else {
        technicalTotal++;
        sectionScores[section].total++;
        topicScores[topic].total++;

        const isCorrect = userChoice !== undefined && userChoice === qMeta.correct;
        if (isCorrect) {
          technicalCorrect++;
          sectionScores[section].correct++;
          topicScores[topic].correct++;
        }

        detailedFeedback.push({
          questionId: qId,
          section,
          topic,
          subtopic: qMeta.subtopic,
          difficulty: qMeta.difficulty,
          type: qMeta.type || 'mcq',
          question: qMeta.question,
          code: qMeta.code,
          language: qMeta.language,
          options: qMeta.options,
          userOption: userChoice,
          correctOption: qMeta.correct,
          isCorrect,
          explanation: qMeta.explanation
        });

        // Spaced revision integration
        RevisionService.recordReview(userId, {
          topic,
          questionId: qId,
          isCorrect
        }).catch(() => {});
      }
    }

    // Compute Section & Topic Percentages
    Object.keys(sectionScores).forEach((sec) => {
      const s = sectionScores[sec];
      s.percentage = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    });

    Object.keys(topicScores).forEach((top) => {
      const t = topicScores[top];
      t.percentage = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
    });

    const technicalAccuracy = technicalTotal > 0 ? Math.round((technicalCorrect / technicalTotal) * 100) : 0;
    const professionalSkillsScore = scenarioMaxScore > 0 ? Math.round((scenarioTotalScore / scenarioMaxScore) * 100) : 100;

    // Determine Top 3 Strengths and Top 3 Weaknesses
    const topicList = Object.entries(topicScores).map(([name, data]) => ({
      topic: name,
      percentage: data.percentage,
      total: data.total
    }));

    const strengths = topicList
      .filter((t) => t.percentage >= 60)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
      .map((t) => `${t.topic} (${t.percentage}%)`);

    const weaknesses = topicList
      .filter((t) => t.percentage < 70)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3)
      .map((t) => `${t.topic} (${t.percentage}%)`);

    const fallbackStrengths = strengths.length > 0 ? strengths : ['Core Problem Solving', 'Language Syntax'];
    const fallbackWeaknesses = weaknesses.length > 0 ? weaknesses : ['Advanced Optimization', 'Edge Case Analysis'];

    // Award XP
    const xp = mode === 'deep_dive' ? 200 : mode === 'standard' ? 100 : 50;
    await GamificationService.addXP(userId, xp, `Diagnostic Assessment Completed (${mode})`);

    const resultDoc = {
      id: assessmentId,
      userId,
      mode,
      role,
      language,
      totalQuestions: technicalTotal + (scenarioMaxScore / 3),
      technicalTotal,
      technicalCorrect,
      overallPercentage: technicalAccuracy,
      technicalAccuracy,
      professionalSkillsScore,
      sectionScores,
      topicScores,
      strengths: fallbackStrengths,
      weaknesses: fallbackWeaknesses,
      timeTakenSeconds,
      xpEarned: xp,
      submittedAt: new Date().toISOString()
    };

    // Save to user repository
    await assessmentRepo.upsert(userId, resultDoc);

    // Clean active session
    activeAssessmentSessions.delete(assessmentId);

    return {
      ...resultDoc,
      detailedFeedback
    };
  }

  /**
   * Get past diagnostic assessments history
   */
  static async getHistory(userId) {
    const latest = await assessmentRepo.findById(userId);
    if (!latest) return { count: 0, history: [] };
    const historyArr = Array.isArray(latest.history) ? latest.history : [latest];
    return {
      count: historyArr.length,
      history: historyArr
    };
  }

  /**
   * Get latest diagnostic result
   */
  static async getLatest(userId) {
    return assessmentRepo.findById(userId);
  }
}
