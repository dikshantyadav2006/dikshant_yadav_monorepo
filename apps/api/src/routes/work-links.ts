import { FastifyInstance } from 'fastify';
import { WorkLinkService } from '../services/work-link.service.js';
import { requireAdmin, optionalAuthenticate } from '../middlewares/auth.js';

export async function workLinkRoutes(fastify: FastifyInstance) {
  // PUT /works/:id/posts — replace the set of posts linked to a work
  fastify.put('/works/:id/posts', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    if (!Array.isArray(body?.posts)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'posts array is required',
      });
    }

    try {
      const posts = await WorkLinkService.setWorkPosts(id, body.posts);
      return { posts };
    } catch (err: any) {
      if (err?.message === 'Work not found') {
        return reply.status(404).send({ error: 'Not Found', message: 'Work not found' });
      }
      if (err?.message === 'One or more linked posts do not exist') {
        return reply.status(400).send({ error: 'Bad Request', message: err.message });
      }
      throw err;
    }
  });

  // GET /works/:id/posts — posts linked to a work
  fastify.get('/works/:id/posts', async (request, reply) => {
    const { id } = request.params as { id: string };

    await optionalAuthenticate(request);
    const isAdmin = request.user?.role === 'ADMIN';

    const posts = await WorkLinkService.getWorkPosts(id, isAdmin);
    reply.header('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    return { posts };
  });

  // GET /posts/:id/works — works linked to a post
  fastify.get('/posts/:id/works', async (request, reply) => {
    const { id } = request.params as { id: string };

    await optionalAuthenticate(request);
    const isAdmin = request.user?.role === 'ADMIN';

    const works = await WorkLinkService.getPostWorks(id, isAdmin);
    reply.header('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    return { works };
  });
}
