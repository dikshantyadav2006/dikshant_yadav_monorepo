import { FastifyInstance } from 'fastify';
import { VisualBuilderService } from '../services/visual-builder.service.js';
import { requireAdmin, optionalAuthenticate } from '../middlewares/auth.js';

export async function visualBuilderRoutes(fastify: FastifyInstance) {
  fastify.get('/posts/:id/canvas', async (request, reply) => {
    const { id } = request.params as { id: string };

    await optionalAuthenticate(request);

    try {
      return await VisualBuilderService.getCanvas(id);
    } catch (err) {
      return reply.status(404).send({
        error: 'Not Found',
        message: err instanceof Error ? err.message : 'Canvas not found',
      });
    }
  });

  fastify.put('/posts/:id/canvas', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    if (!body?.canvasData || !Array.isArray(body.canvasData.nodes) || !Array.isArray(body.canvasData.edges)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'canvasData with nodes and edges arrays is required',
      });
    }

    return VisualBuilderService.saveCanvas(
      id,
      request.user!.id,
      body.canvasData,
      body.changeLabel,
    );
  });

  fastify.get('/posts/:id/versions', { preHandler: [requireAdmin] }, async (request) => {
    const { id } = request.params as { id: string };
    return VisualBuilderService.listVersions(id);
  });

  fastify.post('/posts/:id/versions/:version/restore', { preHandler: [requireAdmin] }, async (request) => {
    const { id, version } = request.params as { id: string; version: string };
    return VisualBuilderService.restoreVersion(id, Number(version), request.user!.id);
  });

  fastify.get('/nodes', async () => ({
    items: [
      { type: 'heading', label: 'Heading', category: 'Content' },
      { type: 'text', label: 'Text', category: 'Content' },
      { type: 'image', label: 'Image', category: 'Media' },
      { type: 'video', label: 'Video', category: 'Media' },
      { type: 'gallery', label: 'Gallery', category: 'Media' },
      { type: 'quote', label: 'Quote', category: 'Content' },
      { type: 'divider', label: 'Divider', category: 'Layout' },
      { type: 'code-block', label: 'Code Block', category: 'Content' },
      { type: 'question', label: 'Question', category: 'Interactive' },
      { type: 'poll', label: 'Poll', category: 'Interactive' },
      { type: 'embed', label: 'Embed', category: 'Media' },
      { type: 'button', label: 'Button', category: 'Interactive' },
      { type: 'ai-block', label: 'AI Block', category: 'AI' },
    ],
  }));
}
