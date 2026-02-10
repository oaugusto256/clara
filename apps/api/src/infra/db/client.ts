import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './keywordCategoryMap.schema';

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://root:root@db:5432/clara";
const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle(pool, { schema });
