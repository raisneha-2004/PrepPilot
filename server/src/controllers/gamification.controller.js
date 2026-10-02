import { GamificationService } from '../services/GamificationService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class GamificationController {
  static async getGamification(req, res, next) {
    try {
      const status = await GamificationService.getFullGamificationStatus(req.userId);
      return sendSuccess(res, status);
    } catch (err) {
      next(err);
    }
  }

  static async dismissFreeze(req, res, next) {
    try {
      const result = await GamificationService.dismissFreezeNotice(req.userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}
