import { prisma } from '@dikshant/database';
import { ReactionType } from '@dikshant/types';

export class ReactionService {
  static async toggleReaction(postId: string, type: ReactionType, visitorHash: string) {
    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    const existing = await prisma.reaction.findUnique({
      where: {
        postId_visitorHash_type: {
          postId,
          visitorHash,
          type: type as any, // Cast to Prisma type
        },
      },
    });

    if (existing) {
      await prisma.reaction.delete({
        where: { id: existing.id },
      });
      return { reacted: false };
    } else {
      await prisma.reaction.create({
        data: {
          postId,
          type: type as any,
          visitorHash,
        },
      });
      return { reacted: true };
    }
  }

  static async getReactionsForPost(postId: string, visitorHash?: string) {
    const reactions = await prisma.reaction.groupBy({
      by: ['type'],
      where: { postId },
      _count: {
        id: true,
      },
    });

    const counts: Record<ReactionType, number> = {
      LIKE: 0,
      LOVE: 0,
      INSIGHTFUL: 0,
      FIRE: 0,
    };

    reactions.forEach((group) => {
      const type = group.type as unknown as ReactionType;
      if (counts[type] !== undefined) {
        counts[type] = group._count.id;
      }
    });

    let userReactions: ReactionType[] = [];
    if (visitorHash) {
      const userReacted = await prisma.reaction.findMany({
        where: { postId, visitorHash },
        select: { type: true },
      });
      userReactions = userReacted.map((r) => r.type as unknown as ReactionType);
    }

    return {
      counts,
      userReactions,
    };
  }
}
