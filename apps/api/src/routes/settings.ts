import { FastifyInstance } from 'fastify';
import { prisma } from '@dikshant/database';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { getCached, setCache, clearCache } from '../lib/cache.js';

const DEFAULT_HOMEPAGE_CONFIG = {
  featuredLayout: 'hero-grid',
  heroSectionStyle: 'editorial',
  showLatestArticles: true,
  showPopularArticles: true,
  showCategories: true,
  showTrendingTopics: true,
} as const;

const DEFAULT_CONNECT_URL = 'https://www.dikshantyadav.in/connect';

function normalizeConnectUrl(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : DEFAULT_CONNECT_URL;
}

const DEFAULT_WORKS_INTRO = {
  script: 'All',
  title: 'WORKS',
} as const;

function normalizeWorksIntro(value: unknown) {
  const base = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    script: typeof base.script === 'string' && base.script.trim() ? base.script : DEFAULT_WORKS_INTRO.script,
    title: typeof base.title === 'string' && base.title.trim() ? base.title : DEFAULT_WORKS_INTRO.title,
  };
}

function clampInt(value: unknown, min: number, max: number) {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.max(min, Math.min(max, Math.trunc(num)));
}

function resolveAutosaveInterval(value: unknown) {
  const allowed = new Set([30000, 60000, 120000, 300000]);
  const ms = clampInt(value, 30000, 300000);
  if (ms == null) return null;
  return allowed.has(ms) ? ms : null;
}

function normalizeHomepageConfig(config: unknown) {
  return {
    ...DEFAULT_HOMEPAGE_CONFIG,
    ...(config && typeof config === 'object' ? config : {}),
  };
}

