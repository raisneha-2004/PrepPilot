import { mockProfile, mockReadiness, mockGamification, mockPlanner } from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

function getUserId(): string {
  let id = localStorage.getItem('preppilot_user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('preppilot_user_id', id);
  }
  return id;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const userId = getUserId();
  const requestId = 'req_' + Math.random().toString(36).substring(2, 9);

  const headers: Record<string, string> = {
    'X-User-Id': userId,
    'X-Request-Id': requestId,
    ...(options.headers as Record<string, string> || {})
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    // Guard against empty body or non-OK response before parsing JSON
    const text = await res.text();
    let data: any = null;

    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch {
        console.warn(`[PrepPilot API] Non-JSON response for ${endpoint} (${res.status}):`, text.substring(0, 100));
        if (!res.ok) {
          throw new Error(`Server returned error (${res.status}): ${res.statusText || 'Request failed'}`);
        }
        throw new Error(`Invalid response format from server (${res.status})`);
      }
    }

    if (!res.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        `Server error (${res.status}: ${res.statusText || 'Request failed'})`;
      throw new Error(errorMessage);
    }

    // If body was empty but response was OK (e.g. 204 No Content)
    if (!data) {
      return {} as T;
    }

    // Handle standard ApiResponse<T> wrapper
    if (typeof data === 'object' && 'ok' in data && !data.ok) {
      throw new Error(data.error?.message || `API Error (${res.status})`);
    }

    return (data.data !== undefined ? data.data : data) as T;
  } catch (err: any) {
    console.warn(`[PrepPilot API] Request failed for ${endpoint}:`, err.message);
    throw err;
  }
}

