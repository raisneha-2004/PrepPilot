import { CoachService } from '../services/CoachService.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export class CoachController {
  static async sendMessage(req, res, next) {
    try {
      const { message, stream } = req.body;
      const isStreaming = stream === true || req.headers.accept === 'text/event-stream';

      if (isStreaming) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        const onToken = (chunk) => {
          res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
        };

        const fullResponse = await CoachService.sendMessage(req.userId, message, { onToken });
        res.write(`data: ${JSON.stringify({ done: true, fullResponse })}\n\n`);
        return res.end();
      } else {
        const fullResponse = await CoachService.sendMessage(req.userId, message);
        return sendSuccess(res, { response: fullResponse });
      }
    } catch (err) {
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        return res.end();
      }
      next(err);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const history = await CoachService.getHistory(req.userId);
      return sendSuccess(res, { count: history.length, history });
    } catch (err) {
      next(err);
    }
  }
}
