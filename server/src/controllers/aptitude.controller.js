import { AptitudeService } from '../services/AptitudeService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class AptitudeController {
  static async getTopics(req, res, next) {
    try {
      const topics = await AptitudeService.getTopics();
      return sendSuccess(res, { topics });
    } catch (err) {
      next(err);
    }
  }

  static async getQuestions(req, res, next) {
    try {
      const { topic, subtopic, difficulty, mode, count, exclude } = req.query;
      const questions = await AptitudeService.getQuestions({
        topic,
        subtopic,
        difficulty,
        mode: mode || 'practice',
        count: count === 'all' ? 'all' : (count ? Number(count) : 10),
        exclude: exclude ? (Array.isArray(exclude) ? exclude : [exclude]) : []
      });
      return sendSuccess(res, { count: questions.length, questions });
    } catch (err) {
      next(err);
    }
  }

  static async evaluatePracticeAnswer(req, res, next) {
    try {
      const { questionId, selectedOption } = req.body;
      const result = await AptitudeService.evaluatePracticeAnswer({ questionId, selectedOption });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async startExam(req, res, next) {
    try {
      const result = await AptitudeService.startExam(req.userId, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async submitExam(req, res, next) {
    try {
      const { id } = req.params;
      const result = await AptitudeService.submitExam(req.userId, id, req.body);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getExamHistory(req, res, next) {
    try {
      const result = await AptitudeService.getExamHistory(req.userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async submit(req, res, next) {
    try {
      const result = await AptitudeService.submitAptitude(req.userId, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }
}
