import { prisma } from '@dikshant/database';
import crypto from 'crypto';
import { slugify } from '../utils/slug.js';
import { calculateReadingTime } from '../utils/reading-time.js';
import { logPerf, perfNow, timed } from '../utils/perf.js';
import { getCached, setCache } from '../lib/cache.js';

const authorPublicSelect = {
  id: true,
  name: true,
  avatarUrl: true,
} as const;

const categoryPublicSelect = {
  id: true,
  name: true,
  slug: true,
} as const;

const featuredImageSelect = {
  id: true,
  publicUrl: true,
  alt: true,
  blurDataUrl: true,
  dominantColor: true,
  width: true,
  height: true,
} as const;

const featuredBannerImageSelect = featuredImageSelect;

const FEATURED_DISPLAY_STATUSES = ['PUBLISHED', 'SCHEDULED'] as const;

const DEFAULT_HOMEPAGE_CONFIG = {
  featuredLayout: 'hero-grid',
  heroSectionStyle: 'editorial',
  showLatestArticles: true,
  showPopularArticles: true,
  showCategories: true,
  showTrendingTopics: true,
} as const;

const tagPublicSelect = {
  tag: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: string | null;
  featuredImageId?: string | null;
  featuredBannerImageId?: string | null;
  featuredBannerImageMeta?: any;
  tags?: string[]; // array of tag IDs
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  featured?: boolean;
  featuredPinned?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  authorId: string;
}

interface UpdatePostInput extends Partial<Omit<CreatePostInput, 'authorId'>> {
  id: string;
}

export class PostService {
  private static normalizeHomepageConfig(config: unknown) {
    return {
      ...DEFAULT_HOMEPAGE_CONFIG,
      ...(config && typeof config === 'object' ? config : {}),
    };
  }

