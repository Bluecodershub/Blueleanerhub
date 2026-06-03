#!/bin/bash

# BlueLearnerHub Full Setup Script
# This script sets up the entire development environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  BlueLearnerHub Full Setup${NC}"
echo -e "${BLUE}========================================${NC}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}Node.js version: $(node --version)${NC}"

# Check npm
echo -e "${YELLOW}Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}npm version: $(npm --version)${NC}"

# Setup Database
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Step 1: Database Setup${NC}"
echo -e "${YELLOW}========================================${NC}"

if command -v docker &> /dev/null && docker info &> /dev/null; then
    chmod +x "$SCRIPT_DIR/setup-database.sh"
    bash "$SCRIPT_DIR/setup-database.sh"
else
    echo -e "${YELLOW}Docker not available. Please setup PostgreSQL manually.${NC}"
fi

# Create .env file for backend
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Step 2: Environment Setup${NC}"
echo -e "${YELLOW}========================================${NC}"

if [ -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${YELLOW}Backend .env already exists. Skipping...${NC}"
else
    echo -e "${GREEN}Creating backend .env file...${NC}"
    cat > "$PROJECT_ROOT/backend/.env" << 'EOF'
# Server
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://postgres:${DB_PASSWORD:-edtech_dev_password}@localhost:5432/edtech_platform
DB_HOST=localhost
DB_PORT=5432
DB_NAME=edtech_platform
DB_USER=postgres
DB_PASSWORD=${DB_PASSWORD:-edtech_dev_password}
DB_MAX_CONNECTIONS=20

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD:-edtech_dev_redis_password}
REDIS_DB=0

# Security
JWT_SECRET=${JWT_SECRET:-dev_jwt_secret_min_32_chars_long_XXXX}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-dev_refresh_secret_min_32_chars_XXXX}
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FRONTEND_URL=http://localhost:3000

# External Services (optional for MVP)
# GEMINI_API_KEY=your_gemini_api_key
# JUDGE0_API_KEY=your_judge0_api_key
# STRIPE_SECRET_KEY=your_stripe_secret_key

# Logging
LOG_LEVEL=info
DEBUG=true
EOF
    echo -e "${GREEN}Backend .env created!${NC}"
fi

# Create .env.local for frontend
if [ -f "$PROJECT_ROOT/frontend/.env.local" ]; then
    echo -e "${YELLOW}Frontend .env.local already exists. Skipping...${NC}"
else
    echo -e "${GREEN}Creating frontend .env.local file...${NC}"
    cat > "$PROJECT_ROOT/frontend/.env.local" << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000

# Application
NEXT_PUBLIC_APP_NAME=BlueLearnerHub
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_COMPANION=true
EOF
    echo -e "${GREEN}Frontend .env.local created!${NC}"
fi

# Install dependencies
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Step 3: Installing Dependencies${NC}"
echo -e "${YELLOW}========================================${NC}"

echo -e "${GREEN}Installing root dependencies...${NC}"
npm install

echo -e "${GREEN}Installing backend dependencies...${NC}"
cd "$PROJECT_ROOT/backend"
npm install

echo -e "${GREEN}Installing frontend dependencies...${NC}"
cd "$PROJECT_ROOT/frontend"
npm install

# Go back to project root
cd "$PROJECT_ROOT"

# Build backend
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Step 4: Building Backend${NC}"
echo -e "${YELLOW}========================================${NC}"
cd "$PROJECT_ROOT/backend"
npm run build

# Build frontend
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Step 5: Building Frontend${NC}"
echo -e "${YELLOW}========================================${NC}"
cd "$PROJECT_ROOT/frontend"
npm run build

# Go back to project root
cd "$PROJECT_ROOT"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}To start the development servers:${NC}"
echo ""
echo -e "  Option 1 - All services:"
echo -e "    ${GREEN}npm run dev${NC}"
echo ""
echo -e "  Option 2 - Individual services:"
echo -e "    ${GREEN}npm run dev:backend${NC}  # Start backend on port 5000"
echo -e "    ${GREEN}npm run dev:frontend${NC} # Start frontend on port 3000"
echo ""
echo -e "${BLUE}Access the application:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:5000${NC}"
echo -e "  API Docs: ${GREEN}http://localhost:5000/api/health${NC}"
echo ""
