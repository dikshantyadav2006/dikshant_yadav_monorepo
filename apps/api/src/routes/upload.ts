import { FastifyInstance } from 'fastify';
import { UploadService } from '../services/upload.service.js';
import { requireAdmin } from '../middlewares/auth.js';

export async function uploadRoutes(fastify: FastifyInstance) {
  // POST /upload (Admin only)
  fastify.post('/upload', { preHandler: [requireAdmin] }, async (request, reply) => {
    const fileData = await request.file();
    
    if (!fileData) {
      return reply.status(400).send({ error: 'Bad Request', message: 'No file uploaded' });
    }

    const buffer = await fileData.toBuffer();
    
    try {
      const media = await UploadService.uploadImage(
        buffer,
        fileData.filename,
        fileData.mimetype,
        request.user!.id
      );

      return media;
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error', message: error.message });
    }
  });

  // DELETE /upload/:id (Admin only)
  fastify.delete('/upload/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as any;

    try {
      await UploadService.deleteImage(id);
      return { success: true, message: 'Media resource deleted successfully' };
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error', message: error.message });
    }
  });
}
