import { FastifyInstance } from 'fastify';
import { PostService } from '../services/post.service.js';
import { authenticate } from '../middlewares/auth.js';

export async function searchRoutes(fastify: FastifyInstance) {
  // GET /search
  fastify.get('/search', async (request, reply) => {
    const query = request.query as any;
    const q = query.q || '';

    let isAdmin = false;
    try {
      await authenticate(request, reply);
      if (request.user?.role === 'ADMIN') {
        isAdmin = true;
      }
    } catch (e) {
      // Ignore
    }

    const posts = await PostService.searchPosts(q, isAdmin);
    return posts;
  });
}
