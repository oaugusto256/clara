DROP INDEX "unique_transaction";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_transaction" ON "transactions" USING btree ("user_id","date","amount","description");