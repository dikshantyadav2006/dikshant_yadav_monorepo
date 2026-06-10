import { prisma } from '@dikshant/database';
import { slugify } from '../utils/slug.js';
import { calculateReadingTime } from '../utils/reading-time.js';

interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: string | null;
  featuredImageId?: string | null;
  tags?: string[]; // array of tag IDs
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  authorId: string;
}

interface UpdatePostInput extends Partial<Omit<CreatePostInput, 'authorId'>> {
  id: string;
}

export class PostService {
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

  // Create a Post
  static async createPost(input: CreatePostInput) {
    const slug = await this.generateUniqueSlug(input.title);
    const readingTime = calculateReadingTime(input.content);
    const status = input.status || 'DRAFT';
    const publishedAt = status === 'PUBLISHED' ? new Date() : null;

    // Resolve or create category/tags references if any
    return prisma.post.create({
      data: {
        title: input.title,
        slug,
        excerpt: input.excerpt,
        status,
        featured: input.featured ?? false,
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
        tags: input.tags && input.tags.length > 0 ? {
          create: input.tags.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        } : undefined,
        featuredImage: input.featuredImageId ? { connect: { id: input.featuredImageId } } : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        category: true,
        featuredImage: true,
        content: true,
        tags: { include: { tag: true } },
      },
    });
  }

  // Get single post by ID or Slug
  static async getPostBySlugOrId(identifier: string, isAdmin: boolean = false) {
    const post = await prisma.post.findFirst({
      where: {
        OR: [
          { id: identifier.match(/^[0-9a-fA-F-]{36}$/) ? identifier : undefined },
          { slug: identifier },
        ].filter(Boolean) as any,
        // Public users can only see published posts
        status: isAdmin ? undefined : 'PUBLISHED',
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        category: true,
        featuredImage: true,
        content: true,
        tags: { include: { tag: true } },
        _count: {
          select: {
            views: true,
            reactions: true,
            bookmarks: true,
          },
        },
      },
    });

    return post;
  }

  // Increment views (Create view entry)
  static async incrementViews(postId: string, meta: {
    path: string;
    visitorHash: string;
    referrer?: string;
    userAgent?: string;
  }) {
    // Check if view has already been counted in the last 15 minutes to prevent spam
    const recentView = await prisma.view.findFirst({
      where: {
        postId,
        visitorHash: meta.visitorHash,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000), // 15 mins
        },
      },
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

    const data: any = {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      featured: input.featured,
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

    if (input.tags !== undefined) {
      data.tags = {
        deleteMany: {},
        create: input.tags.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      };
    }

    return prisma.post.update({
      where: { id: input.id },
      data,
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        category: true,
        featuredImage: true,
        content: true,
        tags: { include: { tag: true } },
      },
    });
  }

  // Delete a Post
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

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          category: true,
          featuredImage: true,
          tags: { include: { tag: true } },
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
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        category: true,
        featuredImage: true,
        tags: { include: { tag: true } },
      },
      take: 10,
    });
  }

  // Related posts
  static async getRelatedPosts(postId: string, limit: number = 3) {
    const currentPost = await prisma.post.findUnique({
      where: { id: postId },
      include: { tags: true },
    });

    if (!currentPost) return [];

    const tagIds = currentPost.tags.map((t) => t.tagId);

    // Find posts with same category or overlapping tags
    return prisma.post.findMany({
      where: {
        id: { not: postId },
        status: 'PUBLISHED',
        OR: [
          { categoryId: currentPost.categoryId || undefined },
          {
            tags: {
              some: {
                tagId: { in: tagIds },
              },
            },
          },
        ],
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        category: true,
        featuredImage: true,
        tags: { include: { tag: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }
}
