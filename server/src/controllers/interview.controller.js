import { InterviewService } from '../services/InterviewService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class InterviewController {
  static async start(req, res, next) {
    try {
      const result = await InterviewService.startInterview(req.userId, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async submitAnswer(req, res, next) {
    try {
      const { id } = req.params;
      const result = await InterviewService.submitAnswer(req.userId, id, req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async finish(req, res, next) {
    try {
      const { id } = req.params;
      const result = await InterviewService.finishInterview(req.userId, id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const history = await InterviewService.getHistory(req.userId);
      return sendSuccess(res, { count: history.length, history });
    } catch (err) {
      next(err);
    }
  }
}
