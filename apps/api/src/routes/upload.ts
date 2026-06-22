import { FastifyInstance } from 'fastify';
import { UploadService } from '../services/upload.service.js';
import { requireAdmin } from '../middlewares/auth.js';

export async function uploadRoutes(fastify: FastifyInstance) {
  // POST /upload — file upload to Cloudinary
  fastify.post('/upload', { preHandler: [requireAdmin] }, async (request, reply) => {
    const fileData = await request.file();

    if (!fileData) {
      return reply.status(400).send({ error: 'Bad Request', message: 'No file uploaded' });
    }

    const buffer = await fileData.toBuffer();
    const mimeType = fileData.mimetype || 'application/octet-stream';

    const allowed =
      mimeType.startsWith('image/') ||
      mimeType.startsWith('video/') ||
      mimeType === 'application/pdf';

    if (!allowed) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Unsupported file type. Allowed: images, videos, PDF',
      });
    }

    if (buffer.length > 500 * 1024 * 1024) {
      return reply.status(400).send({ error: 'Bad Request', message: 'File exceeds 500MB limit' });
    }

    try {
      const media = await UploadService.uploadFile(
        buffer,
        fileData.filename,
        mimeType,
        request.user!.id,
      );

      return {
        ...media,
        secure_url: media.publicUrl,
        public_id: media.key,
        resource_type: media.type.toLowerCase(),
      };
    } catch (error: unknown) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Upload failed';
      return reply.status(500).send({ error: 'Internal Server Error', message });
    }
  });

  // POST /upload/url — register external URL (no Cloudinary upload)
  fastify.post('/upload/url', { preHandler: [requireAdmin] }, async (request, reply) => {
    const body = request.body as { url?: string; alt?: string };

    if (!body?.url) {
      return reply.status(400).send({ error: 'Bad Request', message: 'url is required' });
    }

    try {
      const media = await UploadService.registerExternalUrl(body.url, request.user!.id, body.alt);
      return {
        ...media,
        secure_url: media.publicUrl,
        public_id: media.key,
        resource_type: media.type.toLowerCase(),
      };
    } catch (error: unknown) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to register URL';
      return reply.status(400).send({ error: 'Bad Request', message });
    }
  });

  // DELETE /upload/:id
  fastify.delete('/upload/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await UploadService.deleteMedia(id);
      return { success: true, message: 'Media resource deleted successfully' };
    } catch (error: unknown) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Delete failed';
      return reply.status(500).send({ error: 'Internal Server Error', message });
    }
  });
}
