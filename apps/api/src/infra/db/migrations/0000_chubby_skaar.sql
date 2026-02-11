CREATE TABLE "keyword_category_map" (
	"id" serial PRIMARY KEY NOT NULL,
	"keyword" varchar(64) NOT NULL,
	"category" varchar(64) NOT NULL,
	CONSTRAINT "keyword_category_map_keyword_unique" UNIQUE("keyword")
);
