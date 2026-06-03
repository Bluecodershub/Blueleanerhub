-- 009_learning_behavior_events.sql
-- Shared behavior telemetry for tutorials, hackathons, and quizzes.

CREATE TABLE IF NOT EXISTS learning_behavior_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_type VARCHAR(50) NOT NULL,
  target_id INTEGER NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_behavior_module
  ON learning_behavior_events (module_type, target_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_learning_behavior_user
  ON learning_behavior_events (user_id, created_at DESC);
