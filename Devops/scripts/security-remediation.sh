#!/bin/bash

# 🔐 EdTech Platform Security Remediation Script
# This script helps fix critical security vulnerabilities
# Run this with appropriate permissions: sudo ./security-remediation.sh

set -e  # Exit on error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
EXPOSED_GEMINI_KEY_PATTERN="YOUR_EXPOSED_GEMINI_KEY_HERE"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  EdTech Platform Security Remediation      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Phase 1: Remove Exposed Secrets
echo -e "${YELLOW}[Phase 1] Removing Exposed Secrets...${NC}"
echo ""

echo "⚠️  WARNING: Make sure you have revoked the exposed API keys in Google Cloud Console first!"
echo "URL: https://console.cloud.google.com/apis/credentials"
echo ""
read -p "Have you revoked the exposed keys? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Please revoke the keys first before continuing${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Proceeding with secret removal...${NC}"
echo ""

# Remove hardcoded secrets from Python files
echo "Removing hardcoded secrets from Python files..."

declare -a PYTHON_FILES=(
    "ai-services/app/config.py"
    "ai-services/app/services/quiz_generator.py"
    "ai-services/app/training/generate_training_data.py"
    "ai-services/demo_training_generation.py"
)

for file in "${PYTHON_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  Processing: $file"
        # Replace hardcoded API key with environment variable reference
        sed -i "s/${EXPOSED_GEMINI_KEY_PATTERN}/YOUR_GEMINI_API_KEY/g" "$file"
        sed -i "s/\"${EXPOSED_GEMINI_KEY_PATTERN}\"/\"\"/g" "$file"
    fi
done

echo -e "${GREEN}✓ Python files cleaned${NC}"

# Phase 2: Update Environment Files
echo ""
echo -e "${YELLOW}[Phase 2] Creating Secure Environment Files...${NC}"
echo ""

# Generate secure random passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

echo "Generating new secure credentials..."
echo "📝 Save these credentials securely (password manager):"
echo ""
echo -e "${BLUE}PostgreSQL Password: ${GREEN}$POSTGRES_PASSWORD${NC}"
echo -e "${BLUE}Redis Password: ${GREEN}$REDIS_PASSWORD${NC}"
echo -e "${BLUE}JWT Secret: ${GREEN}$JWT_SECRET${NC}"
echo ""

# Create safe .env.example files
echo ".env files should follow the .env.example pattern."
echo "Update the following with actual values:"
echo ""
echo "1. backend/.env"
echo "2. ai-services/.env"
echo "3. frontend/.env.local"
echo ""

# Phase 3: Git History Cleanup
echo -e "${YELLOW}[Phase 3] Cleaning Git History...${NC}"
echo ""

if [ -d ".git" ]; then
    echo "⚠️  Cleaning Git history of secrets..."
    echo "This is important because exposed keys might be in commit history"
    echo ""
    
    # Check if bfg-repo-cleaner is available
    if command -v bfg &> /dev/null; then
        echo "Found bfg-repo-cleaner. Using it to remove secrets..."
        echo ""
        echo "To remove secrets from history, run:"
        echo "  bfg --delete-files .env --delete-files '*/.env(.example)?' ."
        echo "  git reflog expire --expire=now --all && git gc --prune=now --aggressive"
        echo "  git push --force-with-lease"
        echo ""
    else
        echo "For comprehensive history cleanup, install bfg-repo-cleaner:"
        echo "  brew install bfg (macOS)"
        echo "  apt-get install bfg (Linux)"
        echo ""
    fi
    
    # Scan history for patterns
    echo "Scanning Git history for patterns..."
    if grep -r "$EXPOSED_GEMINI_KEY_PATTERN" .git/objects 2>/dev/null | grep -q .; then
        echo -e "${RED}⚠️  Exposed API key found in Git history!${NC}"
        echo "Run history cleanup commands above"
    else
        echo -e "${GREEN}✓ No obvious secrets in current Git history${NC}"
    fi
fi

echo ""

# Phase 4: .gitignore Update
echo -e "${YELLOW}[Phase 4] Updating .gitignore...${NC}"
echo ""

# Create/update .gitignore with secure patterns
cat > .gitignore.secure << 'EOF'
# Environment variables - NEVER commit
.env
.env.local
.env.*.local
.env.production.local
.env.test.local

# API Keys and Credentials
.env*.example  # Only templates, actual examples should have placeholders
*.key
*.pem
.aws/credentials
.ssh/

# Build outputs
dist/
build/
.next/
*.egg-info/
__pycache__/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
.coverage
.jest_cache/
.pytest_cache/

# OS
node_modules/
.DS_Store
Thumbs.db
EOF

# Compare with existing .gitignore
if [ -f ".gitignore" ]; then
    echo "Comparing with existing .gitignore..."
    if grep -q "\.env" .gitignore; then
        echo -e "${GREEN}✓ .gitignore already has .env patterns${NC}"
    else
        echo -e "${YELLOW}⚠️  Adding .env patterns to .gitignore${NC}"
        cat .gitignore.secure >> .gitignore
    fi
