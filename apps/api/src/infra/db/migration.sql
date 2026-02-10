// drizzle/migration.sql
-- Migration for keyword_category_map table
CREATE TABLE IF NOT EXISTS keyword_category_map (
  id SERIAL PRIMARY KEY,
  keyword VARCHAR(64) NOT NULL UNIQUE,
  category VARCHAR(64) NOT NULL
);
