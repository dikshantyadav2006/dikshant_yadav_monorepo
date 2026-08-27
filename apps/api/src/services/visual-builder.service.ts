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

      // Diff-based node/edge sync: fetch existing, compute sets, then batch ops
      const [existingNodes, existingEdges] = await Promise.all([
        tx.builderNode.findMany({ where: { postId }, select: { id: true } }),
        tx.builderEdge.findMany({ where: { postId }, select: { id: true } }),
      ]);

      const existingNodeIds = new Set(existingNodes.map((n) => n.id));
      const existingEdgeIds = new Set(existingEdges.map((e) => e.id));

      const newNodeIds = new Set(normalized.nodes.map((n) => n.id));
      const validNodeIds = new Set(normalized.nodes.map((n) => n.id));
      const validEdges = normalized.edges.filter((edge) => (
        validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
      ));
      const newEdgeIds = new Set(validEdges.map((e) => e.id));

      // Nodes to delete (existed before, not in new data)
      const nodeIdsToDelete = [...existingNodeIds].filter((id) => !newNodeIds.has(id));
      if (nodeIdsToDelete.length > 0) {
        await tx.builderNode.deleteMany({ where: { postId, id: { in: nodeIdsToDelete } } });
      }

      // Edges to delete (existed before, not in new data or targets invalid)
      const edgeIdsToDelete = [...existingEdgeIds].filter((id) => !newEdgeIds.has(id));
      if (edgeIdsToDelete.length > 0) {
        await tx.builderEdge.deleteMany({ where: { postId, id: { in: edgeIdsToDelete } } });
      }

      // Nodes to insert (new nodes not in DB)
      const nodesToInsert = normalized.nodes
        .filter((n) => !existingNodeIds.has(n.id))
        .map((n) => nodeRow(postId, n));
      if (nodesToInsert.length > 0) {
        await tx.builderNode.createMany({ data: nodesToInsert });
      }

      // Nodes to update (exist in both)
      const nodesToUpdate = normalized.nodes.filter((n) => existingNodeIds.has(n.id));
      for (const n of nodesToUpdate) {
        await tx.builderNode.update({
          where: { id: n.id },
          data: {
            type: n.type,
            data: (n.data ?? {}) as any,
            position: (n.position ?? { x: 0, y: 0 }) as any,
          },
        });
      }

      // Edges to insert (new edges not in DB)
      const edgesToInsert = validEdges
        .filter((e) => !existingEdgeIds.has(e.id))
        .map((e) => edgeRow(postId, e));
      if (edgesToInsert.length > 0) {
        await tx.builderEdge.createMany({ data: edgesToInsert });
      }

      // Edges to update (exist in both, condition/data may have changed)
      const edgesToUpdate = validEdges.filter((e) => existingEdgeIds.has(e.id));
      for (const e of edgesToUpdate) {
        await tx.builderEdge.update({
          where: { id: e.id },
          data: {
            sourceId: e.source,
            targetId: e.target,
            condition: e.condition ? (e.condition as any) : undefined,
            data: e.data ? (e.data as any) : undefined,
          },
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
