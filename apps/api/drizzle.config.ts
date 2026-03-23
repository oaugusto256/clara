import { defineConfig } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://root:root@localhost:5432/clara";

export default defineConfig({
  schema: [
    "./src/infra/db/keywordCategoryMap.schema.ts",
    "./src/infra/db/transactions.schema.ts",
    "./src/infra/db/categories.schema.ts",
  ],
  out: "./src/infra/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
