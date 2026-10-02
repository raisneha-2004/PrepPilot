import { v4 as uuidv4 } from 'uuid';

/**
 * Lightweight Device/User Identifier Middleware for v1
 * Reads X-User-Id, X-Device-Id, or Bearer token; generates a stable UUID if absent.
 */
export const requireAuth = (req, res, next) => {
  let userId = req.header('x-user-id') || req.header('x-device-id');

  if (!userId) {
    const authHeader = req.header('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      userId = authHeader.substring(7).trim();
    }
  }

  if (!userId) {
    userId = uuidv4();
  }

  req.userId = userId;
  res.setHeader('X-User-Id', userId);
  next();
};
