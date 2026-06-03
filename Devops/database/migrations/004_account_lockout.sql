-- Migration: Add account lockout columns
-- Purpose: Support account lockout mechanism after failed login attempts
-- Related: CRITICAL-002 and MEDIUM-002 security fixes

-- Add failed login attempts counter
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

-- Add lockout expiration timestamp
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- Add index for efficient lockout checks
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);

-- Add comment for documentation
COMMENT ON COLUMN users.failed_login_attempts IS 'Counter for failed login attempts. Resets to 0 on successful login.';
COMMENT ON COLUMN users.locked_until IS 'Timestamp until which the account is locked. NULL means not locked. Lockout triggers after 5 failed attempts for 15 minutes.';
