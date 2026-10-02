import { DailyService } from '../services/DailyService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class DailyController {
  static async getDaily(req, res, next) {
    try {
      const { date } = req.query;
      const challenge = await DailyService.getDailyChallenge(req.userId, date);
      return sendSuccess(res, challenge);
    } catch (err) {
      next(err);
    }
  }

  static async completeDaily(req, res, next) {
    try {
      const result = await DailyService.completeDailyChallenge(req.userId, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }
}
