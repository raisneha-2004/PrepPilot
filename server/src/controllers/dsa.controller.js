import { DSAService } from '../services/DSAService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class DSAController {
  static async getTopics(req, res, next) {
    try {
      const topics = await DSAService.getTopics();
      return sendSuccess(res, { topics });
    } catch (err) {
      next(err);
    }
  }

  static async getProblems(req, res, next) {
    try {
      const { topic, difficulty, search } = req.query;
      const problems = await DSAService.getProblems({ topic, difficulty, search });
      return sendSuccess(res, { count: problems.length, problems });
    } catch (err) {
      next(err);
    }
  }

  static async getProblemById(req, res, next) {
    try {
      const { id } = req.params;
      const problem = await DSAService.getProblemById(id);
      return sendSuccess(res, problem);
    } catch (err) {
      next(err);
    }
  }

  static async getHint(req, res, next) {
    try {
      const { id } = req.params;
      const { level } = req.body;
      const hint = await DSAService.getHint(id, level);
      return sendSuccess(res, hint);
    } catch (err) {
      next(err);
    }
  }

  static async getFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const feedback = await DSAService.reviewCode(req.userId, id, req.body);
      return sendSuccess(res, feedback);
    } catch (err) {
      next(err);
    }
  }

  static async executeCode(req, res, next) {
    try {
      const result = await DSAService.executeCodeWithJudge0(req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}
