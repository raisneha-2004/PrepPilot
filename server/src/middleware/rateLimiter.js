import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { sendError } from '../utils/responseEnvelope.js';

/**
 * Standard API rate limiter
 */
export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId || req.ip || 'anonymous',
  handler: (req, res) => {
    return sendError(
      res,
      'Too many requests from this client, please slow down',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }
});

/**
 * Stricter rate limiter for resource-intensive AI endpoints
 */
export const aiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AI_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId || req.ip || 'anonymous',
  handler: (req, res) => {
    return sendError(
      res,
      'AI generation quota exceeded for your session. Please wait before generating more requests.',
      429,
      'AI_RATE_LIMIT_EXCEEDED'
    );
  }
});
