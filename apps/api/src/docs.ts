import { NormalizedTransactionInputSchema, TransactionSchema } from '@clara/schemas';
import type { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';
import * as swaggerUiDist from 'swagger-ui-dist';
import { zodToJsonSchema } from 'zod-to-json-schema';

export function buildOpenApiSpec(base?: any) {
  const spec = {
    openapi: '3.0.0',
    info: { title: 'Clara API', version: '0.1.0', description: 'CSV import preview' },
    components: {
      schemas: {},
    },
    paths: {},
    ...base,
  } as any;

  // Merge generated JSON Schema components from Zod
  // zod-to-json-schema can produce very complex generic types which cause the TS compiler
  // to hit deep instantiation errors. Cast to `any` to keep the build fast and predictable.
  const generatedNormalized: any = zodToJsonSchema(NormalizedTransactionInputSchema as any, 'NormalizedTransactionInput');
  const generatedTransaction: any = zodToJsonSchema(TransactionSchema as any, 'Transaction');

  function extractDef(generated: any, name: string) {
    if (generated && generated.$defs && generated.$defs[name]) return generated.$defs[name];
    if (generated && generated.definitions && generated.definitions[name]) return generated.definitions[name];
    if (generated && generated.$ref && (generated.definitions || generated.$defs)) {
      const defs = generated.definitions || generated.$defs || {};
      const key = generated.$ref.replace('#/definitions/', '').replace('#/$defs/', '');
      return defs[key] || generated;
    }
    return generated;
  }

  spec.components.schemas = {
    ...spec.components.schemas,
    NormalizedTransactionInput: extractDef(generatedNormalized, 'NormalizedTransactionInput'),
    Transaction: extractDef(generatedTransaction, 'Transaction'),
  };

  return spec;
}

export function attachDocs(fastify: FastifyInstance, baseSpec?: any) {
  const spec = buildOpenApiSpec(baseSpec);

  // Serve static files from swagger-ui-dist under /docs/static/* without using @fastify/static plugin
  fastify.get('/docs/static/*', async (request: any, reply) => {
    const params = (request.params as any) || {};
    const file = params['*'] || '';
    const abs = path.join((swaggerUiDist as any).getAbsoluteFSPath(), file);
    try {
      const buf = await fs.promises.readFile(abs);
      let type = 'application/octet-stream';
      if (file.endsWith('.css')) type = 'text/css';
      else if (file.endsWith('.js')) type = 'application/javascript';
      else if (file.endsWith('.map')) type = 'application/json';
      reply.type(type).send(buf);
    } catch (err: any) {
      reply.code(404).send('Not found');
    }
  });

  fastify.get('/docs/json', async () => spec);

  fastify.get('/docs', async (request, reply) => {
    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/docs/static/swagger-ui.css" />
        <title>Clara API Docs</title>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="/docs/static/swagger-ui-bundle.js"></script>
        <script>
          window.onload = function() {
            const ui = SwaggerUIBundle({ url: '/docs/json', dom_id: '#swagger-ui' });
          };
        </script>
      </body>
    </html>`;
    reply.type('text/html').send(html);
  });
}
