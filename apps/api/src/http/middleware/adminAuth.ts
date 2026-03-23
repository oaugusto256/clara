import type { FastifyReply, FastifyRequest } from 'fastify';

export async function requireAdminKey(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const adminKey = process.env.CATEGORIES_ADMIN_KEY;
  if (!adminKey) {
    reply.status(500).send({ message: 'Server misconfiguration: admin key not set' });
    return;
  }
  const provided = request.headers['x-admin-key'];
  if (provided !== adminKey) {
    reply.status(401).send({ message: 'Unauthorized' });
  }
}
