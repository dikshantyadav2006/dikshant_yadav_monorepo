import { prisma } from '@dikshant/database';
import type { Prisma } from '@prisma/client';
import type { CanvasData, CanvasEdge, CanvasNode } from '@dikshant/types';

function normalizeCanvasData(canvasData: CanvasData): CanvasData {
  return {
    nodes: Array.isArray(canvasData.nodes) ? canvasData.nodes : [],
    edges: Array.isArray(canvasData.edges) ? canvasData.edges : [],
    blocks: Array.isArray(canvasData.blocks) ? canvasData.blocks : undefined,
  };
}

function nodeRow(postId: string, node: CanvasNode) {
  return {
    id: node.id,
    postId,
    type: node.type,
    data: (node.data ?? {}) as any,
    position: (node.position ?? { x: 0, y: 0 }) as any,
  };
}

function edgeRow(postId: string, edge: CanvasEdge) {
  return {
    id: edge.id,
    postId,
    sourceId: edge.source,
    targetId: edge.target,
    condition: edge.condition ? (edge.condition as any) : undefined,
    data: edge.data ? (edge.data as any) : undefined,
  };
}

export class VisualBuilderService {
  static async getCanvas(postId: string): Promise<CanvasData> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { canvasData: true },
    });

    if (!post) throw new Error('Post not found');
    return normalizeCanvasData((post.canvasData as CanvasData | null) ?? { nodes: [], edges: [] });
  }

  static async saveCanvas(
    postId: string,
    userId: string,
    canvasData: CanvasData,
    changeLabel?: string,
  ) {
    const normalized = normalizeCanvasData(canvasData);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const post = await tx.post.update({
        where: { id: postId },
        data: {
          canvasData: normalized as any,
          currentVersion: { increment: 1 },
        },
        select: { currentVersion: true },
      });

      await tx.builderEdge.deleteMany({ where: { postId } });
      await tx.builderNode.deleteMany({ where: { postId } });

      if (normalized.nodes.length > 0) {
        await tx.builderNode.createMany({
          data: normalized.nodes.map((node) => nodeRow(postId, node)),
        });
      }

      const validNodeIds = new Set(normalized.nodes.map((node) => node.id));
      const validEdges = normalized.edges.filter((edge) => (
        validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
      ));

      if (validEdges.length > 0) {
        await tx.builderEdge.createMany({
          data: validEdges.map((edge) => edgeRow(postId, edge)),
        });
      }

      await tx.postVersion.create({
        data: {
          postId,
          version: post.currentVersion,
          canvasData: normalized as any,
          savedById: userId,
          changeLabel: changeLabel ?? null,
        },
      });

      return {
        version: post.currentVersion,
        canvasData: normalized,
      };
    }, {
      maxWait: 10_000,
      timeout: 30_000,
    });
  }

  static async listVersions(postId: string) {
    const rows = await prisma.postVersion.findMany({
      where: { postId },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        postId: true,
        version: true,
        changeLabel: true,
        savedById: true,
        createdAt: true,
      },
    });

    return rows;
  }

  static async restoreVersion(postId: string, version: number, userId: string) {
    const snapshot = await prisma.postVersion.findUnique({
      where: {
        postId_version: { postId, version },
      },
      select: { canvasData: true },
    });

    if (!snapshot) throw new Error('Version not found');

    return this.saveCanvas(
      postId,
      userId,
      snapshot.canvasData as unknown as CanvasData,
      `Restored to version ${version}`,
    );
  }
}
