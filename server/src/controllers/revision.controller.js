import { RevisionService } from '../services/RevisionService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class RevisionController {
  static async record(req, res, next) {
    try {
      const result = await RevisionService.recordReview(req.userId, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getToday(req, res, next) {
    try {
      const due = await RevisionService.getTodayDue(req.userId);
      return sendSuccess(res, due);
    } catch (err) {
      next(err);
    }
  }
}