export async function settingsRoutes(fastify: FastifyInstance) {
  fastify.get('/site-config', async (request, reply) => {
    const cached = getCached<{ homepageFeaturedCount: number; homepageConfig: any; socialLinks: any }>('site-config');
    if (cached) {
      reply.header('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
      return cached;
    }

    const config = await prisma.siteConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default', homepageConfig: DEFAULT_HOMEPAGE_CONFIG },
      update: {},
    });

    const result = {
      homepageFeaturedCount: config.homepageFeaturedCount,
      homepageConfig: normalizeHomepageConfig(config.homepageConfig),
      worksIntro: normalizeWorksIntro(config.worksIntro),
      socialLinks: config.socialLinks ?? [],
      connectUrl: normalizeConnectUrl(config.connectUrl),
    };

    setCache('site-config', result, 30_000);
    reply.header('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    return result;
  });

  fastify.get('/social-links', async (request, reply) => {
    const cached = getCached<any[]>('social-links');
    if (cached) {
      reply.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
      return cached;
    }

    const config = await prisma.siteConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default', homepageConfig: DEFAULT_HOMEPAGE_CONFIG },
      update: {},
    });

    const links = config.socialLinks ?? [];
    setCache('social-links', links, 60_000);
    reply.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return links;
  });

  fastify.get('/settings', { preHandler: [requireAdmin] }, async () => {
    const config = await prisma.siteConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default', homepageConfig: DEFAULT_HOMEPAGE_CONFIG },
      update: {},
    });

    return {
      ...config,
      homepageConfig: normalizeHomepageConfig(config.homepageConfig),
      worksIntro: normalizeWorksIntro(config.worksIntro),
      connectUrl: normalizeConnectUrl(config.connectUrl),
    };
  });

  fastify.patch('/settings', { preHandler: [requireAdmin] }, async (request, reply) => {
    const body = request.body as any;

    const data: any = {};

    if (body.homepageFeaturedCount !== undefined) {
      const nextCount = clampInt(body.homepageFeaturedCount, 1, 5);
      if (nextCount == null) {
        return reply.status(400).send({ error: 'Bad Request', message: 'homepageFeaturedCount must be a number between 1 and 5' });
      }
      data.homepageFeaturedCount = nextCount;
    }

    if (body.homepageConfig !== undefined) {
      data.homepageConfig = normalizeHomepageConfig(body.homepageConfig);
    }

    if (body.autosaveEnabled !== undefined) {
      data.autosaveEnabled = Boolean(body.autosaveEnabled);
    }

    if (body.autosaveIntervalMs !== undefined) {
      const nextInterval = resolveAutosaveInterval(body.autosaveIntervalMs);
      if (nextInterval == null) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'autosaveIntervalMs must be one of 30000, 60000, 120000, 300000',
        });
      }
      data.autosaveIntervalMs = nextInterval;
    }

    if (body.socialLinks !== undefined) {
      if (!Array.isArray(body.socialLinks)) {
        return reply.status(400).send({ error: 'Bad Request', message: 'socialLinks must be an array' });
      }
      for (const link of body.socialLinks) {
        if (!link.platform || !link.label || !link.url) {
          return reply.status(400).send({
            error: 'Bad Request',
            message: 'Each social link must have platform, label, and url',
          });
        }
      }
      data.socialLinks = body.socialLinks;
    }

    if (body.worksIntro !== undefined) {
      if (body.worksIntro === null || typeof body.worksIntro !== 'object' || Array.isArray(body.worksIntro)) {
        return reply.status(400).send({ error: 'Bad Request', message: 'worksIntro must be an object' });
      }
      const prev = await prisma.siteConfig.findUnique({ where: { id: 'default' } });
      const current = normalizeWorksIntro(prev?.worksIntro);
      const patch = body.worksIntro as Record<string, unknown>;
      data.worksIntro = {
        script: typeof patch.script === 'string' ? patch.script.slice(0, 80) : current.script,
        title: typeof patch.title === 'string' ? patch.title.slice(0, 80) : current.title,
      };
    }

    if (body.connectUrl !== undefined) {
      if (typeof body.connectUrl !== 'string') {
        return reply.status(400).send({ error: 'Bad Request', message: 'connectUrl must be a string' });
      }
      data.connectUrl = normalizeConnectUrl(body.connectUrl);
    }

    const config = await prisma.siteConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default', homepageConfig: DEFAULT_HOMEPAGE_CONFIG, ...data },
      update: data,
    });

    clearCache('site-config');
    clearCache('social-links');

    return {
      ...config,
      homepageConfig: normalizeHomepageConfig(config.homepageConfig),
      worksIntro: normalizeWorksIntro(config.worksIntro),
      connectUrl: normalizeConnectUrl(config.connectUrl),
    };
  });

  fastify.get('/preferences', { preHandler: [authenticate] }, async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const cacheKey = `preferences:${request.user.id}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      reply.header('Cache-Control', 'private, max-age=30');
      return cached;
    }

    const defaults = await prisma.siteConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default' },
      update: {},
    });

    const prefs = await prisma.userPreferences.upsert({
      where: { userId: request.user.id },
      create: {
        userId: request.user.id,
        autosaveEnabled: defaults.autosaveEnabled,
        autosaveIntervalMs: defaults.autosaveIntervalMs,
      },
      update: {},
    });

    setCache(cacheKey, prefs, 30_000);
    reply.header('Cache-Control', 'private, max-age=30');
    return prefs;
  });

  fastify.patch('/preferences', { preHandler: [authenticate] }, async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const body = request.body as any;
    const data: any = {};

    if (body.autosaveEnabled !== undefined) {
      data.autosaveEnabled = Boolean(body.autosaveEnabled);
    }

    if (body.autosaveIntervalMs !== undefined) {
      const nextInterval = resolveAutosaveInterval(body.autosaveIntervalMs);
      if (nextInterval == null) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'autosaveIntervalMs must be one of 30000, 60000, 120000, 300000',
        });
      }
      data.autosaveIntervalMs = nextInterval;
    }

    if (body.compactEditorMode !== undefined) {
      data.compactEditorMode = Boolean(body.compactEditorMode);
    }

    if (body.focusMode !== undefined) {
      data.focusMode = Boolean(body.focusMode);
    }

    if (body.defaultVisibility !== undefined) {
      const allowed = new Set(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']);
      if (!allowed.has(body.defaultVisibility)) {
        return reply.status(400).send({ error: 'Bad Request', message: 'defaultVisibility is invalid' });
      }
      data.defaultVisibility = body.defaultVisibility;
    }

    if (body.defaultFeatured !== undefined) {
      data.defaultFeatured = Boolean(body.defaultFeatured);
    }

    if (body.defaultImageLayout !== undefined) {
      data.defaultImageLayout = body.defaultImageLayout ?? null;
    }

    if (body.defaultHeroImageStyle !== undefined) {
      data.defaultHeroImageStyle = body.defaultHeroImageStyle ?? null;
    }

    const defaults = await prisma.siteConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default' },
      update: {},
    });

    const result = await prisma.userPreferences.upsert({
      where: { userId: request.user.id },
      create: {
        userId: request.user.id,
        autosaveEnabled: defaults.autosaveEnabled,
        autosaveIntervalMs: defaults.autosaveIntervalMs,
        ...data,
      },
      update: data,
    });

    clearCache(`preferences:${request.user.id}`);
    return result;
  });
}
