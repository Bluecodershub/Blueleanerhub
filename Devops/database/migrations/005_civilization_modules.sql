-- ============================================================
-- MIGRATION 005 — BlueLearnerHub Civilization Modules
-- Adds: Tutorial Engine, Q&A Network, Developer Portal,
--       Certificates, Learning Tracks, Organizations,
--       pgvector Semantic Search
-- ============================================================

BEGIN;

-- ────────────────────────────────────────────────────────────
-- EXTENSION: pgvector for semantic search
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- ENUMS
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
  CREATE TYPE difficulty_level  AS ENUM ('beginner','intermediate','advanced','expert');
  CREATE TYPE vote_type         AS ENUM ('up','down');
  CREATE TYPE repo_visibility   AS ENUM ('public','private');
  CREATE TYPE issue_status      AS ENUM ('open','in_progress','closed');
  CREATE TYPE pr_status         AS ENUM ('open','merged','closed');
  CREATE TYPE org_type          AS ENUM ('corporate','university','community');
  CREATE TYPE cert_type         AS ENUM ('course','track','hackathon','skill');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────
-- MODULE 1: TUTORIAL ENGINE
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tutorials (
  id                 SERIAL PRIMARY KEY,
  slug               VARCHAR(255) UNIQUE NOT NULL,
  title              VARCHAR(255) NOT NULL,
  description        TEXT,
  author_id          INTEGER REFERENCES users(id),
  domain             VARCHAR(100) NOT NULL,
  sub_domain         VARCHAR(100),
  difficulty         difficulty_level DEFAULT 'beginner',
  estimated_minutes  INTEGER DEFAULT 15,
  xp_reward          INTEGER DEFAULT 50 NOT NULL,
  prerequisites      TEXT[],
  tags               TEXT[],
  is_published       BOOLEAN DEFAULT false NOT NULL,
  view_count         INTEGER DEFAULT 0 NOT NULL,
  completion_count   INTEGER DEFAULT 0 NOT NULL,
  -- Vector for semantic similarity search
  embedding          vector(384),
  created_at         TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at         TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tutorials_domain       ON tutorials (domain);
CREATE INDEX IF NOT EXISTS idx_tutorials_difficulty   ON tutorials (difficulty);
CREATE INDEX IF NOT EXISTS idx_tutorials_published    ON tutorials (is_published);
-- IVFFlat index for ANN search on tutorial embeddings
CREATE INDEX IF NOT EXISTS idx_tutorials_embedding
  ON tutorials USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

CREATE TABLE IF NOT EXISTS tutorial_sections (
  id                   SERIAL PRIMARY KEY,
  tutorial_id          INTEGER REFERENCES tutorials(id) ON DELETE CASCADE NOT NULL,
  title                VARCHAR(255) NOT NULL,
  content              TEXT NOT NULL,
  section_order        INTEGER NOT NULL,
  language             VARCHAR(50),
  starter_code         TEXT,
  solution_code        TEXT,
  has_exercise         BOOLEAN DEFAULT false NOT NULL,
  exercise_prompt      TEXT,
  exercise_test_cases  JSONB,
  exercise_xp_reward   INTEGER DEFAULT 20
);

CREATE INDEX IF NOT EXISTS idx_tutorial_sections_tutorial ON tutorial_sections (tutorial_id, section_order);

CREATE TABLE IF NOT EXISTS tutorial_progress (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) NOT NULL,
  tutorial_id  INTEGER REFERENCES tutorials(id) NOT NULL,
  section_id   INTEGER REFERENCES tutorial_sections(id) NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, section_id)
);

CREATE TABLE IF NOT EXISTS tutorial_completions (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) NOT NULL,
  tutorial_id  INTEGER REFERENCES tutorials(id) NOT NULL,
  xp_awarded   INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, tutorial_id)
);

