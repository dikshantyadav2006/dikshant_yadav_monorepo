import { randomBytes } from 'crypto';
import { prisma } from '@dikshant/database';

export class ShareLinkService {
  static async createForPost(postId: string, expiresInMs: number | null) {
    const token = randomBytes(16).toString('hex');
    const expiresAt = expiresInMs !== null ? new Date(Date.now() + expiresInMs) : null;

    return prisma.shareLink.create({
      data: { postId, token, expiresAt },
    });
  }

  static async findByPost(postId: string) {
    return prisma.shareLink.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findByToken(token: string) {
    return prisma.shareLink.findUnique({
      where: { token },
      include: { post: true },
    });
  }

  static async delete(id: string) {
    return prisma.shareLink.delete({ where: { id } });
  }

  static async cleanupExpired() {
    return prisma.shareLink.deleteMany({
      where: { expiresAt: { lte: new Date(), not: null } },
    });
  }
}
