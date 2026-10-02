import { ReadinessService } from '../services/ReadinessService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class ReadinessController {
  static async getReadiness(req, res, next) {
    try {
      const scoreData = await ReadinessService.calculateReadinessScore(req.userId);
      return sendSuccess(res, scoreData);
    } catch (err) {
      next(err);
    }
  }

  static async getProgress(req, res, next) {
    try {
      const progress = await ReadinessService.getOverallProgress(req.userId);
      return sendSuccess(res, progress);
    } catch (err) {
      next(err);
    }
  }
}
