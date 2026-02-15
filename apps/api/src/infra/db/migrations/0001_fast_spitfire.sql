CREATE TABLE "transactions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"account_id" varchar(64) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"direction" varchar(16) NOT NULL,
	"date" date NOT NULL,
	"posted_at" date,
	"category_id" varchar(64),
	"category_key" varchar(64),
	"source" varchar(32) NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "keyword_category_map" ALTER COLUMN "keyword" SET DATA TYPE varchar(512);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_transaction" ON "transactions" USING btree ("user_id","account_id","date","amount","description");