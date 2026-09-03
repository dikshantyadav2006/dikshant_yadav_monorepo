import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';

import { env } from './config/env.js';
import { authRoutes } from './routes/auth.js';
import { postRoutes } from './routes/posts.js';
import { uploadRoutes } from './routes/upload.js';
import { reactionRoutes } from './routes/reactions.js';
import { searchRoutes } from './routes/search.js';
import { relatedRoutes } from './routes/related.js';
import { visualBuilderRoutes } from './routes/visual-builder.js';
import { settingsRoutes } from './routes/settings.js';
import { shareLinkRoutes } from './routes/share-links.js';
import { workRoutes } from './routes/works.js';
import { workBuilderRoutes } from './routes/works-builder.js';
import { workLinkRoutes } from './routes/work-links.js';
import { contactSubmissionRoutes } from './routes/contact-submissions.js';
import { homepagePostsRoutes } from './routes/homepage-posts.js';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // Register CORS
  // Reflect the request origin so browser cookies (credentials) work cross-origin.
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((s) => s.trim());
  app.register(cors, {
    credentials: true,
    origin: (origin, cb) => {
      if (!origin) { cb(null, true); return; }
      if (allowedOrigins.includes(origin)) { cb(null, origin); return; }
      cb(null, false);
    },
  });

  // Register Helmet (security headers)
  app.register(helmet);

  // Register Cookie
  app.register(cookie, {
    secret: env.JWT_SECRET,
  });

  // Register Multipart for uploads
  // Cap must cover the largest allowed per-type limit (100MB video)
  app.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB cap; per-type limits enforced in routes/upload.ts
    },
  });

  // Register Rate Limiter
  app.register(rateLimit, {
    max: 150,
    timeWindow: '1 minute',
  });

  app.addHook('onResponse', async (request, reply) => {
    const responseTime = reply.elapsedTime;
    if (responseTime > 100 || process.env.LOG_PERF === 'true') {
      request.log.info(
        {
          type: 'api-response',
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          durationMs: Math.round(responseTime),
        },
        'API response timing',
      );
    }
  });

  // Register Custom Routes
  app.register(authRoutes);
  app.register(postRoutes);
  app.register(uploadRoutes);
  app.register(reactionRoutes);
  app.register(searchRoutes);
  app.register(relatedRoutes);
  app.register(visualBuilderRoutes);
  app.register(settingsRoutes);
  app.register(shareLinkRoutes);
  app.register(workRoutes);
  app.register(workBuilderRoutes);
  app.register(workLinkRoutes);
  app.register(contactSubmissionRoutes);
  app.register(homepagePostsRoutes);

  // Global Error Handler
app.setErrorHandler((error: any, request, reply) => {
    app.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: error.message,
        details: error.validation,
      });
    }

    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred.',
    });
  });

  return app;
}
export default buildApp;
