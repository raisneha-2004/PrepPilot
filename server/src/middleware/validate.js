import { z } from 'zod';
import { sendError } from '../utils/responseEnvelope.js';

/**
 * Zod request validator middleware factory
 * @param {Object} schemas { body, query, params, headers }
 */
export const validate = (schemas = {}) => {
  return async (req, res, next) => {
    try {
      if (schemas.params && schemas.params instanceof z.ZodType) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query && schemas.query instanceof z.ZodType) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.body && schemas.body instanceof z.ZodType) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.headers && schemas.headers instanceof z.ZodType) {
        await schemas.headers.parseAsync(req.headers);
      }
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const issues = err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
          code: i.code
        }));
        return sendError(res, 'Request validation failed', 422, 'VALIDATION_ERROR', issues);
      }
      next(err);
    }
  };
};
