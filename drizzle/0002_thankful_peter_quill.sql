ALTER TABLE "evaluation_samples" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_evaluation_samples_name" ON "evaluation_samples" USING btree ("name");