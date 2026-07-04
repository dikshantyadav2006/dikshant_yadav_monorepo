import type { FastifyInstance } from 'fastify';
import { requireAdmin } from '../middlewares/auth.js';
import { ShareLinkService } from '../services/share-link.service.js';

interface CreateLinkBody {
  expiresInMs: number | null;
}

export async function shareLinkRoutes(fastify: FastifyInstance) {
  // Create a share link for a post (admin only)
  fastify.post<{ Params: { id: string }; Body: CreateLinkBody }>(
    '/posts/:id/share-links',
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const { id } = request.params;
      const { expiresInMs } = request.body;

      const link = await ShareLinkService.createForPost(id, expiresInMs ?? null);
      return reply.status(201).send(link);
    }
  );

  // List share links for a post
  fastify.get<{ Params: { id: string } }>(
    '/posts/:id/share-links',
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const { id } = request.params;
      const links = await ShareLinkService.findByPost(id);
      return reply.send(links);
    }
  );

  // Delete a share link
  fastify.delete<{ Params: { linkId: string } }>(
    '/share-links/:linkId',
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const { linkId } = request.params;
      await ShareLinkService.delete(linkId);
      return reply.status(204).send();
    }
  );

  // Public: view a shared post by token
  fastify.get<{ Params: { token: string } }>(
    '/share/:token',
    async (request, reply) => {
      const { token } = request.params;
      const link = await ShareLinkService.findByToken(token);

      if (!link) {
        return reply.status(404).send({ error: 'Share link not found' });
      }

      if (link.expiresAt && link.expiresAt < new Date()) {
        return reply.status(410).send({ error: 'Share link has expired' });
      }

      const { post } = link;
      return reply.send({
        post: {
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
          canvasData: post.canvasData,
        },
      });
    }
  );
}
