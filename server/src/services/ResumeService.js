import pdfParse from 'pdf-parse';
import { z } from 'zod';
import { resumeRepo } from '../repositories/index.js';
import { aiProvider } from './ai/index.js';
import { buildResumeAnalysisPrompt } from './ai/prompts/resumeAnalysis.js';
import { GamificationService } from './GamificationService.js';
import { XP_REWARDS } from '../config/constants.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { validatePDFBuffer } from '../middleware/upload.js';
import { logger } from '../utils/logger.js';

const resumeAnalysisSchema = z.object({
  candidateName: z.string().default('Candidate'),
  skills: z.object({
    languages: z.array(z.string()).default([]),
    frameworks: z.array(z.string()).default([]),
    databases: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([])
  }),
  projects: z.array(
    z.object({
      title: z.string(),
      technologies: z.array(z.string()).default([]),
      description: z.string().default(''),
      highlight: z.string().default('')
    })
  ).default([]),
  experience: z.array(
    z.object({
      role: z.string().default(''),
      organization: z.string().default(''),
      duration: z.string().default(''),
      summary: z.string().default('')
    })
  ).default([]),
  education: z.object({
    degree: z.string().default(''),
    institution: z.string().default(''),
    year: z.string().default('')
  }).optional(),
  resumeReview: z.object({
    score: z.number().min(0).max(100).default(75),
    strengths: z.array(z.string()).default([]),
    improvements: z.array(z.string()).default([])
  }),
  tailoredInterviewQuestions: z.array(
    z.object({
      question: z.string(),
      targetedProjectOrTech: z.string().default('General'),
      expectedKeyInsights: z.array(z.string()).default([])
    })
  ).default([])
});

export class ResumeService {
  /**
   * Process PDF buffer, validate magic bytes, extract text and run AI analysis
   */
  static async processResumeUpload(userId, fileBuffer, targetRole = 'SDE') {
    if (!validatePDFBuffer(fileBuffer)) {
      throw new BadRequestError('Invalid file: Header magic bytes do not match standard PDF structure');
    }

    let extractedText = '';
    try {
      const parsed = await pdfParse(fileBuffer);
      extractedText = parsed.text || '';
    } catch (err) {
      logger.error({ err: err.message }, 'Failed to parse PDF document');
      throw new BadRequestError('Could not parse text from the uploaded PDF document');
    }

    if (extractedText.trim().length < 50) {
      throw new BadRequestError('Resume PDF does not contain sufficient extractable text (e.g. image-only PDF)');
    }

    const prompt = buildResumeAnalysisPrompt(extractedText, targetRole);

    const analysis = await aiProvider.generateJSON({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: 'You are a principal tech recruiter and technical hiring manager.',
      schema: resumeAnalysisSchema,
      maxTokens: 2500
    });

    const resumeDoc = {
      userId,
      targetRole,
      analysis,
      tailoredQuestions: analysis.tailoredInterviewQuestions || [],
      uploadedAt: new Date().toISOString()
    };

    const saved = await resumeRepo.create(resumeDoc);

    // Award XP
    await GamificationService.recordActivity(userId, {
      xpGain: XP_REWARDS.RESUME_UPLOAD,
      activityType: 'general'
    });

    return {
      resumeId: saved.id,
      analysis: saved.analysis
    };
  }

  static async getResumeQuestions(userId, resumeId) {
    const resumeDoc = await resumeRepo.findById(resumeId);
    if (!resumeDoc || resumeDoc.userId !== userId) {
      throw new NotFoundError(`Resume ${resumeId} not found`);
    }

    return {
      resumeId: resumeDoc.id,
      candidateName: resumeDoc.analysis?.candidateName,
      questions: resumeDoc.tailoredQuestions || resumeDoc.analysis?.tailoredInterviewQuestions || []
    };
  }
}