// 0. Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient<{ token: string; user: { id: string; name: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  register: (payload: { email: string; password: string; name?: string }) =>
    apiClient<{ token: string; user: { id: string; name: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getMe: () =>
    apiClient<{ user: { id: string; name: string; email: string } | null }>('/auth/me').catch(() => ({ user: null }))
};

// 1. Profile API
export const profileApi = {
  getProfile: () => apiClient<any>('/profile').catch(() => mockProfile),
  saveProfile: (profile: any) => apiClient<any>('/profile', { method: 'POST', body: JSON.stringify(profile) })
};

// 2. Assessment API
export const assessmentApi = {
  getConfig: () => apiClient<any>('/assessment/config'),
  startAssessment: (payload: { role?: string; mode?: string; language?: string }) =>
    apiClient<{ assessmentId: string; mode: string; role: string; language: string; durationSeconds: number; totalQuestions: number; questions: any[]; seed: number }>('/assessment/start', { method: 'POST', body: JSON.stringify(payload) }),
  saveProgress: (id: string, payload: { answers?: Record<string, number>; timeRemainingSeconds?: number; markedForReview?: string[] }) =>
    apiClient<any>(`/assessment/${id}/progress`, { method: 'PATCH', body: JSON.stringify(payload) }).catch(() => null),
  submitAssessment: (data: { assessmentId?: string; answers: any; timeTakenSeconds: number }) =>
    apiClient<any>(data.assessmentId ? `/assessment/${data.assessmentId}/submit` : '/assessment/submit', { method: 'POST', body: JSON.stringify(data) }),
  getHistory: () => apiClient<{ count: number; history: any[] }>('/assessment/history').catch(() => ({ count: 0, history: [] })),
  getLatest: () => apiClient<any>('/assessment/latest').catch(() => null),
  getQuestions: (sections?: string[], count = 20) =>
    apiClient<{ count: number; questions: any[] }>(`/assessment/questions?${sections ? `sections=${sections.join(',')}&` : ''}count=${count}`)
};

// 3. Planner API
export const plannerApi = {
  getPlan: () => apiClient<any>('/planner').catch(() => mockPlanner),
  generatePlan: (options: any) =>
    apiClient<any>('/planner/generate', { method: 'POST', body: JSON.stringify(options) }).catch(() => mockPlanner),
  updateDay: (dayId: string, updates: { completed?: boolean; rescheduledTo?: string }) =>
    apiClient<any>(`/planner/day/${dayId}`, { method: 'PATCH', body: JSON.stringify(updates) })
};

// 4. Coach API
export const coachApi = {
  getHistory: () => apiClient<{ count: number; history: any[] }>('/coach/history').catch(() => ({ count: 0, history: [] })),
  sendMessage: async (message: string, onChunk?: (chunk: string) => void): Promise<string> => {
    const userId = getUserId();
    const res = await fetch(`${BASE_URL}/coach/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        Accept: onChunk ? 'text/event-stream' : 'application/json'
      },
      body: JSON.stringify({ message, stream: !!onChunk })
    });

    if (onChunk && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.substring(6));
              if (parsed.token) {
                fullText += parsed.token;
                onChunk(parsed.token);
              }
              if (parsed.fullResponse) {
                fullText = parsed.fullResponse;
              }
            } catch (_) {}
          }
        }
      }
      return fullText || 'Got your query! Let’s break down the optimal approach step by step.';
    }

    const text = await res.text();
    let data: any = null;
    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch {}
    }
    return data?.data?.response || data?.response || 'Let me help you with that concept!';
  }
};

// 5. DSA API
export const dsaApi = {
  getTopics: () => apiClient<{ topics: any[] }>('/dsa/topics').catch(() => ({ topics: [] })),
  getProblems: (params?: { topic?: string; difficulty?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return apiClient<{ count: number; problems: any[] }>(`/dsa/problems?${q}`).catch(() => ({ count: 0, problems: [] }));
  },
  getProblemById: (id: string) => apiClient<any>(`/dsa/problems/${id}`),
  getHint: (id: string, level = 1) => apiClient<any>(`/dsa/problems/${id}/hint`, { method: 'POST', body: JSON.stringify({ level }) }),
  getFeedback: (id: string, payload: { language: string; code: string; testResults?: any; userMessage?: string }) =>
    apiClient<any>(`/dsa/problems/${id}/feedback`, { method: 'POST', body: JSON.stringify(payload) }),
  executeCode: (payload: { language: string; sourceCode: string; stdin?: string }) =>
    apiClient<any>('/dsa/execute', { method: 'POST', body: JSON.stringify(payload) })
};

// 6. Aptitude API
export const aptitudeApi = {
  getTopics: () =>
    apiClient<{ topics: any[] }>('/aptitude/topics').catch(() => ({
      topics: [
        { topic: 'Quantitative Aptitude', count: 120, difficulty: 'medium' },
        { topic: 'Logical Reasoning', count: 100, difficulty: 'medium' },
        { topic: 'Verbal Ability', count: 80, difficulty: 'easy' },
        { topic: 'Data Interpretation', count: 60, difficulty: 'hard' }
      ]
    })),
  getQuestions: (params?: { topic?: string; subtopic?: string; difficulty?: string; mode?: string; count?: number | string }) => {
    const q = new URLSearchParams(params as any).toString();
    return apiClient<{ count: number; questions: any[] }>(`/aptitude/questions?${q}`).catch(() => ({ count: 0, questions: [] }));
  },
  evaluatePracticeAnswer: (payload: { questionId: string; selectedOption: number }) =>
    apiClient<{ questionId: string; isCorrect: boolean; correctOption: number; explanation: string; shortcut?: string; hints: string[] }>('/aptitude/practice/answer', { method: 'POST', body: JSON.stringify(payload) }),
  startExam: (payload: { preset?: string; topic?: string; count?: number; durationMinutes?: number; negativeMarking?: boolean }) =>
    apiClient<{ examId: string; preset: string; durationSeconds: number; startTime: string; negativeMarking: boolean; seed: number; questions: any[] }>('/aptitude/exam/start', { method: 'POST', body: JSON.stringify(payload) }),
  submitExam: (id: string, payload: { answers: Record<string, number>; timeTakenSeconds: number; tabSwitches?: number }) =>
    apiClient<any>(`/aptitude/exam/${id}/submit`, { method: 'POST', body: JSON.stringify(payload) }),
  getExamHistory: () =>
    apiClient<{ count: number; history: any[] }>('/aptitude/exam/history').catch(() => ({ count: 0, history: [] })),
  submit: (payload: { answers: any; mode?: string; timeTakenSeconds?: number; examId?: string; tabSwitches?: number }) =>
    apiClient<any>('/aptitude/submit', { method: 'POST', body: JSON.stringify(payload) })
};

// 7. CS API
export const csApi = {
  getSubject: (subject: string) => apiClient<any>(`/cs/${subject}`),
  submitQuiz: (subject: string, answers: any[]) =>
    apiClient<any>(`/cs/${subject}/submit`, { method: 'POST', body: JSON.stringify({ answers }) })
};

// 8. Interview API
export const interviewApi = {
  start: (payload: { role?: string; difficulty?: string; resumeId?: string | null }) =>
    apiClient<any>('/interview/start', { method: 'POST', body: JSON.stringify(payload) }),
  submitAnswer: (id: string, candidateAnswer: string) =>
    apiClient<any>(`/interview/${id}/answer`, { method: 'POST', body: JSON.stringify({ candidateAnswer }) }),
  finish: (id: string) => apiClient<any>(`/interview/${id}/finish`, { method: 'POST' }),
  getHistory: () => apiClient<{ count: number; history: any[] }>('/interview/history')
};

// 9. Resume API
export const resumeApi = {
  uploadResume: (file: File, targetRole = 'SDE') => {
    const form = new FormData();
    form.append('resume', file);
    form.append('targetRole', targetRole);
    return apiClient<any>('/resume/upload', { method: 'POST', body: form });
  },
  getQuestions: (resumeId: string) => apiClient<any>(`/resume/${resumeId}/questions`, { method: 'POST' })
};

// 10. Revision API
export const revisionApi = {
  getTodayDue: () => apiClient<any>('/revision/today'),
  recordReview: (payload: { topic: string; questionId?: string; isCorrect: boolean }) =>
    apiClient<any>('/revision/record', { method: 'POST', body: JSON.stringify(payload) })
};

// 11. Readiness & Progress API
export const readinessApi = {
  getReadiness: () => apiClient<any>('/readiness').catch(() => mockReadiness),
  getProgress: () => apiClient<any>('/progress').catch(() => mockGamification)
};

// 12. Gamification API
export const gamificationApi = {
  getStatus: () => apiClient<any>('/gamification').catch(() => mockGamification),
  recordActivity: (payload?: any) => apiClient<any>('/gamification/record', { method: 'POST', body: JSON.stringify(payload) }).catch(() => null),
  dismissFreezeNotice: () => apiClient<any>('/gamification/dismiss-freeze', { method: 'POST' }).catch(() => null)
};

// 13. Daily Challenge API
export const dailyApi = {
  getDaily: (date?: string) => apiClient<any>(`/daily${date ? `?date=${date}` : ''}`),
  completeDaily: (payload: { answers: any[]; timeTakenSeconds?: number }) =>
    apiClient<any>('/daily/complete', { method: 'POST', body: JSON.stringify(payload) })
};

// 14. Company Mode API
export const companyApi = {
  getAll: () => apiClient<{ count: number; companies: any[] }>('/companies'),
  getById: (id: string) => apiClient<any>(`/companies/${id}`)
};