-- ────────────────────────────────────────────────────────────
-- MODULE 2: Q&A KNOWLEDGE NETWORK
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS qna_questions (
  id                 SERIAL PRIMARY KEY,
  author_id          INTEGER REFERENCES users(id) NOT NULL,
  title              VARCHAR(500) NOT NULL,
  body               TEXT NOT NULL,
  domain             VARCHAR(100),
  view_count         INTEGER DEFAULT 0 NOT NULL,
  answer_count       INTEGER DEFAULT 0 NOT NULL,
  vote_score         INTEGER DEFAULT 0 NOT NULL,
  is_answered        BOOLEAN DEFAULT false NOT NULL,
  accepted_answer_id INTEGER,
  bounty_amount      INTEGER DEFAULT 0 NOT NULL,
  bounty_deadline    TIMESTAMP,
  -- Vector for duplicate detection
  embedding          vector(384),
  created_at         TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at         TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_qna_questions_domain    ON qna_questions (domain);
CREATE INDEX IF NOT EXISTS idx_qna_questions_votes     ON qna_questions (vote_score DESC);
CREATE INDEX IF NOT EXISTS idx_qna_questions_answered  ON qna_questions (is_answered);
CREATE INDEX IF NOT EXISTS idx_qna_questions_embedding
  ON qna_questions USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

CREATE TABLE IF NOT EXISTS qna_answers (
  id           SERIAL PRIMARY KEY,
  question_id  INTEGER REFERENCES qna_questions(id) ON DELETE CASCADE NOT NULL,
  author_id    INTEGER REFERENCES users(id) NOT NULL,
  body         TEXT NOT NULL,
  vote_score   INTEGER DEFAULT 0 NOT NULL,
  is_accepted  BOOLEAN DEFAULT false NOT NULL,
  ai_generated BOOLEAN DEFAULT false NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_qna_answers_question ON qna_answers (question_id);

CREATE TABLE IF NOT EXISTS qna_votes (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) NOT NULL,
  target_type VARCHAR(20) NOT NULL,
  target_id   INTEGER NOT NULL,
  vote        vote_type NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS tags (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  domain      VARCHAR(100),
  created_at  TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS qna_question_tags (
  question_id INTEGER REFERENCES qna_questions(id) ON DELETE CASCADE NOT NULL,
  tag_id      INTEGER REFERENCES tags(id) NOT NULL,
  PRIMARY KEY (question_id, tag_id)
);

CREATE TABLE IF NOT EXISTS user_reputation (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) NOT NULL UNIQUE,
  points     INTEGER DEFAULT 1 NOT NULL,
  rank       VARCHAR(100) DEFAULT 'Curious Learner' NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ────────────────────────────────────────────────────────────
-- MODULE 3: DEVELOPER PORTAL
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS repositories (
  id             SERIAL PRIMARY KEY,
  owner_id       INTEGER REFERENCES users(id) NOT NULL,
  name           VARCHAR(255) NOT NULL,
  slug           VARCHAR(255) NOT NULL,
  description    TEXT,
  language       VARCHAR(100),
  visibility     repo_visibility DEFAULT 'public' NOT NULL,
  is_template    BOOLEAN DEFAULT false NOT NULL,
  default_branch VARCHAR(100) DEFAULT 'main' NOT NULL,
  star_count     INTEGER DEFAULT 0 NOT NULL,
  fork_count     INTEGER DEFAULT 0 NOT NULL,
  forked_from_id INTEGER REFERENCES repositories(id),
  topics         TEXT[],
  license        VARCHAR(100),
  readme_content TEXT,
  total_commits  INTEGER DEFAULT 0 NOT NULL,
  created_at     TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE (owner_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_repositories_owner ON repositories (owner_id);

CREATE TABLE IF NOT EXISTS repository_files (
  id             SERIAL PRIMARY KEY,
  repo_id        INTEGER REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  path           VARCHAR(1024) NOT NULL,
  content        TEXT,
  language       VARCHAR(100),
  size_bytes     INTEGER DEFAULT 0 NOT NULL,
  last_commit_id INTEGER,
  created_at     TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE (repo_id, path)
);

CREATE TABLE IF NOT EXISTS commits (
  id               SERIAL PRIMARY KEY,
  repo_id          INTEGER REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  sha              VARCHAR(64) UNIQUE NOT NULL,
  author_id        INTEGER REFERENCES users(id) NOT NULL,
  message          TEXT NOT NULL,
  changes_summary  JSONB,
  parent_sha       VARCHAR(64),
  branch           VARCHAR(255) DEFAULT 'main' NOT NULL,
  created_at       TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commits_repo ON commits (repo_id, created_at DESC);

CREATE TABLE IF NOT EXISTS issues (
  id          SERIAL PRIMARY KEY,
  repo_id     INTEGER REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  author_id   INTEGER REFERENCES users(id) NOT NULL,
  number      INTEGER NOT NULL,
  title       VARCHAR(500) NOT NULL,
  body        TEXT,
  status      issue_status DEFAULT 'open' NOT NULL,
  labels      TEXT[],
  assignee_id INTEGER REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW() NOT NULL,
  closed_at   TIMESTAMP,
  UNIQUE (repo_id, number)
);

CREATE TABLE IF NOT EXISTS pull_requests (
  id              SERIAL PRIMARY KEY,
  repo_id         INTEGER REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  author_id       INTEGER REFERENCES users(id) NOT NULL,
  number          INTEGER NOT NULL,
  title           VARCHAR(500) NOT NULL,
  description     TEXT,
  source_branch   VARCHAR(255) NOT NULL,
  target_branch   VARCHAR(255) DEFAULT 'main' NOT NULL,
  status          pr_status DEFAULT 'open' NOT NULL,
  diff_content    TEXT,
  ai_review       TEXT,
  ai_review_score SMALLINT,
  changes_added   INTEGER DEFAULT 0,
  changes_removed INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW() NOT NULL,
  merged_at       TIMESTAMP,
  closed_at       TIMESTAMP,
  UNIQUE (repo_id, number)
);

CREATE TABLE IF NOT EXISTS repository_stars (
  user_id    INTEGER REFERENCES users(id) NOT NULL,
  repo_id    INTEGER REFERENCES repositories(id) NOT NULL,
  starred_at TIMESTAMP DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, repo_id)
);

-- ────────────────────────────────────────────────────────────
-- MODULE 4: CERTIFICATES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS certificate_templates (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  type          cert_type NOT NULL,
  design_config JSONB NOT NULL,
  is_active     BOOLEAN DEFAULT true NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS certificates (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER REFERENCES users(id) NOT NULL,
  template_id      INTEGER REFERENCES certificate_templates(id) NOT NULL,
  credential_id    VARCHAR(64) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  title            VARCHAR(255) NOT NULL,
  issued_for       VARCHAR(255),
  issuer_name      VARCHAR(255) DEFAULT 'BlueLearnerHub' NOT NULL,
  recipient_name   VARCHAR(255) NOT NULL,
  issued_at        TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at       TIMESTAMP,
  verification_url TEXT,
  pdf_url          TEXT,
  metadata         JSONB
);

CREATE INDEX IF NOT EXISTS idx_certificates_user       ON certificates (user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_credential ON certificates (credential_id);

-- ────────────────────────────────────────────────────────────
-- MODULE 5: LEARNING TRACKS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS learning_tracks (
  id                      SERIAL PRIMARY KEY,
  title                   VARCHAR(255) NOT NULL,
  slug                    VARCHAR(255) UNIQUE NOT NULL,
  description             TEXT,
  domain                  VARCHAR(100) NOT NULL,
  career_outcome          VARCHAR(255),
  estimated_weeks         INTEGER,
  difficulty              difficulty_level DEFAULT 'beginner',
  is_published            BOOLEAN DEFAULT false NOT NULL,
  enrollment_count        INTEGER DEFAULT 0 NOT NULL,
  certificate_template_id INTEGER REFERENCES certificate_templates(id),
  thumbnail_url           TEXT,
  promo_video_url         TEXT,
  syllabus                JSONB,
  created_at              TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at              TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS track_courses (
  track_id   INTEGER REFERENCES learning_tracks(id) ON DELETE CASCADE NOT NULL,
  course_id  INTEGER REFERENCES courses(id) NOT NULL,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true NOT NULL,
  PRIMARY KEY (track_id, course_id)
);

CREATE TABLE IF NOT EXISTS track_enrollments (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER REFERENCES users(id) NOT NULL,
  track_id            INTEGER REFERENCES learning_tracks(id) NOT NULL,
  enrolled_at         TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at        TIMESTAMP,
  progress_percentage SMALLINT DEFAULT 0 NOT NULL,
  certificate_id      INTEGER REFERENCES certificates(id),
  UNIQUE (user_id, track_id)
);

-- ────────────────────────────────────────────────────────────
-- MODULE 6: ORGANIZATIONS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organizations (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(255) NOT NULL,
  slug              VARCHAR(255) UNIQUE NOT NULL,
  type              org_type NOT NULL,
  description       TEXT,
  logo_url          TEXT,
  website           VARCHAR(500),
  industry          VARCHAR(100),
  country           VARCHAR(100),
  city              VARCHAR(100),
  employee_count    VARCHAR(50),
  verified          BOOLEAN DEFAULT false NOT NULL,
  subscription_tier VARCHAR(50) DEFAULT 'FREE' NOT NULL,
  contact_email     VARCHAR(255),
  created_at        TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS org_members (
  org_id    INTEGER REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id   INTEGER REFERENCES users(id) NOT NULL,
  role      VARCHAR(50) DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
  PRIMARY KEY (org_id, user_id)
);

CREATE TABLE IF NOT EXISTS talent_pool (
  id           SERIAL PRIMARY KEY,
  org_id       INTEGER REFERENCES organizations(id) NOT NULL,
  candidate_id INTEGER REFERENCES users(id) NOT NULL,
  notes        TEXT,
  stage        VARCHAR(100) DEFAULT 'prospects',
  added_at     TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE (org_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS innovation_challenges (
  id                   SERIAL PRIMARY KEY,
  org_id               INTEGER REFERENCES organizations(id) NOT NULL,
  title                VARCHAR(255) NOT NULL,
  description          TEXT NOT NULL,
  prize_description    TEXT,
  deadline             TIMESTAMP,
  submission_count     INTEGER DEFAULT 0 NOT NULL,
  status               VARCHAR(50) DEFAULT 'active' NOT NULL,
  evaluation_criteria  JSONB,
  created_at           TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ────────────────────────────────────────────────────────────
-- MODULE 7: CONTENT EMBEDDINGS MANIFEST
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_embeddings_manifest (
  id           SERIAL PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL,
  content_id   INTEGER NOT NULL,
  model        VARCHAR(100) DEFAULT 'all-MiniLM-L6-v2' NOT NULL,
  dimensions   INTEGER DEFAULT 384 NOT NULL,
  updated_at   TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE (content_type, content_id)
);

-- ────────────────────────────────────────────────────────────
-- SEED: Default certificate template
-- ────────────────────────────────────────────────────────────

INSERT INTO certificate_templates (name, type, design_config) VALUES
  ('Course Completion', 'course', '{"background":"#1a1a2e","accent":"#0066cc","font":"Inter","layout":"landscape"}'),
  ('Track Mastery',     'track',  '{"background":"#0a192f","accent":"#64ffda","font":"Inter","layout":"landscape"}'),
  ('Hackathon Winner',  'hackathon','{"background":"#1a0533","accent":"#f59e0b","font":"Inter","layout":"landscape"}')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- SEED: Core tags
-- ────────────────────────────────────────────────────────────

INSERT INTO tags (name, slug, domain) VALUES
  ('Python',              'python',              'programming'),
  ('JavaScript',          'javascript',          'programming'),
  ('TypeScript',          'typescript',          'programming'),
  ('Machine Learning',    'machine-learning',    'ai'),
  ('Data Structures',     'data-structures',     'computer-science'),
  ('Algorithms',          'algorithms',          'computer-science'),
  ('Thermodynamics',      'thermodynamics',      'mechanical'),
  ('Circuit Analysis',    'circuit-analysis',    'electrical'),
  ('Structural Analysis', 'structural-analysis', 'civil'),
  ('Financial Modeling',  'financial-modeling',  'finance'),
  ('Valuation',           'valuation',           'finance'),
  ('SQL',                 'sql',                 'databases'),
  ('React',               'react',               'frontend'),
  ('FastAPI',             'fastapi',             'backend'),
  ('Docker',              'docker',              'devops')
ON CONFLICT (slug) DO NOTHING;

COMMIT;
