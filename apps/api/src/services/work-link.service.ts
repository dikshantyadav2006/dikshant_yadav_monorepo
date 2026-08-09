import { prisma } from '@dikshant/database';
import type { Prisma } from '@prisma/client';

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

const linkedWorkSelect = {
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
  publishedAt: true,
} as const;

interface WorkPostLinkInput {
  postId: string;
  sortOrder?: number;
}

export class WorkLinkService {
  // Replace the set of posts linked to a work
  static async setWorkPosts(workId: string, links: WorkPostLinkInput[]) {
    const existing = await prisma.work.findUnique({ where: { id: workId }, select: { id: true } });
    if (!existing) throw new Error('Work not found');

    const seen = new Set<string>();
    const validLinks = (Array.isArray(links) ? links : []).filter((link) => {
      if (!link?.postId || seen.has(link.postId)) return false;
      seen.add(link.postId);
      return true;
    });

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.postWorkLink.deleteMany({ where: { workId } });

      if (validLinks.length > 0) {
        const postIds = validLinks.map((link) => link.postId);
        const count = await tx.post.count({
          where: { id: { in: postIds } },
        });

        if (count !== postIds.length) {
          throw new Error('One or more linked posts do not exist');
        }

        await tx.postWorkLink.createMany({
          data: validLinks.map((link, index) => ({
            workId,
            postId: link.postId,
            sortOrder: link.sortOrder ?? index,
          })),
        });
      }
    }, {
      maxWait: 10_000,
      timeout: 30_000,
    });

    return this.getWorkPosts(workId, true);
  }

  // Posts linked to a work
  static async getWorkPosts(workId: string, isAdmin: boolean = false) {
    const links = await prisma.postWorkLink.findMany({
      where: { workId },
      orderBy: { sortOrder: 'asc' },
      select: { post: { select: linkedPostSelect } },
    });

    return links
      .map((link: any) => link.post)
      .filter((post: any) => isAdmin || post.status === 'PUBLISHED');
  }

  // Works linked to a post
  static async getPostWorks(postId: string, isAdmin: boolean = false) {
    const links = await prisma.postWorkLink.findMany({
      where: { postId },
      orderBy: { sortOrder: 'asc' },
      select: { work: { select: linkedWorkSelect } },
    });

    return links
      .map((link: any) => link.work)
      .filter((work: any) => isAdmin || work.status === 'PUBLISHED');
  }
}
