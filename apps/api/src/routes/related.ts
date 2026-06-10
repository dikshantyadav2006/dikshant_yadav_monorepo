import { FastifyInstance } from 'fastify';
import { PostService } from '../services/post.service.js';

export async function relatedRoutes(fastify: FastifyInstance) {
  // GET /related
  fastify.get('/related', async (request, reply) => {
    const query = request.query as any;
    const postId = query.postId;
    const limit = parseInt(query.limit) || 3;

    if (!postId) {
      return reply.status(400).send({ error: 'Bad Request', message: 'postId query parameter is required' });
    }

    const posts = await PostService.getRelatedPosts(postId, limit);
    return posts;
  });
}
