import { ProfileService } from '../services/ProfileService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class ProfileController {
  static async getProfile(req, res, next) {
    try {
      const profile = await ProfileService.getProfile(req.userId);
      return sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  static async saveProfile(req, res, next) {
    try {
      const saved = await ProfileService.saveProfile(req.userId, req.body);
      return sendSuccess(res, saved, 201);
    } catch (err) {
      next(err);
    }
  }
}
