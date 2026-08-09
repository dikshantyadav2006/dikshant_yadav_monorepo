import { FastifyInstance } from 'fastify';
import { WorkBuilderService } from '../services/work-builder.service.js';
import { requireAdmin, optionalAuthenticate } from '../middlewares/auth.js';
import { builtInWorkNodes } from '@dikshant/node-registry';

export async function workBuilderRoutes(fastify: FastifyInstance) {
  fastify.get('/works/:id/canvas', async (request, reply) => {
    const { id } = request.params as { id: string };

    await optionalAuthenticate(request);

    try {
      return await WorkBuilderService.getCanvas(id);
    } catch (err) {
      return reply.status(404).send({
        error: 'Not Found',
        message: err instanceof Error ? err.message : 'Canvas not found',
      });
    }
  });

  fastify.put('/works/:id/canvas', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    if (!body?.canvasData || !Array.isArray(body.canvasData.nodes) || !Array.isArray(body.canvasData.edges)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'canvasData with nodes and edges arrays is required',
      });
    }

    return WorkBuilderService.saveCanvas(
      id,
      request.user!.id,
      body.canvasData,
      body.changeLabel,
    );
  });

  fastify.get('/works/:id/versions', { preHandler: [requireAdmin] }, async (request) => {
    const { id } = request.params as { id: string };
    return WorkBuilderService.listVersions(id);
  });

  fastify.post('/works/:id/versions/:version/restore', { preHandler: [requireAdmin] }, async (request) => {
    const { id, version } = request.params as { id: string; version: string };
    return WorkBuilderService.restoreVersion(id, Number(version), request.user!.id);
  });

  fastify.get('/work-nodes', async () => ({
    items: builtInWorkNodes.map((node) => ({
      type: node.type,
      label: node.label,
      category: node.category,
    })),
  }));
}
