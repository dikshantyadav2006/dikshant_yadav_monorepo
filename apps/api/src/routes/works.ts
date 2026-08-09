import { FastifyInstance } from 'fastify';
import { WorkService } from '../services/work.service.js';
import { requireAdmin, optionalAuthenticate } from '../middlewares/auth.js';

export async function workRoutes(fastify: FastifyInstance) {
  // GET /works
  fastify.get('/works', async (request, reply) => {
    const query = request.query as any;

    await optionalAuthenticate(request);
    const isAdmin = request.user?.role === 'ADMIN';

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const featured = query.featured === 'true' ? true : query.featured === 'false' ? false : undefined;
    const category = query.category;
    const year = query.year;
    const status = query.status;

    const result = await WorkService.listWorks({
      page,
      limit,
      featured,
      category,
      year,
      status,
      isAdmin,
    });

    if (!isAdmin) {
      reply.header('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    }
    return result;
  });

  // GET /works/:slug
  fastify.get('/works/:slug', async (request, reply) => {
    const { slug } = request.params as any;

    await optionalAuthenticate(request);
    const isAdmin = request.user?.role === 'ADMIN';

    const work = await WorkService.getWorkBySlugOrId(slug, isAdmin);
    if (!work) {
      return reply.status(404).send({ error: 'Not Found', message: 'Work not found' });
    }

    reply.header('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    return work;
  });

  // POST /works
  fastify.post('/works', { preHandler: [requireAdmin] }, async (request, reply) => {
    const body = request.body as any;
    if (!body.title) {
      return reply.status(400).send({ error: 'Bad Request', message: 'Title is required' });
    }

    const work = await WorkService.createWork({
      title: body.title,
      subtitle: body.subtitle,
      category: body.category,
      year: body.year,
      heroImageUrl: body.heroImageUrl,
      imageUrl: body.imageUrl,
      overview: body.overview,
      description: body.description,
      techStack: body.techStack,
      link: body.link,
      swatchColor: body.swatchColor,
      credits: body.credits,
      status: body.status,
      featured: body.featured,
      featuredPinned: body.featuredPinned,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      authorId: request.user!.id,
    });

    return work;
  });

  // PATCH /works/:id
  fastify.patch('/works/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as any;
    const body = request.body as any;

    try {
      const work = await WorkService.updateWork({
        id,
        title: body.title,
        subtitle: body.subtitle,
        category: body.category,
        year: body.year,
        heroImageUrl: body.heroImageUrl,
        imageUrl: body.imageUrl,
        overview: body.overview,
        description: body.description,
        techStack: body.techStack,
        link: body.link,
        swatchColor: body.swatchColor,
        credits: body.credits,
        status: body.status,
        featured: body.featured,
        featuredPinned: body.featuredPinned,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
      });

      return work;
    } catch (err: any) {
      if (err?.message === 'Work not found') {
        return reply.status(404).send({ error: 'Not Found', message: 'Work not found' });
      }
      throw err;
    }
  });

  // DELETE /works/:id
  fastify.delete('/works/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await WorkService.deleteWork(id);
      return { success: true, message: 'Work deleted successfully' };
    } catch (err: any) {
      if (err?.code === 'P2025') {
        return reply.status(404).send({ error: 'Not Found', message: 'Work not found' });
      }
      throw err;
    }
  });
}
