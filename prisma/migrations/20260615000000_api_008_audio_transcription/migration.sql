CREATE TYPE "public"."transcription_status" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

ALTER TABLE "public"."note_attachments"
ADD COLUMN "transcription_status" "public"."transcription_status";
