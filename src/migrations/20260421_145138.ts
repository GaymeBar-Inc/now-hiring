import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Schema already applied via dev mode push — no-op migration
  // Original migration created: broadcasts, broadcasts_rels, _broadcasts_v, _broadcasts_v_rels,
  // site_settings, email_settings, email_layout tables
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
