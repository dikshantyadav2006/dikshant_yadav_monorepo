import { prisma } from '@dikshant/database';
import crypto from 'crypto';
import { orderNodes } from '@dikshant/shared';
import { slugify } from '../utils/slug.js';

const authorPublicSelect = {
  id: true,
  name: true,
  avatarUrl: true,
} as const;

const linkedPostSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  status: true,
  publishedAt: true,
  featured: true,
  featuredImage: {
    select: { id: true, publicUrl: true, alt: true, width: true, height: true, blurDataUrl: true, dominantColor: true },
  },
} as const;

export interface WorkDetail {
  [key: string]: any;
}

interface CreateWorkInput {
  title: string;
  subtitle?: string | null;
  category?: string | null;
  year?: string | null;
  heroImageUrl?: string | null;
  imageUrl?: string | null;
  overview?: string | null;
  description?: string | null;
  techStack?: string[] | null;
  link?: string | null;
  bento?: any;
  credits?: any;
  nextProject?: any;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
  featuredPinned?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  authorId: string;
}

interface UpdateWorkInput extends Partial<Omit<CreateWorkInput, 'authorId'>> {
  id: string;
}

export function toContentBlocks(canvasData: any): Array<Record<string, any>> {
  const data = canvasData ?? { nodes: [], edges: [] };
  const blocks = orderNodes(Array.isArray(data.nodes) ? data.nodes : [], Array.isArray(data.edges) ? data.edges : []);
  return blocks.map((block: any) => ({ type: block.type, ...(block.data ?? {}) }));
}

export class WorkService {
  // Generate a unique slug in the database
  static async generateUniqueSlug(title: string, currentWorkId?: string): Promise<string> {
    const baseSlug = slugify(title) || 'untitled';
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.work.findFirst({
        where: {
          slug,
          NOT: currentWorkId ? { id: currentWorkId } : undefined,
        },
      });

      if (!existing) return slug;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  // Create a Work — always uses a unique slug to prevent concurrent draft collisions
  static async createWork(input: CreateWorkInput) {
    const uniqueSuffix = crypto.randomUUID().slice(0, 8);
    const base = slugify(input.title) || 'untitled';
    const slug = await this.generateUniqueSlug(`${base}-${uniqueSuffix}`);
    const status = input.status || 'DRAFT';
    const publishedAt = status === 'PUBLISHED' ? new Date() : null;
    const featured = input.featured ?? false;
    const featuredPinned = featured ? input.featuredPinned ?? false : false;

    return prisma.work.create({
      data: {
        title: input.title,
        slug,
        subtitle: input.subtitle ?? undefined,
        category: input.category ?? undefined,
        year: input.year ?? undefined,
        heroImageUrl: input.heroImageUrl ?? undefined,
        imageUrl: input.imageUrl ?? undefined,
        overview: input.overview ?? undefined,
        description: input.description ?? undefined,
        techStack: input.techStack ? (input.techStack as any) : undefined,
        link: input.link ?? undefined,
        bento: input.bento ? (input.bento as any) : undefined,
        credits: input.credits ? (input.credits as any) : undefined,
        nextProject: input.nextProject ? (input.nextProject as any) : undefined,
        status,
        featured,
        featuredPinned,
        seoTitle: input.seoTitle || input.title,
        seoDescription: input.seoDescription ?? undefined,
        publishedAt,
        author: { connect: { id: input.authorId } },
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  // Get single work by ID or Slug
  static async getWorkBySlugOrId(identifier: string, isAdmin: boolean = false) {
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(identifier);
    const where = isUuid
      ? { id: identifier, ...(isAdmin ? {} : { status: 'PUBLISHED' as const }) }
      : {
          slug: identifier,
          ...(isAdmin ? {} : { status: 'PUBLISHED' as const }),
        };

    const work = await prisma.work.findFirst({
      where,
      include: {
        author: {
          select: isAdmin ? { id: true, name: true, email: true, avatarUrl: true } : authorPublicSelect,
        },
        postLinks: {
          orderBy: { sortOrder: 'asc' as const },
          select: {
            post: { select: linkedPostSelect },
          },
        },
      },
    });

    if (!work) return null;

    const contentBlocks = toContentBlocks(work.canvasData);
    const posts = work.postLinks
      .map((link: any) => link.post)
      .filter((post: any) => isAdmin || post.status === 'PUBLISHED');

    const { postLinks, ...rest } = work as any;
    return { ...rest, contentBlocks, posts };
  }

  // Update a Work
  static async updateWork(input: UpdateWorkInput) {
    const existing = await prisma.work.findUnique({
      where: { id: input.id },
    });

    if (!existing) throw new Error('Work not found');

    let slug = existing.slug;
    if (input.title && input.title !== existing.title) {
      slug = await this.generateUniqueSlug(input.title, input.id);
    }

    const nextFeatured = input.featured ?? existing.featured;
    const nextStatus = input.status ?? existing.status;
    const nextFeaturedPinned = nextFeatured ? input.featuredPinned ?? existing.featuredPinned : false;

    const data: any = {
      title: input.title,
      slug,
      subtitle: input.subtitle,
      category: input.category,
      year: input.year,
      heroImageUrl: input.heroImageUrl,
      imageUrl: input.imageUrl,
      overview: input.overview,
      description: input.description,
      link: input.link,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      featured: nextFeatured,
      featuredPinned: nextFeaturedPinned,
    };

    if (input.techStack !== undefined) {
      data.techStack = input.techStack ? (input.techStack as any) : undefined;
    }
    if (input.bento !== undefined) {
      data.bento = input.bento ? (input.bento as any) : undefined;
    }
    if (input.credits !== undefined) {
      data.credits = input.credits ? (input.credits as any) : undefined;
    }
    if (input.nextProject !== undefined) {
      data.nextProject = input.nextProject ? (input.nextProject as any) : undefined;
    }

    if (input.status) {
      data.status = input.status;
      if (input.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
        data.publishedAt = new Date();
      } else if (input.status === 'DRAFT') {
        data.publishedAt = null;
      } else if (input.status === 'ARCHIVED') {
        data.archivedAt = new Date();
      }
    }

    const work = await prisma.work.update({
      where: { id: input.id },
      data,
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    const contentBlocks = toContentBlocks(work.canvasData);
    return { ...(work as any), contentBlocks };
  }

  // Delete a Work (builder_nodes/edges/versions/post_links cascade via FK)
  static async deleteWork(id: string) {
    return prisma.work.delete({
      where: { id },
    });
  }

  // List Works with filtering & pagination
  static async listWorks(options: {
    page?: number;
    limit?: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    category?: string;
    year?: string;
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

    if (options.category) {
      where.category = options.category;
    }

    if (options.year) {
      where.year = options.year;
    }

    const orderBy =
      options.featured === true
        ? [{ featuredPinned: 'desc' as const }, { publishedAt: 'desc' as const }, { updatedAt: 'desc' as const }]
        : [{ publishedAt: 'desc' as const }, { updatedAt: 'desc' as const }];

    const [works, total] = await Promise.all([
      prisma.work.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          subtitle: true,
          category: true,
          year: true,
          imageUrl: true,
          heroImageUrl: true,
          overview: true,
          description: true,
          status: true,
          featured: true,
          featuredPinned: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
          _count: {
            select: { postLinks: true },
          },
        },
      }),
      prisma.work.count({ where }),
    ]);

    return {
      works,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
