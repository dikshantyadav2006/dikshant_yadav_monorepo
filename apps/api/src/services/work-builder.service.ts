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

function nodeRow(workId: string, node: CanvasNode) {
  return {
    id: node.id,
    workId,
    type: node.type,
    data: (node.data ?? {}) as any,
    position: (node.position ?? { x: 0, y: 0 }) as any,
  };
}

function edgeRow(workId: string, edge: CanvasEdge) {
  return {
    id: edge.id,
    workId,
    sourceId: edge.source,
    targetId: edge.target,
    condition: edge.condition ? (edge.condition as any) : undefined,
    data: edge.data ? (edge.data as any) : undefined,
  };
}

export class WorkBuilderService {
  static async getCanvas(workId: string): Promise<CanvasData> {
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { canvasData: true },
    });

    if (!work) throw new Error('Work not found');
    return normalizeCanvasData((work.canvasData as CanvasData | null) ?? { nodes: [], edges: [] });
  }

  static async saveCanvas(
    workId: string,
    userId: string,
    canvasData: CanvasData,
    changeLabel?: string,
  ) {
    const normalized = normalizeCanvasData(canvasData);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const work = await tx.work.update({
        where: { id: workId },
        data: {
          canvasData: normalized as any,
          currentVersion: { increment: 1 },
        },
        select: { currentVersion: true },
      });

      await tx.workBuilderEdge.deleteMany({ where: { workId } });
      await tx.workBuilderNode.deleteMany({ where: { workId } });

      if (normalized.nodes.length > 0) {
        await tx.workBuilderNode.createMany({
          data: normalized.nodes.map((node) => nodeRow(workId, node)),
        });
      }

      const validNodeIds = new Set(normalized.nodes.map((node) => node.id));
      const validEdges = normalized.edges.filter((edge) => (
        validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
      ));

      if (validEdges.length > 0) {
        await tx.workBuilderEdge.createMany({
          data: validEdges.map((edge) => edgeRow(workId, edge)),
        });
      }

      await tx.workVersion.create({
        data: {
          workId,
          version: work.currentVersion,
          canvasData: normalized as any,
          savedById: userId,
          changeLabel: changeLabel ?? null,
        },
      });

      return {
        version: work.currentVersion,
        canvasData: normalized,
      };
    }, {
      maxWait: 10_000,
      timeout: 30_000,
    });
  }

  static async listVersions(workId: string) {
    const rows = await prisma.workVersion.findMany({
      where: { workId },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        workId: true,
        version: true,
        changeLabel: true,
        savedById: true,
        createdAt: true,
      },
    });

    return rows;
  }

  static async restoreVersion(workId: string, version: number, userId: string) {
    const snapshot = await prisma.workVersion.findUnique({
      where: {
        workId_version: { workId, version },
      },
      select: { canvasData: true },
    });

    if (!snapshot) throw new Error('Version not found');

    return this.saveCanvas(
      workId,
      userId,
      snapshot.canvasData as unknown as CanvasData,
      `Restored to version ${version}`,
    );
  }
}
