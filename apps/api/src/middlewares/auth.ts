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

function extractToken(request: FastifyRequest): string | undefined {
  let token = request.cookies?.token;

  if (!token) {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  return token;
}

/** Sets request.user when a valid token is present; otherwise leaves the request anonymous. */
export async function optionalAuthenticate(request: FastifyRequest) {
  const token = extractToken(request);
  if (!token) return;

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: 'ADMIN';
    };
    request.user = decoded;
  } catch {
    // Invalid token on a public route — treat as anonymous.
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const token = extractToken(request);

  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: 'ADMIN';
    };
    request.user = decoded;
  } catch {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await authenticate(request, reply);
  if (reply.sent) return;

  if (request.user?.role !== 'ADMIN') {
    return reply.status(403).send({ error: 'Forbidden', message: 'Admin access required' });
  }
}
