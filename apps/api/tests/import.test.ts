import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';
import { buildServer } from '../src/server';

describe('api: import endpoint', () => {
  it('accepts CSV text and returns parsed+normalized data', async () => {
    const csv = readFileSync(new URL('./fixtures/bank-sample.csv', import.meta.url), 'utf-8');
    const app = buildServer();

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
    const app = buildServer();
    const res = await app.inject({ method: 'POST', url: '/import/csv', headers: { 'content-type': 'text/plain' }, payload: '' });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it('accepts semicolon-delimited fixture', async () => {
    const csv = readFileSync(new URL('./fixtures/bank-sample-semicolon.csv', import.meta.url), 'utf-8');
    const app = buildServer();
    const res = await app.inject({ method: 'POST', url: '/import/csv', headers: { 'content-type': 'text/csv' }, payload: csv });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.parsed.length).toBe(2);
    expect(body.normalized.length).toBe(2);
    await app.close();
  });
});