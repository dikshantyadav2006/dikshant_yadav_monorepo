import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { authenticate } from '../middlewares/auth.js';
import { env } from '../config/env.js';

export async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/login
  fastify.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Bad Request', message: 'Email and password are required' });
    }

    const user = await AuthService.verifyCredentials(email, password);
    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid email or password' });
    }

    const token = AuthService.generateToken(user);

    // Set cookie
    const isProd = env.NODE_ENV === 'production';
    
    reply.setCookie('token', token, {
      path: '/',
      domain: isProd ? env.COOKIE_DOMAIN : undefined, // omit domain for local development to prevent chrome block on localhost
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return {
      user,
      token,
    };
  });

  // POST /auth/logout
  fastify.post('/auth/logout', async (request, reply) => {
    const isProd = env.NODE_ENV === 'production';
    reply.clearCookie('token', {
      path: '/',
      domain: isProd ? env.COOKIE_DOMAIN : undefined,
    });
    return { success: true, message: 'Logged out successfully' };
  });

  // GET /auth/me
  fastify.get('/auth/me', { preHandler: [authenticate] }, async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Session not found' });
    }

    const user = await AuthService.findUserById(request.user.id);
    if (!user) {
      return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
    }

    return { user };
  });
}
