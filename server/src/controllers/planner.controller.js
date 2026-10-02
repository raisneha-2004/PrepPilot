import { PlannerService } from '../services/PlannerService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class PlannerController {
  static async generate(req, res, next) {
    try {
      const plan = await PlannerService.generatePlan(req.userId, req.body);
      return sendSuccess(res, plan, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getPlan(req, res, next) {
    try {
      const plan = await PlannerService.getPlan(req.userId);
      return sendSuccess(res, plan);
    } catch (err) {
      next(err);
    }
  }

  static async updateDay(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await PlannerService.updateDayStatus(req.userId, id, req.body);
      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }
}
