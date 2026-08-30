import { FastifyInstance } from 'fastify';
import { prisma } from '@dikshant/database';
import { requireAdmin } from '../middlewares/auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCES = new Set(['connect']);

function parsePage(value: unknown, fallback: number) {
  const n = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function contactSubmissionRoutes(fastify: FastifyInstance) {
  // POST /contact-submissions — public
  fastify.post('/contact-submissions', async (request, reply) => {
    const body = request.body as any;
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : undefined;
    const budget = typeof body?.budget === 'string' ? body.budget.trim() : undefined;
    const source =
      typeof body?.source === 'string' && SOURCES.has(body.source) ? body.source : undefined;

    if (!name) {
      return reply.status(400).send({ error: 'Bad Request', message: 'name is required' });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return reply.status(400).send({ error: 'Bad Request', message: 'email is required and must be valid' });
    }
    if (!message) {
      return reply.status(400).send({ error: 'Bad Request', message: 'message is required' });
    }
    if (phone && !/^[+\d\s()-]{7,20}$/.test(phone)) {
      return reply.status(400).send({ error: 'Bad Request', message: 'phone is invalid' });
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        message,
        phone: phone || null,
        budget: budget || null,
        source: source ?? null,
      },
    });

    return reply.status(201).send(submission);
  });

  // GET /contact-submissions — admin
  fastify.get('/contact-submissions', { preHandler: [requireAdmin] }, async (request, reply) => {
    const query = request.query as any;
    const page = parsePage(query.page, 1);
    const limit = Math.min(parsePage(query.limit, 50), 100);

    const [total, items] = await Promise.all([
      prisma.contactSubmission.count(),
      prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      submissions: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

  // DELETE /contact-submissions/:id — admin
  fastify.delete('/contact-submissions/:id', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await prisma.contactSubmission.delete({ where: { id } });
      return { success: true, message: 'Submission deleted successfully' };
    } catch (err: any) {
      if (err?.code === 'P2025') {
        return reply.status(404).send({ error: 'Not Found', message: 'Submission not found' });
      }
      throw err;
    }
  });
}
