-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006: Study Notebooks (NotebookLM-style AI Research Assistant)
-- ─────────────────────────────────────────────────────────────────────────────
-- Run AFTER 005_civilization_modules.sql
-- Requires: pgvector extension (added in 005)

-- Enums
DO $$ BEGIN
  CREATE TYPE notebook_source_type AS ENUM ('pdf', 'text', 'url');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notebook_source_status AS ENUM ('pending', 'processing', 'ready', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notebook_generate_type AS ENUM ('summary', 'study_guide', 'notebook_guide', 'faq', 'flashcards', 'quiz', 'audio_overview', 'compare_sources');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- notebooks: user-owned study workspaces
CREATE TABLE IF NOT EXISTS notebooks (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  emoji        VARCHAR(10) NOT NULL DEFAULT '📓',
  source_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);

-- notebook_sources: individual documents added to a notebook
CREATE TABLE IF NOT EXISTS notebook_sources (
  id          SERIAL PRIMARY KEY,
  notebook_id INTEGER NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  source_type notebook_source_type NOT NULL,
  content     TEXT,
  url         TEXT,
  s3_key      TEXT,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  word_count  INTEGER NOT NULL DEFAULT 0,
  status      notebook_source_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notebook_sources_notebook_id ON notebook_sources(notebook_id);

-- notebook_chunks: vectorised text chunks for RAG
-- Each row is a ~500-word chunk from a source document with its embedding.
CREATE TABLE IF NOT EXISTS notebook_chunks (
  id          SERIAL PRIMARY KEY,
  source_id   INTEGER NOT NULL REFERENCES notebook_sources(id) ON DELETE CASCADE,
  notebook_id INTEGER NOT NULL REFERENCES notebooks(id)        ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content     TEXT NOT NULL,
  embedding   vector(384),   -- sentence-transformers/all-MiniLM-L6-v2 (384-dim)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notebook_chunks_notebook_id ON notebook_chunks(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_chunks_source_id   ON notebook_chunks(source_id);

-- IVFFlat index for approximate nearest-neighbour search (cosine distance)
-- CREATE INDEX idx_notebook_chunks_embedding ON notebook_chunks
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- Uncomment once you have > 10k rows for better performance.

-- notebook_chats: persisted conversation history (messages stored as JSONB)
CREATE TABLE IF NOT EXISTS notebook_chats (
  id          SERIAL PRIMARY KEY,
  notebook_id INTEGER NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  messages    JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (notebook_id, user_id)
);

-- notebook_generations: AI-generated study artefacts
CREATE TABLE IF NOT EXISTS notebook_generations (
  id          SERIAL PRIMARY KEY,
  notebook_id INTEGER NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  type        notebook_generate_type NOT NULL,
  title       VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notebook_generations_notebook_id ON notebook_generations(notebook_id);

-- notebook_source_annotations: saved highlights + personal notes on source evidence
CREATE TABLE IF NOT EXISTS notebook_source_annotations (
  id          SERIAL PRIMARY KEY,
  notebook_id INTEGER NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  source_id   INTEGER NOT NULL REFERENCES notebook_sources(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quote       TEXT NOT NULL,
  note        TEXT,
  chunk_index INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notebook_annotations_source_id ON notebook_source_annotations(source_id);
CREATE INDEX IF NOT EXISTS idx_notebook_annotations_notebook_id ON notebook_source_annotations(notebook_id);