  private static async resolveSiteConfig(tx: any) {
    const config = await tx.siteConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        homepageConfig: DEFAULT_HOMEPAGE_CONFIG,
      },
      update: {},
    });

    return {
      ...config,
      homepageConfig: this.normalizeHomepageConfig(config.homepageConfig),
    };
  }

  private static async enforceFeaturedCapacity(
    tx: any,
    input: {
      postId?: string;
      featured: boolean;
      status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
      featuredPinned: boolean;
      featuredBannerImageId?: string | null;
    },
  ) {
    const shouldOccupySlot =
      input.featured && FEATURED_DISPLAY_STATUSES.includes(input.status as (typeof FEATURED_DISPLAY_STATUSES)[number]);

    if (!shouldOccupySlot) {
      return;
    }

    if (!input.featuredBannerImageId) {
      return;
    }

    const siteConfig = await this.resolveSiteConfig(tx);
    const maxFeatured = Math.max(1, Math.min(5, siteConfig.homepageFeaturedCount || 1));

    const existingFeatured = await tx.post.findMany({
      where: {
        id: input.postId ? { not: input.postId } : undefined,
        featured: true,
        status: { in: [...FEATURED_DISPLAY_STATUSES] },
      },
      select: {
        id: true,
        featuredPinned: true,
      },
      orderBy: [{ publishedAt: 'asc' }, { updatedAt: 'asc' }],
    });

    if (existingFeatured.length < maxFeatured) {
      return;
    }

    const removablePost = existingFeatured.find((post: { featuredPinned: boolean }) => !post.featuredPinned);

    if (!removablePost) {
      throw new Error('All featured slots are pinned. Unpin a featured post or increase the featured post limit.');
    }

    await tx.post.update({
      where: { id: removablePost.id },
      data: {
        featured: false,
        featuredPinned: false,
      },
    });
  }

  // Generate a unique slug in the database
  static async generateUniqueSlug(title: string, currentPostId?: string): Promise<string> {
    const baseSlug = slugify(title) || 'untitled';
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.post.findFirst({
        where: {
          slug,
          NOT: currentPostId ? { id: currentPostId } : undefined,
        },
      });

      if (!existing) return slug;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  // Create a Post — always uses a unique slug to prevent concurrent draft collisions
  static async createPost(input: CreatePostInput) {
    const uniqueSuffix = crypto.randomUUID().slice(0, 8);
    const base = slugify(input.title) || 'untitled';
    const slug = await this.generateUniqueSlug(`${base}-${uniqueSuffix}`);
    const readingTime = calculateReadingTime(input.content);
    const status = input.status || 'DRAFT';
    const publishedAt = status === 'PUBLISHED' ? new Date() : null;
    const featured = input.featured ?? false;
    const featuredPinned = featured ? input.featuredPinned ?? false : false;

    return prisma.$transaction(async (tx: any) => {
      await this.enforceFeaturedCapacity(tx, {
        featured,
        featuredPinned,
        status,
        featuredBannerImageId: input.featuredBannerImageId,
      });

      // Resolve or create category/tags references if any
      return tx.post.create({
        data: {
          title: input.title,
          slug,
          excerpt: input.excerpt,
          status,
          featured,
          featuredPinned,
          readingTime,
          seoTitle: input.seoTitle || input.title,
          seoDescription: input.seoDescription || input.excerpt,
          publishedAt,
          author: { connect: { id: input.authorId } },
          content: {
            create: {
              body: input.content,
              format: 'MDX',
            },
          },
          category: input.categoryId ? { connect: { id: input.categoryId } } : undefined,
          tags:
            input.tags && input.tags.length > 0
              ? {
                  create: input.tags.map((tagId) => ({
                    tag: { connect: { id: tagId } },
                  })),
                }
              : undefined,
          featuredImage: input.featuredImageId ? { connect: { id: input.featuredImageId } } : undefined,
          featuredBannerImage: input.featuredBannerImageId ? { connect: { id: input.featuredBannerImageId } } : undefined,
          featuredBannerImageMeta: input.featuredBannerImageMeta ?? undefined,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          category: true,
          featuredImage: true,
          featuredBannerImage: true,
          content: true,
          tags: { include: { tag: true } },
        },
      });
    });
  }

  // Get single post by ID or Slug
  static async getPostBySlugOrId(identifier: string, isAdmin: boolean = false) {
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(identifier);
    const where = isUuid
      ? { id: identifier, ...(isAdmin ? {} : { status: 'PUBLISHED' as const }) }
      : {
          slug: identifier,
          ...(isAdmin ? {} : { status: 'PUBLISHED' as const }),
        };

    return timed(
      'db:getPostBySlugOrId',
      () =>
        prisma.post.findFirst({
          where,
          include: {
            author: {
              select: isAdmin
                ? { id: true, name: true, email: true, avatarUrl: true }
                : authorPublicSelect,
            },
            category: { select: categoryPublicSelect },
            featuredImage: { select: featuredImageSelect },
            featuredBannerImage: { select: featuredBannerImageSelect },
            content: {
              select: {
                id: true,
                postId: true,
                format: true,
                body: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            tags: { select: tagPublicSelect },
            _count: {
              select: {
                views: true,
                reactions: true,
                bookmarks: true,
              },
            },
          },
        }),
      { identifier, isAdmin },
    );
  }

  // Increment views (Create view entry)
  static async incrementViews(postId: string, meta: {
    path: string;
    visitorHash: string;
    referrer?: string;
    userAgent?: string;
  }) {
    const start = perfNow();

    const recentView = await prisma.view.findFirst({
      where: {
        postId,
        visitorHash: meta.visitorHash,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000),
        },
      },
      select: { id: true },
    });

    if (!recentView) {
      await prisma.view.create({
        data: {
          postId,
          path: meta.path,
          visitorHash: meta.visitorHash,
          referrer: meta.referrer,
          userAgent: meta.userAgent,
        },
      });
    }

    logPerf('db:incrementViews', start, { postId });
  }

  // Update a Post
  static async updatePost(input: UpdatePostInput) {
    const existing = await prisma.post.findUnique({
      where: { id: input.id },
    });

    if (!existing) throw new Error('Post not found');

    let slug = existing.slug;
    if (input.title && input.title !== existing.title) {
      slug = await this.generateUniqueSlug(input.title, input.id);
    }

    const readingTime = input.content ? calculateReadingTime(input.content) : existing.readingTime;
    const nextFeatured = input.featured ?? existing.featured;
    const nextStatus = input.status ?? existing.status;
    const nextFeaturedPinned = nextFeatured ? input.featuredPinned ?? existing.featuredPinned : false;
    const nextBannerId =
      input.featuredBannerImageId !== undefined ? input.featuredBannerImageId : existing.featuredBannerImageId;

    const data: any = {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      featured: nextFeatured,
      featuredPinned: nextFeaturedPinned,
      readingTime,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    };

    if (input.status) {
      data.status = input.status;
      if (input.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
        data.publishedAt = new Date();
      } else if (input.status === 'DRAFT') {
        data.publishedAt = null;
      }
    }

    if (input.content) {
      data.content = {
        upsert: {
          create: { body: input.content, format: 'MDX' },
          update: { body: input.content },
        },
      };
    }

    if (input.categoryId !== undefined) {
      if (input.categoryId) {
        data.category = { connect: { id: input.categoryId } };
      } else {
        data.category = { disconnect: true };
      }
    }

    if (input.featuredImageId !== undefined) {
      if (input.featuredImageId) {
        data.featuredImage = { connect: { id: input.featuredImageId } };
      } else {
        data.featuredImage = { disconnect: true };
      }
    }

    if (input.featuredBannerImageId !== undefined) {
      if (input.featuredBannerImageId) {
        data.featuredBannerImage = { connect: { id: input.featuredBannerImageId } };
      } else {
        data.featuredBannerImage = { disconnect: true };
      }
    }

    if (input.featuredBannerImageMeta !== undefined) {
      data.featuredBannerImageMeta = input.featuredBannerImageMeta;
    }

    if (input.tags !== undefined) {
      data.tags = {
        deleteMany: {},
        create: input.tags.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      };
    }

    return prisma.$transaction(
      async (tx: any) => {
        await this.enforceFeaturedCapacity(tx, {
          postId: input.id,
          featured: nextFeatured,
          featuredPinned: nextFeaturedPinned,
          status: nextStatus,
          featuredBannerImageId: nextBannerId,
        });

        return tx.post.update({
          where: { id: input.id },
          data,
          include: {
            author: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
            category: true,
            featuredImage: true,
            featuredBannerImage: true,
            content: true,
            tags: { include: { tag: true } },
          },
        });
      },
      { timeout: 15000 },
    );
  }

  // Delete a Post (builder_nodes/edges/versions cascade via FK)
  static async deletePost(id: string) {
    return prisma.post.delete({
      where: { id },
    });
  }

  // List Posts with filtering & pagination
  static async listPosts(options: {
    page?: number;
    limit?: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
    categoryId?: string;
    categorySlug?: string;
    tagId?: string;
    tagSlug?: string;
    featured?: boolean;
    isAdmin?: boolean;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // For public, force PUBLISHED status
    if (!options.isAdmin) {
      where.status = 'PUBLISHED';
    } else if (options.status) {
      where.status = options.status;
    }

    if (options.featured !== undefined) {
      where.featured = options.featured;
    }

    if (options.categoryId) {
      where.categoryId = options.categoryId;
    } else if (options.categorySlug) {
      where.category = { slug: options.categorySlug };
    }

    if (options.tagId) {
      where.tags = { some: { tagId: options.tagId } };
    } else if (options.tagSlug) {
      where.tags = { some: { tag: { slug: options.tagSlug } } };
    }

    const orderBy =
      options.featured === true
        ? [{ featuredPinned: 'desc' as const }, { publishedAt: 'desc' as const }, { updatedAt: 'desc' as const }]
        : [{ publishedAt: 'desc' as const }, { updatedAt: 'desc' as const }];

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          status: true,
          featured: true,
          featuredPinned: true,
          readingTime: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
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
          _count: {
            select: {
              views: true,
              reactions: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Search Posts
  static async searchPosts(query: string, isAdmin: boolean = false) {
    if (!query || query.trim() === '') return [];

    return prisma.post.findMany({
      where: {
        status: isAdmin ? undefined : 'PUBLISHED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
          {
            content: {
              body: { contains: query, mode: 'insensitive' },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        readingTime: true,
        publishedAt: true,
        featured: true,
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        featuredImage: {
          select: { id: true, publicUrl: true, alt: true, width: true, height: true, blurDataUrl: true, dominantColor: true },
        },
        tags: {
          select: { tag: { select: { id: true, name: true, slug: true } } },
        },
      },
      take: 10,
    });
  }

  // Related posts
  static async getRelatedPosts(postId: string, limit: number = 3) {
    return timed(
      'db:getRelatedPosts',
      async () => {
        const currentPost = await prisma.post.findUnique({
          where: { id: postId },
          select: {
            categoryId: true,
            tags: { select: { tagId: true } },
          },
        });

        if (!currentPost) return [];

        const tagIds = currentPost.tags.map((t: { tagId: string }) => t.tagId);
        const orFilters = [];

        if (currentPost.categoryId) {
          orFilters.push({ categoryId: currentPost.categoryId });
        }

        if (tagIds.length > 0) {
          orFilters.push({
            tags: {
              some: {
                tagId: { in: tagIds },
              },
            },
          });
        }

        if (orFilters.length === 0) return [];

        return prisma.post.findMany({
          where: {
            id: { not: postId },
            status: 'PUBLISHED',
            OR: orFilters,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            readingTime: true,
            publishedAt: true,
            updatedAt: true,
            featured: true,
            author: { select: authorPublicSelect },
            category: { select: categoryPublicSelect },
            featuredImage: { select: featuredImageSelect },
            featuredBannerImage: { select: featuredBannerImageSelect },
            tags: { select: tagPublicSelect },
            _count: { select: { views: true, reactions: true } },
          },
          orderBy: { publishedAt: 'desc' },
          take: limit,
        });
      },
      { postId, limit },
    );
  }
}
