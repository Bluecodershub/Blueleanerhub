-- AI Training Data Management System
-- Database schema for storing quiz and hackathon questions for AI model training
--
-- NOTE: Comments starting with # are NOT valid SQL in PostgreSQL.
-- They have been converted to SQL-standard -- comments.

-- ==============================================================================
-- QUIZ QUESTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'true_false', 'fill_blank', 'coding'
    topic VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'programming', 'data_science', 'algorithms', 'web_dev', etc.
    difficulty_level VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'expert'
    correct_answer TEXT NOT NULL,
    wrong_answers JSONB, -- Array of incorrect options for multiple choice
    explanation TEXT,
    tags JSONB, -- Array of tags like ['python', 'loops', 'beginner']
    source VARCHAR(100), -- 'generated', 'imported', 'curated'
    language VARCHAR(20) DEFAULT 'english',
    estimated_time_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    training_weight FLOAT DEFAULT 1.0, -- Weight for training importance
    validation_split VARCHAR(20) DEFAULT 'train' -- 'train', 'validation', 'test'
);

-- ==============================================================================
-- HACKATHON QUESTIONS TABLE  
-- ==============================================================================
CREATE TABLE IF NOT EXISTS hackathon_questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'web_app', 'mobile_app', 'ai_ml', 'blockchain', etc.
    difficulty_level VARCHAR(20) NOT NULL,
    tech_stack JSONB, -- Array of technologies ['react', 'node.js', 'mongodb']
    requirements JSONB, -- Array of specific requirements
    evaluation_criteria JSONB, -- Judging criteria with weights
    estimated_hours INTEGER,
    max_team_size INTEGER DEFAULT 4,
    sample_solution TEXT, -- Optional sample solution or approach
    test_cases JSONB, -- Input/output test cases if applicable  
    resources JSONB, -- Helpful links, APIs, datasets
    tags JSONB, -- Array of tags
    source VARCHAR(100),
    language VARCHAR(20) DEFAULT 'english',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    training_weight FLOAT DEFAULT 1.0,
    validation_split VARCHAR(20) DEFAULT 'train'
);

-- ==============================================================================
-- QUESTION CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS question_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_category_id INTEGER REFERENCES question_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- TRAINING DATASETS TABLE
-- ==============================================================================  
CREATE TABLE IF NOT EXISTS training_datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    dataset_type VARCHAR(50) NOT NULL, -- 'quiz', 'hackathon', 'mixed'
    total_questions INTEGER,
    train_split_percentage FLOAT DEFAULT 0.8,
    validation_split_percentage FLOAT DEFAULT 0.1,
    test_split_percentage FLOAT DEFAULT 0.1,
    export_format VARCHAR(20) DEFAULT 'jsonl', -- 'jsonl', 'csv', 'parquet'
    file_path TEXT, -- Where exported dataset is stored
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'generating', 'completed', 'error'
);

-- ==============================================================================
-- INDICES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic ON quiz_questions(topic);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_validation_split ON quiz_questions(validation_split);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_active ON quiz_questions(is_active);

CREATE INDEX IF NOT EXISTS idx_hackathon_questions_category ON hackathon_questions(category);
CREATE INDEX IF NOT EXISTS idx_hackathon_questions_difficulty ON hackathon_questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_hackathon_questions_validation_split ON hackathon_questions(validation_split);
CREATE INDEX IF NOT EXISTS idx_hackathon_questions_active ON hackathon_questions(is_active);

-- ==============================================================================
-- INITIAL CATEGORIES DATA
-- ==============================================================================
INSERT INTO question_categories (name, description) VALUES
('Programming Fundamentals', 'Basic programming concepts, variables, data types'),
('Data Structures', 'Arrays, linked lists, stacks, queues, trees, graphs'),
('Algorithms', 'Sorting, searching, dynamic programming, recursion'),
('Web Development', 'Frontend, backend, APIs, databases'),
('Mobile Development', 'iOS, Android, React Native, Flutter'), 
('Data Science', 'Statistics, machine learning, data analysis'),
('Artificial Intelligence', 'ML algorithms, neural networks, NLP'),
('Cybersecurity', 'Security principles, cryptography, ethical hacking'),
('Cloud Computing', 'AWS, Azure, GCP, DevOps'),
('Database Systems', 'SQL, NoSQL, database design'),
('Software Engineering', 'Design patterns, architecture, testing'),
('System Design', 'Scalability, microservices, distributed systems'),
('Competitive Programming', 'Contest problems, optimization'),
('Game Development', 'Unity, Unreal, game mechanics'),
('Blockchain', 'Cryptocurrency, smart contracts, DeFi')
ON CONFLICT (name) DO NOTHING;