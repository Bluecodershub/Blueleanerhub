-- ============================================
-- EDTECH PLATFORM - COMPLETE DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('student', 'corporate', 'college', 'admin');
CREATE TYPE education_level AS ENUM ('high_school', 'bachelors', 'masters', 'phd');
CREATE TYPE domain_category AS ENUM (
    'computer_science', 'mechanical', 'electrical', 'civil', 
    'chemical', 'electronics', 'management', 'data_science', 
    'ai_ml', 'web_development', 'mobile_development', 'devops',
    'cybersecurity', 'cloud_computing', 'blockchain', 'iot', 'other'
);
CREATE TYPE quiz_type AS ENUM ('daily', 'practice', 'assessment', 'ai_generated');
CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard', 'expert');
CREATE TYPE hackathon_frequency AS ENUM ('weekly', 'monthly', 'special');
CREATE TYPE hackathon_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');
CREATE TYPE application_status AS ENUM (
    'submitted', 'screening', 'interview_scheduled', 
    'interviewed', 'offered', 'rejected', 'accepted', 'withdrawn'
);
CREATE TYPE interview_type AS ENUM ('technical', 'hr', 'managerial', 'final');
CREATE TYPE session_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    profile_picture TEXT,
    bio TEXT,
    location VARCHAR(255),
    
    -- Student specific fields
    education_level education_level,
    college_name VARCHAR(255),
    graduation_year INTEGER,
    
    -- Professional details
    current_position VARCHAR(255),
    company VARCHAR(255),
    years_experience INTEGER DEFAULT 0,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    resume_url TEXT,
    
    -- Gamification
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    
    -- Account status
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_graduation_year CHECK (graduation_year IS NULL OR (graduation_year >= 1950 AND graduation_year <= 2050))
);

CREATE TABLE user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    verified BOOLEAN DEFAULT FALSE,
    verified_through VARCHAR(100), -- 'hackathon', 'quiz', 'interview', 'certification'
    verification_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, skill_name)
);

CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    points_awarded INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    earned_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_name VARCHAR(255) NOT NULL,
    badge_description TEXT,
    badge_icon TEXT,
    badge_tier VARCHAR(50), -- 'bronze', 'silver', 'gold', 'platinum'
    earned_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked BOOLEAN DEFAULT FALSE
);

-- ============================================
-- LEARNING MANAGEMENT SYSTEM
-- ============================================

CREATE TABLE learning_paths (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    domain domain_category NOT NULL,
    difficulty question_difficulty NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    estimated_duration INTEGER, -- in hours
    prerequisites JSONB DEFAULT '[]',
    learning_outcomes JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    
    -- Publishing
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    
    -- Metadata
    total_enrollments INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- Authorship
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Full-text search
    search_vector tsvector
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    learning_path_id INTEGER REFERENCES learning_paths(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL,
    description TEXT,
    estimated_duration INTEGER, -- in minutes
    
    is_published BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(learning_path_id, slug)
);

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL,
    
    -- Content
    content_type VARCHAR(50) NOT NULL, -- 'text', 'video', 'interactive', 'code'
    content_markdown TEXT,
    video_url TEXT,
    video_duration INTEGER, -- in seconds
    code_examples JSONB DEFAULT '[]',
    
    -- Interactive elements
    has_quiz BOOLEAN DEFAULT FALSE,
    has_practice BOOLEAN DEFAULT FALSE,
    interactive_elements JSONB DEFAULT '[]',
    
    -- Access
    estimated_duration INTEGER, -- in minutes
    is_free BOOLEAN DEFAULT TRUE,
    
    -- Resources
    downloadable_resources JSONB DEFAULT '[]',
    external_links JSONB DEFAULT '[]',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(course_id, slug)
);

CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    time_spent INTEGER DEFAULT 0, -- in seconds
    last_position INTEGER DEFAULT 0, -- for video/scroll position
    notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE TABLE bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    notes TEXT,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE TABLE learning_path_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id INTEGER REFERENCES learning_paths(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed_at TIMESTAMP,
    UNIQUE(user_id, learning_path_id)
);

CREATE TABLE learning_path_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id INTEGER REFERENCES learning_paths(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, learning_path_id)
);

-- ============================================
-- QUIZ SYSTEM
-- ============================================

CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quiz_type quiz_type NOT NULL,
    domain domain_category NOT NULL,
    topic VARCHAR(255),
    difficulty question_difficulty,
    
    -- Timing
    time_limit INTEGER, -- in seconds, NULL for untimed
    
    -- Scoring
    total_questions INTEGER NOT NULL,
    passing_score INTEGER, -- percentage
    points_per_question INTEGER DEFAULT 1,
    
    -- Settings
    shuffle_questions BOOLEAN DEFAULT TRUE,
    shuffle_options BOOLEAN DEFAULT TRUE,
    show_correct_answers BOOLEAN DEFAULT TRUE,
    allow_review BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Scheduling (for daily quizzes)
    scheduled_date DATE,
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    
    -- Metadata
    total_attempts INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2),
    
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'code', 'fill_blank'
    
    -- Options (for multiple choice)
    options JSONB NOT NULL, -- ["option1", "option2", "option3", "option4"]
    correct_answer VARCHAR(10) NOT NULL, -- "A", "B", "C", "D" or "true"/"false"
    
    -- Explanation
    explanation TEXT,
    explanation_links JSONB DEFAULT '[]',
    
    -- Categorization
    difficulty question_difficulty NOT NULL,
    topic VARCHAR(255),
    tags JSONB DEFAULT '[]',
    
    -- Points
    points INTEGER DEFAULT 1,
    
    -- Code question specific
    code_template TEXT,
    test_cases JSONB,
    expected_output TEXT,
    
    -- AI metadata
    ai_generated BOOLEAN DEFAULT FALSE,
    generation_model VARCHAR(100),
    generation_prompt TEXT,
    
    -- Stats
    times_used INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    times_incorrect INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    
    -- Attempt details
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    -- Results
    score DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2),
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    incorrect_answers INTEGER NOT NULL,
    skipped_answers INTEGER DEFAULT 0,
    time_taken INTEGER, -- in seconds
    
    -- Answers
    user_answers JSONB NOT NULL, -- {question_id: answer}
    detailed_results JSONB, -- {question_id: {correct: bool, time_taken: int, points: int}}
    
    -- Performance metrics
    accuracy_by_topic JSONB,
    difficulty_breakdown JSONB,
    time_per_question JSONB,
    
    -- Points
    points_earned INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE leaderboards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    leaderboard_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Scores
    total_score INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    rank INTEGER,
    
    -- Stats
    quizzes_completed INTEGER DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    avg_accuracy DECIMAL(5,2),
    avg_time_per_quiz INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, leaderboard_type, period_start)
);

-- ============================================
-- HACKATHON SYSTEM
-- ============================================

CREATE TABLE hackathons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    frequency hackathon_frequency NOT NULL,
    status hackathon_status DEFAULT 'upcoming',
    
    -- Hosting
    hosted_by_type VARCHAR(50), -- 'platform', 'corporate', 'college'
    hosted_by_id INTEGER REFERENCES users(id),
    
    -- Timing
    registration_start TIMESTAMP NOT NULL,
    registration_end TIMESTAMP NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    
    -- Details
    domain domain_category,
    difficulty question_difficulty,
    tags JSONB DEFAULT '[]',
    
    -- Participation
    max_participants INTEGER,
    team_size_min INTEGER default 1,
    team_size_max INTEGER default 4,
    allow_solo BOOLEAN DEFAULT TRUE,
    
    -- Problem
    problem_statement TEXT NOT NULL,
    problem_files JSONB DEFAULT '[]', -- URLs to problem PDFs, datasets, etc.
    input_format TEXT,
    output_format TEXT,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    
    -- Evaluation
    evaluation_criteria JSONB DEFAULT '{"correctness": 40, "efficiency": 25, "code_quality": 20, "innovation": 15}',
    test_cases JSONB,
    
    -- Prizes & Recognition
    prizes JSONB DEFAULT '[]', -- [{rank: 1, prize: "₹50,000", description: ""}]
    total_prize_pool DECIMAL(12,2),
    certificates BOOLEAN DEFAULT TRUE,
    certificate_template_url TEXT,
    
    -- Branding (for corporate/college)
    logo_url TEXT,
    banner_url TEXT,
    theme_color VARCHAR(7),
    
    -- Settings
    allowed_languages JSONB DEFAULT '["python", "java", "cpp", "javascript", "c", "go", "rust"]',
    enable_cad_submission BOOLEAN DEFAULT FALSE,
    enable_video_demo BOOLEAN DEFAULT FALSE,
    enable_presentation BOOLEAN DEFAULT FALSE,
    
    -- Stats
    total_registrations INTEGER DEFAULT 0,
    total_participants INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    total_teams INTEGER DEFAULT 0,
    
    -- Visibility
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE hackathon_registrations (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    team_id INTEGER,
    registration_status VARCHAR(50) DEFAULT 'registered', -- 'registered', 'confirmed', 'withdrawn'
    registered_at TIMESTAMP DEFAULT NOW(),
    withdrawn_at TIMESTAMP,
    UNIQUE(hackathon_id, user_id)
);

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id) ON DELETE CASCADE,
    team_name VARCHAR(255) NOT NULL,
    team_leader_id INTEGER REFERENCES users(id),
    team_code VARCHAR(50) UNIQUE NOT NULL,
    max_members INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'leader', 'member'
    joined_at TIMESTAMP DEFAULT NOW(),
    left_at TIMESTAMP,
    UNIQUE(team_id, user_id)
);
