import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "keywords" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "broadcasts" ADD COLUMN IF NOT EXISTS "audience_topic_id" integer;
  ALTER TABLE "_broadcasts_v" ADD COLUMN IF NOT EXISTS "version_audience_topic_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN IF NOT EXISTS "keywords_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN IF NOT EXISTS "keywords_id" integer;
  ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "resend_topic_id" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "keywords_id" integer;

  CREATE UNIQUE INDEX IF NOT EXISTS "keywords_name_idx" ON "keywords" USING btree ("name");
  CREATE INDEX IF NOT EXISTS "keywords_updated_at_idx" ON "keywords" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "keywords_created_at_idx" ON "keywords" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "broadcasts_audience_topic_idx" ON "broadcasts" USING btree ("audience_topic_id");
  CREATE INDEX IF NOT EXISTS "_broadcasts_v_version_version_audience_topic_idx" ON "_broadcasts_v" USING btree ("version_audience_topic_id");
  CREATE INDEX IF NOT EXISTS "posts_rels_keywords_id_idx" ON "posts_rels" USING btree ("keywords_id");
  CREATE INDEX IF NOT EXISTS "_posts_v_rels_keywords_id_idx" ON "_posts_v_rels" USING btree ("keywords_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_keywords_id_idx" ON "payload_locked_documents_rels" USING btree ("keywords_id");`)

  // Foreign key constraints — skip if already present (idempotent guard)
  await db.execute(sql`
  DO $$ BEGIN
    ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_audience_topic_id_categories_id_fk"
      FOREIGN KEY ("audience_topic_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "_broadcasts_v" ADD CONSTRAINT "_broadcasts_v_version_audience_topic_id_categories_id_fk"
      FOREIGN KEY ("version_audience_topic_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_keywords_fk"
      FOREIGN KEY ("keywords_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_keywords_fk"
      FOREIGN KEY ("keywords_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_keywords_fk"
      FOREIGN KEY ("keywords_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;`)

  // Drop the legacy header_logo_url column if it still exists
  await db.execute(sql`
  ALTER TABLE "email_layout" DROP COLUMN IF EXISTS "header_logo_url";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "keywords" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "keywords" CASCADE;
  ALTER TABLE "broadcasts" DROP CONSTRAINT IF EXISTS "broadcasts_audience_topic_id_categories_id_fk";
  ALTER TABLE "_broadcasts_v" DROP CONSTRAINT IF EXISTS "_broadcasts_v_version_audience_topic_id_categories_id_fk";
  ALTER TABLE "posts_rels" DROP CONSTRAINT IF EXISTS "posts_rels_keywords_fk";
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT IF EXISTS "_posts_v_rels_keywords_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_keywords_fk";
  DROP INDEX IF EXISTS "broadcasts_audience_topic_idx";
  DROP INDEX IF EXISTS "_broadcasts_v_version_version_audience_topic_idx";
  DROP INDEX IF EXISTS "posts_rels_keywords_id_idx";
  DROP INDEX IF EXISTS "_posts_v_rels_keywords_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_keywords_id_idx";
  ALTER TABLE "email_layout" ADD COLUMN IF NOT EXISTS "header_logo_url" varchar;
  ALTER TABLE "broadcasts" DROP COLUMN IF EXISTS "audience_topic_id";
  ALTER TABLE "_broadcasts_v" DROP COLUMN IF EXISTS "version_audience_topic_id";
  ALTER TABLE "posts_rels" DROP COLUMN IF EXISTS "keywords_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN IF EXISTS "keywords_id";
  ALTER TABLE "categories" DROP COLUMN IF EXISTS "resend_topic_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "keywords_id";`)
}
