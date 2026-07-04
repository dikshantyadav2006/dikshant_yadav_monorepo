import { FastifyInstance } from 'fastify';
import { PostService } from '../services/post.service.js';
import { requireAdmin, optionalAuthenticate } from '../middlewares/auth.js';
import crypto from 'crypto';
import { prisma } from '@dikshant/database';
import { getCached, setCache, clearCache } from '../lib/cache.js';

export async function postRoutes(fastify: FastifyInstance) {
  // Helpers to get visitor hash
  function getVisitorHash(ip: string, userAgent: string = '') {
    return crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');
  }

  // GET /posts
  fastify.get('/posts', async (request, reply) => {
    const query = request.query as any;
    
    await optionalAuthenticate(request);
    const isAdmin = request.user?.role === 'ADMIN';

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const featured = query.featured === 'true' ? true : query.featured === 'false' ? false : undefined;
    const categoryId = query.categoryId;
    const categorySlug = query.categorySlug;
    const tagId = query.tagId;
    const tagSlug = query.tagSlug;
    const status = query.status;

    const result = await PostService.listPosts({
      page,
      limit,
      featured,
      categoryId,
      categorySlug,
      tagId,
      tagSlug,
      status,
      isAdmin,
    });

    if (!isAdmin) {
      reply.header('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    }
    return result;
  });

  // GET /posts/:slug
  fastify.get('/posts/:slug', async (request, reply) => {
    const { slug } = request.params as any;
    const requestStart = performance.now();

    await optionalAuthenticate(request);
    const isAdmin = request.user?.role === 'ADMIN';

    const post = await PostService.getPostBySlugOrId(slug, isAdmin);
    if (!post) {
      return reply.status(404).send({ error: 'Not Found', message: 'Post not found' });
    }

    const ip = request.ip || '127.0.0.1';
    const userAgent = request.headers['user-agent'] || '';
    const visitorHash = getVisitorHash(ip, userAgent);

    void PostService.incrementViews(post.id, {
      path: `/posts/${post.id}/${post.slug}`,
      visitorHash,
      referrer: request.headers.referer,
      userAgent,
    }).catch((err) => {
      fastify.log.error(err, 'Failed to track view');
    });

    reply.header('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');

    fastify.log.info(
      {
        type: 'api-post-detail',
        postId: post.id,
        durationMs: Math.round(performance.now() - requestStart),
      },
      'Post detail served',
    );

    return post;
  });

  // POST /posts
  fastify.post('/posts', { preHandler: [requireAdmin] }, async (request, reply) => {
    const body = request.body as any;
    if (!body.title || !body.content) {
      return reply.status(400).send({ error: 'Bad Request', message: 'Title and content are required' });
    }

    const post = await PostService.createPost({
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      categoryId: body.categoryId,
      featuredImageId: body.featuredImageId,
      featuredBannerImageId: body.featuredBannerImageId,
      featuredBannerImageMeta: body.featuredBannerImageMeta,
      tags: body.tags,
      status: body.status,
      featured: body.featured,
      featuredPinned: body.featuredPinned,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      authorId: request.user!.id,
    });

    return post;
  });

  // PATCH /posts/:id
  fastify.patch('/posts/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as any;
    const body = request.body as any;

    const post = await PostService.updatePost({
      id,
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      categoryId: body.categoryId,
      featuredImageId: body.featuredImageId,
      featuredBannerImageId: body.featuredBannerImageId,
      featuredBannerImageMeta: body.featuredBannerImageMeta,
      tags: body.tags,
      status: body.status,
      featured: body.featured,
      featuredPinned: body.featuredPinned,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
    });

    return post;
  });

  // DELETE /posts/:id
  fastify.delete('/posts/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await PostService.deletePost(id);
      return { success: true, message: 'Post deleted successfully' };
    } catch (err: any) {
      if (err?.code === 'P2025') {
        return reply.status(404).send({ error: 'Not Found', message: 'Post not found' });
      }
      throw err;
    }
  });

  // Additional helper routes for Categories and Tags
  
  // GET /categories
  fastify.get('/categories', async (_request, reply) => {
    const cached = getCached<any[]>('categories');
    if (cached) {
      reply.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
      return cached;
    }

    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true, description: true },
      orderBy: { name: 'asc' },
    });

    setCache('categories', categories, 60_000);
    reply.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return categories;
  });

  // POST /categories
  fastify.post('/categories', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { name, slug, description } = request.body as any;
    if (!name || !slug) {
      return reply.status(400).send({ error: 'Bad Request', message: 'Name and Slug are required' });
    }

    const category = await prisma.category.create({
      data: { name, slug, description },
    });

    clearCache('categories');
    return category;
  });

  // GET /tags
  fastify.get('/tags', async (_request, reply) => {
    const cached = getCached<any[]>('tags');
    if (cached) {
      reply.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
      return cached;
    }

    const tags = await prisma.tag.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });

    setCache('tags', tags, 60_000);
    reply.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return tags;
  });

  // POST /tags
  fastify.post('/tags', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { name, slug, description } = request.body as any;
    if (!name || !slug) {
      return reply.status(400).send({ error: 'Bad Request', message: 'Name and Slug are required' });
    }

    const tag = await prisma.tag.create({
      data: { name, slug, description },
    });

    clearCache('tags');
    return tag;
  });
}
