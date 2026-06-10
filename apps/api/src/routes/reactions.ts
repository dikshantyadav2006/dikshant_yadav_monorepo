import { FastifyInstance } from 'fastify';
import { ReactionService } from '../services/reaction.service.js';
import crypto from 'crypto';

export async function reactionRoutes(fastify: FastifyInstance) {
  function getVisitorHash(ip: string, userAgent: string = '') {
    return crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');
  }

  // POST /reactions
  fastify.post('/reactions', async (request, reply) => {
    const { postId, type } = request.body as any;
    if (!postId || !type) {
      return reply.status(400).send({ error: 'Bad Request', message: 'postId and type are required' });
    }

    const ip = request.ip || '127.0.0.1';
    const userAgent = request.headers['user-agent'] || '';
    const visitorHash = getVisitorHash(ip, userAgent);

    try {
      const result = await ReactionService.toggleReaction(postId, type, visitorHash);
      const postState = await ReactionService.getReactionsForPost(postId, visitorHash);
      return {
        success: true,
        reacted: result.reacted,
        ...postState,
      };
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  });

  // GET /reactions/:postId
  fastify.get('/reactions/:postId', async (request, reply) => {
    const { postId } = request.params as any;
    const ip = request.ip || '127.0.0.1';
    const userAgent = request.headers['user-agent'] || '';
    const visitorHash = getVisitorHash(ip, userAgent);

    try {
      const result = await ReactionService.getReactionsForPost(postId, visitorHash);
      return result;
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  });
}
