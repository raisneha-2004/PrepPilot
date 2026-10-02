import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { requestId } from './middleware/requestId.js';
import { requireAuth } from './middleware/auth.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendSuccess } from './utils/responseEnvelope.js';
import { NotFoundError } from './utils/errors.js';
import { swaggerDocument } from './config/swaggerSpec.js';

// Import route modules
import profileRoutes from './routes/profile.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';
import plannerRoutes from './routes/planner.routes.js';
import coachRoutes from './routes/coach.routes.js';
import dsaRoutes from './routes/dsa.routes.js';
import aptitudeRoutes from './routes/aptitude.routes.js';
import csRoutes from './routes/cs.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import revisionRoutes from './routes/revision.routes.js';
import readinessRoutes from './routes/readiness.routes.js';
import gamificationRoutes from './routes/gamification.routes.js';
import dailyRoutes from './routes/daily.routes.js';
import companyRoutes from './routes/company.routes.js';
import authRoutes from './routes/auth.routes.js';

export const createApp = () => {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false // Allows Swagger UI inline assets
    })
  );

  // CORS allowlist
  const corsOrigins = env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',').map((s) => s.trim());
  app.use(
    cors({
      origin: corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-Device-Id', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id', 'X-User-Id']
    })
  );

  // Request ID
  app.use(requestId);

  // Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(
      pinoHttp({
        logger,
        genReqId: (req) => req.id,
        autoLogging: {
          ignore: (req) => req.url === '/health' || req.url.startsWith('/docs')
        }
      })
    );
  }

  // Body Parsing with size limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Health Check
  const healthHandler = (req, res) => {
    return sendSuccess(res, {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      aiProvider: env.AI_PROVIDER
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  // OpenAPI Swagger Docs
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Rate Limiting & User Identification for API routes
  app.use('/api/v1', generalRateLimiter);
  app.use('/api/v1', requireAuth);

  // Mount API Modules under /api/v1
  app.use('/api/v1/profile', profileRoutes);
  app.use('/api/v1/assessment', assessmentRoutes);
  app.use('/api/v1/planner', plannerRoutes);
  app.use('/api/v1/coach', coachRoutes);
  app.use('/api/v1/dsa', dsaRoutes);
  app.use('/api/v1/aptitude', aptitudeRoutes);
  app.use('/api/v1/cs', csRoutes);
  app.use('/api/v1/interview', interviewRoutes);
  app.use('/api/v1/resume', resumeRoutes);
  app.use('/api/v1/revision', revisionRoutes);
  app.use('/api/v1', readinessRoutes); // /readiness and /progress
  app.use('/api/v1/gamification', gamificationRoutes);
  app.use('/api/v1/daily', dailyRoutes);
  app.use('/api/v1/companies', companyRoutes);
  app.use('/api/v1/auth', authRoutes);

  // Catch-all 404 handler
  app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
