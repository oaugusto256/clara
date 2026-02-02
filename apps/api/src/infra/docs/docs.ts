
import { NormalizedTransactionInputSchema, TransactionSchema } from '@clara/schemas';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const docsPlugin: FastifyPluginAsync = fp(async (app: import('fastify').FastifyInstance) => {
  // Build OpenAPI spec from Zod schemas
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

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Clara API',
        description: 'Financial Transactions API',
        version: '0.1.0',
      },
      components: {
        schemas: {
          NormalizedTransactionInput: extractDef(generatedNormalized, 'NormalizedTransactionInput'),
          Transaction: extractDef(generatedTransaction, 'Transaction'),
        },
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
    transformSpecification: (spec: any) => spec,
    transformSpecificationClone: true,
  });
});
