import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_broadcasts_type" AS ENUM('single_post', 'weekly_digest', 'custom');
  CREATE TYPE "public"."enum_broadcasts_send_status" AS ENUM('draft', 'scheduled', 'sent', 'failed');
  CREATE TYPE "public"."enum_broadcasts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__broadcasts_v_version_type" AS ENUM('single_post', 'weekly_digest', 'custom');
  CREATE TYPE "public"."enum__broadcasts_v_version_send_status" AS ENUM('draft', 'scheduled', 'sent', 'failed');
  CREATE TYPE "public"."enum__broadcasts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_email_layout_footer_social_links_platform" AS ENUM('twitter', 'instagram', 'linkedin', 'facebook', 'youtube', 'tiktok', 'github', 'website');
  CREATE TABLE "broadcasts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_broadcasts_type" DEFAULT 'custom',
  	"subject" varchar,
  	"preview_text" varchar,
  	"body" jsonb,
  	"send_status" "enum_broadcasts_send_status" DEFAULT 'draft',
  	"resend_broadcast_id" varchar,
  	"scheduled_at" timestamp(3) with time zone,
  	"sent_at" timestamp(3) with time zone,
  	"error_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_broadcasts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "broadcasts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "_broadcasts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_type" "enum__broadcasts_v_version_type" DEFAULT 'custom',
  	"version_subject" varchar,
  	"version_preview_text" varchar,
  	"version_body" jsonb,
  	"version_send_status" "enum__broadcasts_v_version_send_status" DEFAULT 'draft',
  	"version_resend_broadcast_id" varchar,
  	"version_scheduled_at" timestamp(3) with time zone,
  	"version_sent_at" timestamp(3) with time zone,
  	"version_error_message" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__broadcasts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_broadcasts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar NOT NULL,
  	"favicon_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "email_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from_name" varchar DEFAULT 'Now Hiring',
  	"reply_to" varchar,
  	"sender_label" varchar DEFAULT 'Newsletter',
  	"resend_audience_id" varchar,
  	"welcome_email_enabled" boolean DEFAULT true,
  	"welcome_subject" varchar DEFAULT 'Welcome to the newsletter!',
  	"welcome_body" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "email_layout_footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_email_layout_footer_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "email_layout" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_logo_id" integer,
  	"header_logo_url" varchar,
  	"header_tagline" varchar,
  	"header_bg_color" varchar DEFAULT '#ffffff',
  	"header_text_color" varchar DEFAULT '#000000',
  	"footer_footer_text" varchar,
  	"footer_mailing_address" varchar NOT NULL,
  	"footer_unsubscribe_text" varchar DEFAULT 'Unsubscribe from this list',
  	"footer_bg_color" varchar DEFAULT '#f4f4f4',
  	"footer_text_color" varchar DEFAULT '#666666',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "forms_emails" ALTER COLUMN "subject" DROP NOT NULL;
  ALTER TABLE "header" ALTER COLUMN "logo_image_id" DROP NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "broadcasts_id" integer;
  ALTER TABLE "broadcasts_rels" ADD CONSTRAINT "broadcasts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."broadcasts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "broadcasts_rels" ADD CONSTRAINT "broadcasts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_broadcasts_v" ADD CONSTRAINT "_broadcasts_v_parent_id_broadcasts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."broadcasts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_broadcasts_v_rels" ADD CONSTRAINT "_broadcasts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_broadcasts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_broadcasts_v_rels" ADD CONSTRAINT "_broadcasts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "email_layout_footer_social_links" ADD CONSTRAINT "email_layout_footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."email_layout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "email_layout" ADD CONSTRAINT "email_layout_header_logo_id_media_id_fk" FOREIGN KEY ("header_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "broadcasts_updated_at_idx" ON "broadcasts" USING btree ("updated_at");
  CREATE INDEX "broadcasts_created_at_idx" ON "broadcasts" USING btree ("created_at");
  CREATE INDEX "broadcasts__status_idx" ON "broadcasts" USING btree ("_status");
  CREATE INDEX "broadcasts_rels_order_idx" ON "broadcasts_rels" USING btree ("order");
  CREATE INDEX "broadcasts_rels_parent_idx" ON "broadcasts_rels" USING btree ("parent_id");
  CREATE INDEX "broadcasts_rels_path_idx" ON "broadcasts_rels" USING btree ("path");
  CREATE INDEX "broadcasts_rels_posts_id_idx" ON "broadcasts_rels" USING btree ("posts_id");
  CREATE INDEX "_broadcasts_v_parent_idx" ON "_broadcasts_v" USING btree ("parent_id");
  CREATE INDEX "_broadcasts_v_version_version_updated_at_idx" ON "_broadcasts_v" USING btree ("version_updated_at");
  CREATE INDEX "_broadcasts_v_version_version_created_at_idx" ON "_broadcasts_v" USING btree ("version_created_at");
  CREATE INDEX "_broadcasts_v_version_version__status_idx" ON "_broadcasts_v" USING btree ("version__status");
  CREATE INDEX "_broadcasts_v_created_at_idx" ON "_broadcasts_v" USING btree ("created_at");
  CREATE INDEX "_broadcasts_v_updated_at_idx" ON "_broadcasts_v" USING btree ("updated_at");
  CREATE INDEX "_broadcasts_v_latest_idx" ON "_broadcasts_v" USING btree ("latest");
  CREATE INDEX "_broadcasts_v_autosave_idx" ON "_broadcasts_v" USING btree ("autosave");
  CREATE INDEX "_broadcasts_v_rels_order_idx" ON "_broadcasts_v_rels" USING btree ("order");
  CREATE INDEX "_broadcasts_v_rels_parent_idx" ON "_broadcasts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_broadcasts_v_rels_path_idx" ON "_broadcasts_v_rels" USING btree ("path");
  CREATE INDEX "_broadcasts_v_rels_posts_id_idx" ON "_broadcasts_v_rels" USING btree ("posts_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE INDEX "email_layout_footer_social_links_order_idx" ON "email_layout_footer_social_links" USING btree ("_order");
  CREATE INDEX "email_layout_footer_social_links_parent_id_idx" ON "email_layout_footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "email_layout_header_header_logo_idx" ON "email_layout" USING btree ("header_logo_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_broadcasts_fk" FOREIGN KEY ("broadcasts_id") REFERENCES "public"."broadcasts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_broadcasts_id_idx" ON "payload_locked_documents_rels" USING btree ("broadcasts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "broadcasts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "broadcasts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_broadcasts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_broadcasts_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_layout_footer_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_layout" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "broadcasts" CASCADE;
  DROP TABLE "broadcasts_rels" CASCADE;
  DROP TABLE "_broadcasts_v" CASCADE;
  DROP TABLE "_broadcasts_v_rels" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "email_settings" CASCADE;
  DROP TABLE "email_layout_footer_social_links" CASCADE;
  DROP TABLE "email_layout" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_broadcasts_fk";
  
  DROP INDEX "payload_locked_documents_rels_broadcasts_id_idx";
  ALTER TABLE "forms_emails" ALTER COLUMN "subject" SET NOT NULL;
  ALTER TABLE "header" ALTER COLUMN "logo_image_id" SET NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "broadcasts_id";
  DROP TYPE "public"."enum_broadcasts_type";
  DROP TYPE "public"."enum_broadcasts_send_status";
  DROP TYPE "public"."enum_broadcasts_status";
  DROP TYPE "public"."enum__broadcasts_v_version_type";
  DROP TYPE "public"."enum__broadcasts_v_version_send_status";
  DROP TYPE "public"."enum__broadcasts_v_version_status";
  DROP TYPE "public"."enum_email_layout_footer_social_links_platform";`)
}
