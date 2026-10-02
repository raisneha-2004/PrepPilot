import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/responseEnvelope.js';
import { logger } from '../utils/logger.js';
import multer from 'multer';

export const errorHandler = (err, req, res, _next) => {
  const reqId = req.id || 'unknown';

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File too large. Maximum allowed size is 5MB', 400, 'FILE_TOO_LARGE');
    }
    return sendError(res, err.message, 400, 'UPLOAD_ERROR');
  }

  // Handle JSON Syntax Error in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Malformed JSON payload in request body', 400, 'INVALID_JSON');
  }

  // Handle Custom AppError
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ reqId, err: err.message, stack: err.stack, details: err.details }, 'Server AppError');
    } else {
      logger.warn({ reqId, code: err.code, message: err.message, path: req.path }, 'Client AppError');
    }
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // Handle generic / unexpected 500 errors safely
  logger.error({ reqId, err: err.message, stack: err.stack, url: req.url, method: req.method }, 'Unhandled Exception');
  return sendError(res, 'An unexpected internal server error occurred', 500, 'INTERNAL_SERVER_ERROR');
};
