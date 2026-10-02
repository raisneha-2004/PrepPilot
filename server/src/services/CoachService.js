import { coachRepo, profileRepo, assessmentRepo } from '../repositories/index.js';
import { aiProvider } from './ai/index.js';
import { buildCoachSystemPrompt, formatCoachUserMessage } from './ai/prompts/coach.js';
import { trimHistory } from '../utils/tokenEstimator.js';
import { TOKEN_LIMITS } from '../config/constants.js';

export class CoachService {
  static async getHistory(userId) {
    const historyDoc = await coachRepo.findById(userId);
    return historyDoc?.messages || [];
  }

  static async sendMessage(userId, userText, { onToken } = {}) {
    const profile = await profileRepo.findById(userId);
    const assessment = await assessmentRepo.findById(userId);

    const targetRole = profile?.targetRole || 'SDE';
    const experienceLevel = profile?.experienceLevel || 'Fresher';
    const dailyHours = profile?.dailyHours || 3;
    const weakAreas = assessment?.weaknesses || [];

    const existingHistoryDoc = await coachRepo.findById(userId);
    const currentMessages = existingHistoryDoc?.messages || [];

    // Add new user message to history
    const userMsg = {
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };
    const updatedMessages = [...currentMessages, userMsg];

    // Trim history to token budget
    const formattedForAI = updatedMessages.map((m) => ({
      role: m.role,
      content: m.role === 'user' ? formatCoachUserMessage(m.content) : m.content
    }));

    const trimmedContext = trimHistory(formattedForAI, TOKEN_LIMITS.COACH_MAX_HISTORY_TOKENS);

    const systemPrompt = buildCoachSystemPrompt({
      targetRole,
      weakAreas,
      experienceLevel,
      dailyHours
    });

    const assistantResponse = await aiProvider.generateText({
      messages: trimmedContext,
      systemPrompt,
      maxTokens: TOKEN_LIMITS.COACH_RESPONSE_MAX_TOKENS,
      temperature: 0.7,
      onToken
    });

    const assistantMsg = {
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date().toISOString()
    };

    const finalMessages = [...updatedMessages, assistantMsg];

    await coachRepo.upsert(userId, {
      userId,
      messages: finalMessages,
      lastUpdated: new Date().toISOString()
    });

    return assistantResponse;
  }
}
