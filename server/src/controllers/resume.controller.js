import { ResumeService } from '../services/ResumeService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';
import { BadRequestError } from '../utils/errors.js';

export class ResumeController {
  static async uploadResume(req, res, next) {
    try {
      if (!req.file || !req.file.buffer) {
        throw new BadRequestError('Resume file is required (PDF format, max 5MB)');
      }

      const targetRole = req.body?.targetRole || 'SDE';
      const result = await ResumeService.processResumeUpload(req.userId, req.file.buffer, targetRole);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getPersonalizedQuestions(req, res, next) {
    try {
      const { id } = req.params;
      const questions = await ResumeService.getResumeQuestions(req.userId, id);
      return sendSuccess(res, questions);
    } catch (err) {
      next(err);
    }
  }
}
