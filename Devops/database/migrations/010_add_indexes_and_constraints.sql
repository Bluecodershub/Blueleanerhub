-- 010_add_indexes_and_constraints.sql
-- Adds missing indexes and CHECK constraints for data integrity

-- INDEXES

-- tutorials
CREATE INDEX IF NOT EXISTS idx_tutorials_author
  ON tutorials (author_id);

CREATE INDEX IF NOT EXISTS idx_tutorials_published_difficulty
  ON tutorials (is_published, difficulty);

-- qna_questions
CREATE INDEX IF NOT EXISTS idx_qna_questions_author
  ON qna_questions (author_id);

CREATE INDEX IF NOT EXISTS idx_qna_questions_created
  ON qna_questions (created_at DESC);

-- qna_answers
CREATE INDEX IF NOT EXISTS idx_qna_answers_author
  ON qna_answers (author_id);

CREATE INDEX IF NOT EXISTS idx_qna_answers_accepted
  ON qna_answers (is_accepted);

-- notebooks
CREATE INDEX IF NOT EXISTS idx_notebooks_user_updated
  ON notebooks (user_id, updated_at);

-- commits
CREATE INDEX IF NOT EXISTS idx_commits_author
  ON commits (author_id);

-- issues
CREATE INDEX IF NOT EXISTS idx_issues_author
  ON issues (author_id);

CREATE INDEX IF NOT EXISTS idx_issues_status
  ON issues (status);

-- pull_requests
CREATE INDEX IF NOT EXISTS idx_pull_requests_author
  ON pull_requests (author_id);

CREATE INDEX IF NOT EXISTS idx_pull_requests_status
  ON pull_requests (status);

-- users
CREATE INDEX IF NOT EXISTS idx_users_last_active
  ON users (last_active DESC);

-- CHECK CONSTRAINTS

ALTER TABLE tutorials
  ADD CONSTRAINT chk_tutorials_view_count_non_negative
  CHECK (view_count >= 0);

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_credits') THEN
    ALTER TABLE user_credits
      ADD CONSTRAINT chk_user_credits_ai_tokens_non_negative
      CHECK (ai_tokens_balance >= 0);
  END IF;
END $$;

ALTER TABLE track_enrollments
  ADD CONSTRAINT chk_track_enrollments_progress_percentage_max
  CHECK (progress_percentage <= 100);