else
    echo "Creating new .gitignore"
    cp .gitignore.secure .gitignore
fi

rm .gitignore.secure

echo -e "${GREEN}✓ .gitignore updated${NC}"
echo ""

# Phase 5: Security Configuration Files
echo -e "${YELLOW}[Phase 5] Creating Security Configuration Files...${NC}"
echo ""

# Create secure environment template
mkdir -p ./security
cat > ./security/environment.template.sh << 'EOF'
#!/bin/bash
# EdTech Platform Environment Configuration Template
# Copy and customize this file with your actual values
# NEVER commit this file with real values

# Database Configuration
export POSTGRES_USER="edtech_user"
export POSTGRES_PASSWORD="YOUR_SECURE_PASSWORD_HERE"
export DATABASE_URL="postgresql://edtech_user:YOUR_PASSWORD@database-host:5432/edtech_db"

# Redis Configuration
export REDIS_PASSWORD="YOUR_SECURE_PASSWORD_HERE"
export REDIS_URL="redis://:YOUR_PASSWORD@redis-host:6379"

# JWT Secrets
export JWT_SECRET="YOUR_SECURE_JWT_SECRET_HERE"
export JWT_REFRESH_SECRET="YOUR_SECURE_JWT_REFRESH_SECRET_HERE"

# API Keys (Sensitive)
# DO NOT share these keys
# Restrict these keys in their respective cloud consoles
export GEMINI_API_KEY="YOUR_ACTUAL_API_KEY"
export SENDGRID_API_KEY="YOUR_ACTUAL_API_KEY"

# AWS Credentials (if using AWS)
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_KEY"
export AWS_REGION="us-east-1"

# Service URLs
export FRONTEND_URL="https://yourdomain.com"
export BACKEND_URL="https://api.yourdomain.com"
export AI_SERVICES_URL="https://ai.yourdomain.com"

# Environment
export NODE_ENV="production"
export DEBUG="false"

# Security
export CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
export SESSION_SECRET="YOUR_SECURE_SESSION_SECRET"

# Email Configuration
export MAIL_FROM="noreply@yourdomain.com"
export MAIL_HOST="smtp.yourdomain.com"
export MAIL_PORT="587"
export MAIL_USER="your-email@yourdomain.com"
export MAIL_PASS="your-email-password"

# Logging
export LOG_LEVEL="info"
export LOG_FILE="/var/log/edtech/app.log"

# Rate Limiting
export RATE_LIMIT_WINDOW_MS="900000"
export RATE_LIMIT_MAX_REQUESTS="100"

# File Upload
export MAX_FILE_SIZE="10485760"  # 10MB
export UPLOAD_DIR="/var/uploads"

# Bcrypt Configuration
export BCRYPT_ROUNDS="12"

EOF

chmod 600 ./security/environment.template.sh
echo -e "${GREEN}✓ Created security/environment.template.sh${NC}"
echo ""

# Phase 6: Database Password Update
echo -e "${YELLOW}[Phase 6] Database Security Update Instructions...${NC}"
echo ""
echo "To update PostgreSQL password, run:"
echo ""
echo "  psql -U postgres -d edtech_db"
echo "  ALTER USER edtech_user WITH PASSWORD 'NEW_SECURE_PASSWORD';"
echo "  \\q"
echo ""
echo "Then update DATABASE_URL in your environment variables"
echo ""

# Phase 7: Verification
echo -e "${YELLOW}[Phase 7] Security Check...${NC}"
echo ""

ISSUES=0

# Check for remaining exposed keys
if grep -r "$EXPOSED_GEMINI_KEY_PATTERN" --include="*.ts" --include="*.js" --include="*.py" . 2>/dev/null | grep -v node_modules | grep -v ".git"; then
    echo -e "${RED}❌ Exposed API keys still found in source code${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓ No exposed API keys in source code${NC}"
fi

# Check for SecurePassword in source
if grep -r "SecurePassword123" --include="*.ts" --include="*.js" --include="*.py" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v ".env.example"; then
    echo -e "${RED}❌ Hardcoded passwords still found${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓ No hardcoded passwords in source${NC}"
fi

# Check .gitignore
if grep -q "\.env" .gitignore; then
    echo -e "${GREEN}✓ .env properly configured in .gitignore${NC}"
else
    echo -e "${RED}❌ .env not in .gitignore${NC}"
    ISSUES=$((ISSUES + 1))
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════${NC}"

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ Security remediation complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Update environment variables with new credentials"
    echo "  2. Rotate database passwords in production"
    echo "  3. Redeploy services with new environment variables"
    echo "  4. Monitor for any anomalous activity"
    echo "  5. Review the full SECURITY_AUDIT_REPORT.md"
else
    echo -e "${RED}❌ Found $ISSUES security issues that need attention${NC}"
fi

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""
