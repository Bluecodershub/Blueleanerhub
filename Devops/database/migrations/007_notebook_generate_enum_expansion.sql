-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007: Forward-safe notebook_generate_type enum expansion
-- ─────────────────────────────────────────────────────────────────────────────
-- Use this migration for environments where 006 may already be applied.
-- It safely appends newer enum values used by notebook generation features.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'notebook_generate_type' AND e.enumlabel = 'notebook_guide'
  ) THEN
    ALTER TYPE notebook_generate_type ADD VALUE 'notebook_guide';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'notebook_generate_type' AND e.enumlabel = 'audio_overview'
  ) THEN
    ALTER TYPE notebook_generate_type ADD VALUE 'audio_overview';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'notebook_generate_type' AND e.enumlabel = 'compare_sources'
  ) THEN
    ALTER TYPE notebook_generate_type ADD VALUE 'compare_sources';
  END IF;
END $$;
