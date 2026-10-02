import crypto from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import { userRepo } from '../repositories/index.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + '_preppilot_salt').digest('hex');
}

export class AuthService {
  static async register({ email, password, name }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await userRepo.findOne((u) => u.email === normalizedEmail);

    if (existing) {
      throw new BadRequestError('An account with this email already exists', 'EMAIL_EXISTS');
    }

    const userId = `user_${uuidv4().substring(0, 8)}`;
    const user = await userRepo.create({
      id: userId,
      name: name?.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    });

    return {
      token: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }

  static async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepo.findOne((u) => u.email === normalizedEmail);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const hashedInput = hashPassword(password);
    if (user.passwordHash !== hashedInput) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    return {
      token: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }

  static async getMe(userId) {
    const user = await userRepo.findById(userId);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }
}
