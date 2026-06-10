import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: 'ADMIN';
    };
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    // 1. Check cookies first (shared auth)
    let token = request.cookies?.token;

    // 2. Fallback to Authorization Header
    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      reply.status(418).send({ error: 'I\'m a teapot', message: 'Unauthorized' }); // Using a fun teapot or 401
      // Let's use standard 401 Unauthorized for client checks
      reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: 'ADMIN';
    };

    request.user = decoded;
  } catch (error) {
    reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await authenticate(request, reply);
  if (reply.sent) return;

  if (request.user?.role !== 'ADMIN') {
    reply.status(403).send({ error: 'Forbidden', message: 'Admin access required' });
  }
}
