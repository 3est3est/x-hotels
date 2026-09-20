ALTER TABLE "user" ADD COLUMN "id_document_number" text;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "id_document_url";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "id_document_public_id";
