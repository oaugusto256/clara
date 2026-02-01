import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { parseCsv } from './csv';
import { normalizeInput } from './normalize';

export function buildServer(): FastifyInstance {
  const fastify = Fastify({ logger: false });

  // Accept text/csv and text/plain as raw strings
  fastify.addContentTypeParser(['text/csv', 'text/plain'], { parseAs: 'string' }, function (req, body, done) {
    done(null, body as string);
  });

  fastify.post('/import/csv', async (request, reply) => {
    // Allow JSON body with { csv: string } for convenience
    let csv = '';
    if (typeof request.body === 'string') csv = request.body as string;
    else if (request.body && typeof (request.body as any).csv === 'string') csv = (request.body as any).csv;

    if (!csv || csv.trim() === '') {
      return reply.status(400).send({ error: 'No CSV provided' });
    }

    const parsed = parseCsv(csv);

    const normalized: any[] = [];
    const normalizationErrors: { line: number; reason: string }[] = [];

    for (let i = 0; i < parsed.ok.length; i++) {
      try {
        const tx = normalizeInput(parsed.ok[i] as any);
        normalized.push(tx);
      } catch (err: any) {
        normalizationErrors.push({ line: i + 1, reason: err?.message ?? 'normalization failed' });
      }
    }

    return { parsed: parsed.ok, normalized, errors: parsed.errors.concat(normalizationErrors) };
  });

  return fastify;
}
