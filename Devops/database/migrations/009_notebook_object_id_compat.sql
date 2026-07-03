-- Migration 009: Align study-notebook worker tables with Mongo ObjectId IDs.
-- The backend now owns notebooks in MongoDB and sends ObjectId strings to the
-- AI worker. The worker only needs source metadata and vector chunks locally.

ALTER TABLE IF EXISTS notebook_source_annotations DROP CONSTRAINT IF EXISTS notebook_source_annotations_notebook_id_fkey;
ALTER TABLE IF EXISTS notebook_source_annotations DROP CONSTRAINT IF EXISTS notebook_source_annotations_source_id_fkey;
ALTER TABLE IF EXISTS notebook_source_annotations DROP CONSTRAINT IF EXISTS notebook_source_annotations_user_id_fkey;
ALTER TABLE IF EXISTS notebook_generations DROP CONSTRAINT IF EXISTS notebook_generations_notebook_id_fkey;
ALTER TABLE IF EXISTS notebook_chats DROP CONSTRAINT IF EXISTS notebook_chats_notebook_id_fkey;
ALTER TABLE IF EXISTS notebook_chats DROP CONSTRAINT IF EXISTS notebook_chats_user_id_fkey;
ALTER TABLE IF EXISTS notebook_chunks DROP CONSTRAINT IF EXISTS notebook_chunks_notebook_id_fkey;
ALTER TABLE IF EXISTS notebook_chunks DROP CONSTRAINT IF EXISTS notebook_chunks_source_id_fkey;
ALTER TABLE IF EXISTS notebook_sources DROP CONSTRAINT IF EXISTS notebook_sources_notebook_id_fkey;
ALTER TABLE IF EXISTS notebooks DROP CONSTRAINT IF EXISTS notebooks_user_id_fkey;

ALTER TABLE IF EXISTS notebooks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS notebook_sources ALTER COLUMN id DROP DEFAULT;

ALTER TABLE IF EXISTS notebooks ALTER COLUMN id TYPE VARCHAR(80) USING id::text;
ALTER TABLE IF EXISTS notebooks ALTER COLUMN user_id TYPE VARCHAR(80) USING user_id::text;
ALTER TABLE IF EXISTS notebook_sources ALTER COLUMN id TYPE VARCHAR(80) USING id::text;
ALTER TABLE IF EXISTS notebook_sources ALTER COLUMN notebook_id TYPE VARCHAR(80) USING notebook_id::text;
ALTER TABLE IF EXISTS notebook_chunks ALTER COLUMN source_id TYPE VARCHAR(80) USING source_id::text;
ALTER TABLE IF EXISTS notebook_chunks ALTER COLUMN notebook_id TYPE VARCHAR(80) USING notebook_id::text;
ALTER TABLE IF EXISTS notebook_chats ALTER COLUMN notebook_id TYPE VARCHAR(80) USING notebook_id::text;
ALTER TABLE IF EXISTS notebook_chats ALTER COLUMN user_id TYPE VARCHAR(80) USING user_id::text;
ALTER TABLE IF EXISTS notebook_generations ALTER COLUMN notebook_id TYPE VARCHAR(80) USING notebook_id::text;
ALTER TABLE IF EXISTS notebook_source_annotations ALTER COLUMN notebook_id TYPE VARCHAR(80) USING notebook_id::text;
ALTER TABLE IF EXISTS notebook_source_annotations ALTER COLUMN source_id TYPE VARCHAR(80) USING source_id::text;
ALTER TABLE IF EXISTS notebook_source_annotations ALTER COLUMN user_id TYPE VARCHAR(80) USING user_id::text;

ALTER TABLE IF EXISTS notebook_chunks
  ADD CONSTRAINT notebook_chunks_source_id_fkey
  FOREIGN KEY (source_id) REFERENCES notebook_sources(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS notebook_source_annotations
  ADD CONSTRAINT notebook_source_annotations_source_id_fkey
  FOREIGN KEY (source_id) REFERENCES notebook_sources(id) ON DELETE CASCADE;
