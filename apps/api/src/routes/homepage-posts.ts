import { FastifyInstance } from 'fastify';
import { prisma } from '@dikshant/database';
import { getCached, setCache } from '../lib/cache.js';

const FEATURED_DISPLAY_STATUSES = ['PUBLISHED', 'SCHEDULED'] as const;

const postSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  readingTime: true,
  publishedAt: true,
  featured: true,
  featuredPinned: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
  featuredImage: {
    select: { id: true, publicUrl: true, alt: true, width: true, height: true, blurDataUrl: true, dominantColor: true },
  },
  featuredBannerImage: {
    select: { id: true, publicUrl: true, alt: true, width: true, height: true, blurDataUrl: true, dominantColor: true },
  },
  tags: {
    select: { tag: { select: { id: true, name: true, slug: true } } },
  },
} as const;

export async function homepagePostsRoutes(fastify: FastifyInstance) {
  fastify.get('/homepage-posts', async (_request, reply) => {
    const cacheKey = 'homepage-posts';
    const cached = getCached<any>(cacheKey);
    if (cached) {
      reply.header('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
      return cached;
    }

    const config = await prisma.siteConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default' },
      update: {},
    });

    const featuredCount = Math.max(1, Math.min(5, config.homepageFeaturedCount || 1));
    const latestCount = Math.max(1, Math.min(10, config.homepageLatestCount || 3));

    const [featured, latest] = await Promise.all([
      prisma.post.findMany({
        where: {
          status: { in: [...FEATURED_DISPLAY_STATUSES] },
          featured: true,
        },
        select: postSelect,
        orderBy: [{ featuredPinned: 'desc' }, { publishedAt: 'desc' }],
        take: featuredCount,
      }),
      prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
        },
        select: postSelect,
        orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
        take: latestCount,
      }),
    ]);

    const result = { featured, latest };
    setCache(cacheKey, result, 30_000);
    reply.header('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    return result;
  });
}
