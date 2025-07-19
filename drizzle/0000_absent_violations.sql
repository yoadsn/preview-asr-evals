CREATE TABLE "evaluation_projects" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "evaluation_samples" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"audio_uri" varchar(255),
	"data" jsonb
);
--> statement-breakpoint
ALTER TABLE "evaluation_samples" ADD CONSTRAINT "evaluation_samples_project_id_evaluation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."evaluation_projects"("id") ON DELETE no action ON UPDATE no action;