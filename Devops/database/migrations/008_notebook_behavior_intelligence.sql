-- 008_notebook_behavior_intelligence.sql
-- Adds behavior event telemetry storage for adaptive notebook guidance.

CREATE TABLE IF NOT EXISTS notebook_behavior_events (
  id SERIAL PRIMARY KEY,
  notebook_id INTEGER NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notebook_behavior_events_notebook
  ON notebook_behavior_events (notebook_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notebook_behavior_events_user
  ON notebook_behavior_events (user_id, created_at DESC);
