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

    reply.header('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');

    const posts = await PostService.getRelatedPosts(postId, limit);
    return posts;
  });
}
