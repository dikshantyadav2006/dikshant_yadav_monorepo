import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';

import { env } from './config/env.js';
import { authRoutes } from './routes/auth.js';
import { postRoutes } from './routes/posts.js';
import { uploadRoutes } from './routes/upload.js';
import { reactionRoutes } from './routes/reactions.js';
import { searchRoutes } from './routes/search.js';
import { relatedRoutes } from './routes/related.js';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // Register CORS
  app.register(cors, {
    origin: env.NODE_ENV === 'production'
      ? [/dikshantyadav\.in$/]
      : true, // true allows localhost:3000 / localhost:3001 etc.
    credentials: true,
  });

  // Register Cookie
  app.register(cookie, {
    secret: env.JWT_SECRET,
  });

  // Register Multipart for uploads
  app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });

  // Register Rate Limiter
  app.register(rateLimit, {
    max: 150,
    timeWindow: '1 minute',
  });

  // Register Custom Routes
  app.register(authRoutes);
  app.register(postRoutes);
  app.register(uploadRoutes);
  app.register(reactionRoutes);
  app.register(searchRoutes);
  app.register(relatedRoutes);

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
