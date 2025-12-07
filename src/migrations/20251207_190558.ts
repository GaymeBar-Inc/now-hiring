import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Schema already applied via dev mode push - no-op migration
  // Original migration added: logo_image_id, logo_text columns to header table
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header" DROP CONSTRAINT "header_logo_image_id_media_id_fk";
  
  DROP INDEX "header_logo_logo_image_idx";
  ALTER TABLE "header" DROP COLUMN "logo_image_id";
  ALTER TABLE "header" DROP COLUMN "logo_text";`)
}
