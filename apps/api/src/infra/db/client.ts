import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './keywordCategoryMap.schema';

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://root:root@localhost:5432/clara";
const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export async function closeDbPool(): Promise<void> {
  await pool.end();
}
