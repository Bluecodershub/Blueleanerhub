-- BlueLearnerHub MVP Migration
-- Creates core tables for hackathon platform

-- Create role enum
DO $$ BEGIN
    CREATE TYPE role AS ENUM ('ADMIN', 'CORPORATE', 'HR', 'STUDENT', 'CANDIDATE', 'FACULTY', 'INSTITUTION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create domain enum
DO $$ BEGIN
    CREATE TYPE domain AS ENUM ('ENGINEERING', 'MANAGEMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    full_name VARCHAR(255) NOT NULL,
    role role DEFAULT 'STUDENT' NOT NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    total_points INTEGER DEFAULT 0 NOT NULL,
    avatar_config JSONB DEFAULT '{}',
    last_active TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_banned BOOLEAN DEFAULT false NOT NULL,
    profile_picture TEXT,
    bio TEXT,
    location VARCHAR(255),
    education_level VARCHAR(100),
    college_name VARCHAR(255),
    graduation_year INTEGER,
    current_position VARCHAR(255),
    company VARCHAR(255),
    years_experience INTEGER,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    resume_url TEXT,
    email_verified BOOLEAN DEFAULT false NOT NULL,
    preferences JSONB DEFAULT '{}' NOT NULL,
    notification_settings JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Hackathons table
CREATE TABLE IF NOT EXISTS hackathons (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    frequency VARCHAR(50) DEFAULT 'special',
    status VARCHAR(50) DEFAULT 'UPCOMING' NOT NULL,
    hosted_by_type VARCHAR(50),
    registration_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    registration_end TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    domain VARCHAR(100) DEFAULT 'GENERAL',
    difficulty VARCHAR(50),
    problem_statement TEXT,
    rules TEXT,
    team_size_min INTEGER DEFAULT 1,
    team_size_max INTEGER DEFAULT 4,
    allow_solo BOOLEAN DEFAULT true,
    prizes JSONB DEFAULT '[]',
    total_prize_pool VARCHAR(255),
    certificates BOOLEAN DEFAULT true,
    max_participants INTEGER,
    registration_fee INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]',
    allowed_languages JSONB DEFAULT '["javascript", "python", "java"]',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Hackathon registrations table
CREATE TABLE IF NOT EXISTS hackathon_registrations (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    team_id INTEGER,
    registration_status VARCHAR(50) DEFAULT 'registered' NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    payment_id VARCHAR(255),
    UNIQUE(hackathon_id, user_id)
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id) NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    team_leader_id INTEGER REFERENCES users(id) NOT NULL,
    team_code VARCHAR(50) UNIQUE NOT NULL,
    max_members INTEGER DEFAULT 4 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    role VARCHAR(50) DEFAULT 'member' NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(team_id, user_id)
);

-- Hackathon submissions table
CREATE TABLE IF NOT EXISTS hackathon_submissions (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    team_id INTEGER REFERENCES teams(id),
    language VARCHAR(50),
    source_code TEXT,
    file_uploads JSONB DEFAULT '[]' NOT NULL,
    demo_video_url TEXT,
    presentation_url TEXT,
    final_score INTEGER,
    rank INTEGER,
    submission_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User skills table
CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_unique ON user_skills(user_id, skill_name);

-- Insert sample data for testing
INSERT INTO users (email, password_hash, full_name, role) VALUES
('student@test.com', '$2a$10$dummy_hash_for_testing', 'Test Student', 'STUDENT'),
('corp@test.com', '$2a$10$dummy_hash_for_testing', 'Test Corp', 'CORPORATE')
ON CONFLICT (email) DO NOTHING;

-- Insert sample hackathons
INSERT INTO hackathons (org_id, title, slug, description, status, start_time, end_time, domain, total_prize_pool, registration_fee, max_participants) VALUES
(2, 'AI Revolution 2026', 'ai-revolution-2026', 'Build the next generation of AI-powered tools that reshape how humans interact with technology.', 'OPEN', NOW() + INTERVAL '7 days', NOW() + INTERVAL '10 days', 'SOFTWARE', '$10,000', 0, 500),
(2, 'FinTech Hack X', 'fintech-hack-x', 'Create innovative financial products that promote financial inclusion globally.', 'OPEN', NOW() + INTERVAL '3 days', NOW() + INTERVAL '6 days', 'FINANCE', '$7,500', 199, 200),
(2, 'GreenBuild Challenge', 'greenbuild-challenge', 'Design sustainable structural solutions for the cities of the future.', 'UPCOMING', NOW() + INTERVAL '30 days', NOW() + INTERVAL '33 days', 'CIVIL', '$4,000', 99, 100)
ON CONFLICT (slug) DO NOTHING;

-- Mock payments table
CREATE TABLE IF NOT EXISTS mock_payments (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    hackathon_id INTEGER REFERENCES hackathons(id) NOT NULL,
    amount INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
