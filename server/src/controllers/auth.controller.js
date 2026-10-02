import { AuthService } from '../services/AuthService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      const result = await AuthService.register({ email, password, name });
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getMe(req.userId);
      return sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  }
}
