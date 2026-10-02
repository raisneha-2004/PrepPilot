export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'PrepPilot AI Placement Preparation API',
    version: '1.0.0',
    description: 'Production-ready backend API for PrepPilot AI placement preparation platform. Features comprehensive preparation tracks, AI mentoring, mock interviews, spaced revision, and gamification.'
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1'
    }
  ],
  components: {
    securitySchemes: {
      DeviceAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-User-Id',
        description: 'Anonymous device or user UUID identifier'
      }
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
          data: { type: 'object' },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' }
            }
          }
        }
      }
    }
  },
  security: [{ DeviceAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'Server Health Check',
        responses: {
          200: { description: 'API Server is healthy and operational' }
        }
      }
    },
    '/profile': {
      get: {
        summary: 'Get user profile',
        responses: {
          200: { description: 'User profile object' }
        }
      },
      post: {
        summary: 'Save/Update candidate profile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['targetRole', 'experienceLevel'],
                properties: {
                  targetRole: { type: 'string', enum: ['SDE', 'Frontend', 'Backend', 'AI-ML'] },
                  experienceLevel: { type: 'string', enum: ['fresher', '1-2-years', '3+-years'] },
                  placementDate: { type: 'string', format: 'date' },
                  dailyHours: { type: 'number', default: 3 },
                  currentSkills: { type: 'array', items: { type: 'string' } },
                  targetCompanies: { type: 'array', items: { type: 'string' } },
                  preferredLanguage: { type: 'string', enum: ['English', 'Hindi', 'Hinglish'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Profile created or updated' }
        }
      }
    },
    '/assessment/questions': {
      get: {
        summary: 'Get placement diagnostic assessment questions',
        parameters: [
          { name: 'sections', in: 'query', schema: { type: 'string' } },
          { name: 'count', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: { 200: { description: 'Questions list' } }
      }
    },
    '/assessment/submit': {
      post: {
        summary: 'Submit diagnostic assessment for scoring & weakness detection',
        responses: { 201: { description: 'Assessment scores and weak areas analysis' } }
      }
    },
    '/planner/generate': {
      post: {
        summary: 'Generate personalized day-wise study roadmap via AI',
        responses: { 201: { description: 'Structured day-wise study plan' } }
      }
    },
    '/coach/message': {
      post: {
        summary: 'Send message to AI Coach (supports SSE streaming)',
        responses: { 200: { description: 'AI Coach conversational reply' } }
      }
    },
    '/dsa/problems': {
      get: {
        summary: 'Get DSA practice problems list',
        parameters: [
          { name: 'topic', in: 'query', schema: { type: 'string' } },
          { name: 'difficulty', in: 'query', schema: { type: 'string', enum: ['easy', 'medium', 'hard'] } }
        ],
        responses: { 200: { description: 'DSA problems array' } }
      }
    },
    '/aptitude/questions': {
      get: {
        summary: 'Get aptitude questions for practice or exam mode',
        responses: { 200: { description: 'Aptitude questions array' } }
      }
    },
    '/cs/{subject}': {
      get: {
        summary: 'Get CS fundamentals topic concepts, examples, and MCQs',
        parameters: [{ name: 'subject', in: 'path', required: true, schema: { type: 'string', enum: ['oop', 'dbms', 'os', 'cn', 'sql'] } }],
        responses: { 200: { description: 'Subject concepts and MCQs' } }
      }
    },
    '/interview/start': {
      post: {
        summary: 'Start an AI mock technical interview session',
        responses: { 201: { description: 'Interview session ID and initial question' } }
      }
    },
    '/resume/upload': {
      post: {
        summary: 'Upload PDF resume for AI parsing and targeted interview preparation',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  resume: { type: 'string', format: 'binary' },
                  targetRole: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Parsed skills, projects, and tailored questions' } }
      }
    },
    '/revision/today': {
      get: {
        summary: 'Get today due spaced repetition revision items (Leitner system)',
        responses: { 200: { description: 'Due questions and topics' } }
      }
    },
    '/readiness': {
      get: {
        summary: 'Get Placement Readiness Score (transparent descriptive metric)',
        responses: { 200: { description: 'Calculated readiness score breakdown and formula' } }
      }
    },
    '/gamification': {
      get: {
        summary: 'Get user XP, level, badges, and streaks',
        responses: { 200: { description: 'Gamification profile' } }
      }
    },
    '/daily': {
      get: {
        summary: 'Get deterministic daily placement challenge',
        responses: { 200: { description: 'Daily challenge items' } }
      }
    },
    '/companies': {
      get: {
        summary: 'Get company preparation resources with verified patterns',
        responses: { 200: { description: 'List of companies' } }
      }
    }
  }
};
