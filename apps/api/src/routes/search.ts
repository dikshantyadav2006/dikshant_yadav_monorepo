import { FastifyInstance } from 'fastify';
import { PostService } from '../services/post.service.js';
import { optionalAuthenticate } from '../middlewares/auth.js';

export async function searchRoutes(fastify: FastifyInstance) {
  // GET /search
  fastify.get('/search', async (request, reply) => {
    const query = request.query as any;
    const q = query.q || '';

    await optionalAuthenticate(request);
    const isAdmin = request.user?.role === 'ADMIN';

    reply.header('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=60');
    const posts = await PostService.searchPosts(q, isAdmin);
    return posts;
  });
}
