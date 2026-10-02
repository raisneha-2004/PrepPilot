import { AssessmentService } from '../services/AssessmentService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class AssessmentController {
  static async getConfig(req, res, next) {
    try {
      const config = await AssessmentService.getConfig();
      return sendSuccess(res, config);
    } catch (err) {
      next(err);
    }
  }

  static async startAssessment(req, res, next) {
    try {
      const { role, mode, language } = req.body;
      const session = await AssessmentService.startAssessment(req.userId, {
        role,
        mode,
        language
      });
      return sendSuccess(res, session, 201);
    } catch (err) {
      next(err);
    }
  }

  static async saveProgress(req, res, next) {
    try {
      const { id } = req.params;
      const result = await AssessmentService.saveProgress(id, req.body);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async submitAssessment(req, res, next) {
    try {
      const id = req.params.id || req.body.assessmentId;
      const { answers, timeTakenSeconds } = req.body;
      const result = await AssessmentService.submitAssessment(req.userId, id, {
        answers: Array.isArray(answers)
          ? answers.reduce((acc, curr) => {
              if (curr.questionId) acc[curr.questionId] = curr.selectedOption;
              return acc;
            }, {})
          : (answers || {}),
        timeTakenSeconds: timeTakenSeconds || 0
      });
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const history = await AssessmentService.getHistory(req.userId);
      return sendSuccess(res, history);
    } catch (err) {
      next(err);
    }
  }

  static async getLatest(req, res, next) {
    try {
      const latest = await AssessmentService.getLatest(req.userId);
      return sendSuccess(res, latest);
    } catch (err) {
      next(err);
    }
  }

  static async getQuestions(req, res, next) {
    try {
      const { role = 'SDE', mode = 'quick', language = 'JavaScript' } = req.query;
      const session = await AssessmentService.startAssessment(req.userId, {
        role,
        mode,
        language
      });
      return sendSuccess(res, { count: session.questions.length, questions: session.questions });
    } catch (err) {
      next(err);
    }
  }
}
