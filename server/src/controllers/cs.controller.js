import { CSService } from '../services/CSService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class CSController {
  static async getSubject(req, res, next) {
    try {
      const { subject } = req.params;
      const data = await CSService.getSubjectOverview(subject);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async submitQuiz(req, res, next) {
    try {
      const { subject } = req.params;
      const result = await CSService.submitSubjectMCQs(req.userId, subject, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }
}
