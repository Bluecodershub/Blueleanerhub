-- Migration: Create frontend_errors table for error reporting
-- File: 002_frontend_errors.sql

-- Create frontend_errors table
CREATE TABLE IF NOT EXISTS frontend_errors (
    id SERIAL PRIMARY KEY,
    error_id VARCHAR(100) UNIQUE NOT NULL,
    error_name VARCHAR(255) NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    component_stack TEXT,
    component_name VARCHAR(255),
    error_level VARCHAR(50) DEFAULT 'unknown' CHECK (error_level IN ('page', 'section', 'component', 'unknown')),
    url TEXT,
    user_agent TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    ip_address INET,
    session_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_frontend_errors_created_at ON frontend_errors(created_at);
CREATE INDEX IF NOT EXISTS idx_frontend_errors_error_name ON frontend_errors(error_name);
CREATE INDEX IF NOT EXISTS idx_frontend_errors_component_name ON frontend_errors(component_name);
CREATE INDEX IF NOT EXISTS idx_frontend_errors_error_level ON frontend_errors(error_level);
CREATE INDEX IF NOT EXISTS idx_frontend_errors_user_id ON frontend_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_frontend_errors_ip_address ON frontend_errors(ip_address);
CREATE INDEX IF NOT EXISTS idx_frontend_errors_error_message ON frontend_errors USING gin(to_tsvector('english', error_message));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_frontend_errors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_frontend_errors_updated_at
    BEFORE UPDATE ON frontend_errors
    FOR EACH ROW
    EXECUTE FUNCTION update_frontend_errors_updated_at();

-- Create a view for error statistics
CREATE OR REPLACE VIEW frontend_error_stats AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    error_level,
    component_name,
    error_name,
    COUNT(*) as error_count,
    COUNT(DISTINCT user_id) as affected_users,
    COUNT(DISTINCT ip_address) as affected_ips
FROM frontend_errors 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), error_level, component_name, error_name
ORDER BY hour DESC, error_count DESC;

-- Add comments for documentation
COMMENT ON TABLE frontend_errors IS 'Stores frontend application errors for monitoring and debugging';
COMMENT ON COLUMN frontend_errors.error_id IS 'Unique identifier for the error instance';
COMMENT ON COLUMN frontend_errors.error_level IS 'Severity level: page (critical), section (important), component (minor)';
COMMENT ON COLUMN frontend_errors.metadata IS 'Additional context and debugging information in JSON format';
COMMENT ON VIEW frontend_error_stats IS 'Aggregated error statistics for monitoring dashboard';

-- Create a function to clean up old errors (older than 30 days by default)
CREATE OR REPLACE FUNCTION cleanup_old_frontend_errors(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM frontend_errors 
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_frontend_errors IS 'Removes frontend error records older than specified days (default: 30 days)';

-- Insert some sample error patterns for testing (only in development)
-- This section should be removed in production
DO $$
BEGIN
    IF current_setting('server_version_num')::integer >= 120000 THEN
        -- Only insert sample data if this is not a production environment
        -- You can check for environment variables or other indicators
        INSERT INTO frontend_errors (
            error_id, error_name, error_message, error_level, 
            component_name, url, user_agent, ip_address, created_at
        ) VALUES 
        ('sample_001', 'ChunkLoadError', 'Loading chunk failed', 'component', 'LazyComponent', '/', 'Sample Browser', '127.0.0.1', NOW() - INTERVAL '1 hour'),
        ('sample_002', 'TypeError', 'Cannot read property of undefined', 'section', 'UserProfile', '/profile', 'Sample Browser', '127.0.0.1', NOW() - INTERVAL '2 hours'),
        ('sample_003', 'NetworkError', 'Failed to fetch', 'page', 'LoginPage', '/login', 'Sample Browser', '127.0.0.1', NOW() - INTERVAL '3 hours')
        ON CONFLICT (error_id) DO NOTHING;
    END IF;
END $$;