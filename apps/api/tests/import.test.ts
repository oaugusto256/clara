import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';
import { createServer } from '../src/server';

describe('api: import endpoint', () => {
  it('accepts CSV text and returns parsed+normalized data', async () => {
    const csv = readFileSync(new URL('./fixtures/bank-sample.csv', import.meta.url), 'utf-8');
    const app = createServer();

    const res = await app.inject({
      method: 'POST',
      url: '/import/csv',
      headers: { 'content-type': 'text/csv' },
      payload: csv,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.parsed.length).toBe(5);
    expect(body.normalized.length).toBe(5);
    expect(body.errors.length).toBe(1);

    await app.close();
  });

  it('returns 400 when no CSV provided', async () => {
    const app = createServer();
    const res = await app.inject({ method: 'POST', url: '/import/csv', headers: { 'content-type': 'text/plain' }, payload: '' });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it('accepts semicolon-delimited fixture', async () => {
    const csv = readFileSync(new URL('./fixtures/bank-sample-semicolon.csv', import.meta.url), 'utf-8');
    const app = createServer();
    const res = await app.inject({ method: 'POST', url: '/import/csv', headers: { 'content-type': 'text/csv' }, payload: csv });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.parsed.length).toBe(2);
    expect(body.normalized.length).toBe(2);
    await app.close();
  });

  it('serves OpenAPI JSON at /docs/json', async () => {
    const app = createServer();
    const res = await app.inject({ method: 'GET', url: '/docs/json' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('openapi');
    expect(body.info.title).toBe('Clara API');
    expect(body.components).toBeDefined();
    expect(body.components.schemas.Transaction).toBeDefined();
    // Check generated schema has expected properties from Zod
    expect(body.components.schemas.Transaction.properties.id).toBeDefined();
    expect(body.components.schemas.NormalizedTransactionInput.properties.accountExternalId).toBeDefined();
    await app.close();
  });
});