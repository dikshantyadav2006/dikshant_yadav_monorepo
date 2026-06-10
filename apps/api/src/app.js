import Fastify from 'fastify';
import { env } from './config/env.js';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get('/healthz', async () => ({
    ok: true,
    service: '@dikshant/api',
    env: env.NODE_ENV,
  }));

  return app;
}