CREATE TABLE "categories" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"key" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"color" varchar(32),
	CONSTRAINT "categories_key_unique" UNIQUE("key")
);
--> statement-breakpoint
INSERT INTO "categories" ("id", "key", "name", "color") VALUES
  ('cat_housing',       'housing',       'Housing',       '#6366f1'),
  ('cat_food',          'food',          'Food',          '#3b82f6'),
  ('cat_transport',     'transport',     'Transport',     '#f59e42'),
  ('cat_health',        'health',        'Health',        '#f43f5e'),
  ('cat_education',     'education',     'Education',     '#fde68a'),
  ('cat_leisure',       'leisure',       'Leisure',       '#f472b6'),
  ('cat_subscriptions', 'subscriptions', 'Subscriptions', '#8b5cf6'),
  ('cat_savings',       'savings',       'Savings',       '#10b981'),
  ('cat_other',         'other',         'Other',         '#64748b')
ON CONFLICT ("key") DO NOTHING;
