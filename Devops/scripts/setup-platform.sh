#!/bin/bash

# BluelearnerHub Platform Setup Script
# This script sets up the platform for deployment on any hosting service

set -e

echo "🚀 BluelearnerHub Platform Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Detect platform
detect_platform() {
    if [ -n "$VERCEL" ]; then
        echo "vercel"
    elif [ -n "$RAILWAY_ENVIRONMENT" ]; then
        echo "railway"
    elif [ -n "$AWS_REGION" ]; then
        echo "aws"
    elif [ -n "$HEROKU_APP_NAME" ]; then
        echo "heroku"
    elif [ -n "$NETLIFY" ]; then
        echo "netlify"
    elif [ -n "$RENDER" ]; then
        echo "render"
    else
        echo "generic"
    fi
}

PLATFORM=$(detect_platform)
print_info "Detected platform: $PLATFORM"

# Check Node.js version
check_node() {
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version | sed 's/v//')
        REQUIRED_VERSION="18.0.0"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
            print_error "Node.js $REQUIRED_VERSION or higher required. Current: $NODE_VERSION"
            exit 1
        else
            print_status "Node.js version: $NODE_VERSION"
        fi
    else
        print_error "Node.js not found. Please install Node.js 18 or higher."
        exit 1
    fi
}

# Check Python for AI services
check_python() {
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_VERSION=$(python3 --version | awk '{print $2}')
        print_status "Python version: $PYTHON_VERSION"
    else
        print_warning "Python3 not found. AI services may not work."
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    case $PLATFORM in
        "vercel")
            # Vercel only needs frontend
            cd frontend && npm ci --production=false
            ;;
        "railway"|"heroku"|"render")
            # Full stack platforms
            npm run setup:prod
            ;;
        "aws")
            # AWS needs all for Docker builds
            npm run setup:prod
            ;;
        *)
            # Generic installation
            npm run setup
            ;;
    esac
    
    print_status "Dependencies installed"
}

# Setup environment variables
setup_env() {
    print_info "Setting up environment variables..."
    
    # Create .env files from examples if they don't exist
    if [ ! -f "backend/.env" ] && [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        print_warning "Created backend/.env from example. Please configure with your values."
    fi
    
    if [ ! -f "frontend/.env.local" ] && [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env.local
        print_warning "Created frontend/.env.local from example. Please configure with your values."
    fi
    
    if [ ! -f "ai-services/.env" ] && [ -f "ai-services/.env.example" ]; then
        cp ai-services/.env.example ai-services/.env
        print_warning "Created ai-services/.env from example. Please configure with your values."
    fi
}

# Build application
build_app() {
    print_info "Building application for platform: $PLATFORM"
    
    case $PLATFORM in
        "vercel")
            cd frontend && npm run build
            ;;
        "railway"|"heroku"|"render")
            npm run build:all
            ;;
        "aws")
            npm run build:all
            docker-compose -f docker-compose.prod.yml build
            ;;
        *)
            npm run build:all
            ;;
    esac
    
    print_status "Build completed"
}

# Platform-specific optimizations
platform_optimizations() {
    case $PLATFORM in
        "vercel")
            print_info "Applying Vercel optimizations..."
            export BUILD_STANDALONE=false
            ;;
        "railway")
            print_info "Applying Railway optimizations..."
            # Railway handles this automatically with railway.json
            ;;
        "aws")
            print_info "Applying AWS optimizations..."
            export BUILD_STANDALONE=true
            ;;
        "heroku")
            print_info "Applying Heroku optimizations..."
            # Set BUILD_STANDALONE for better Heroku performance
            export BUILD_STANDALONE=false
            ;;
        *)
            print_info "Applying generic optimizations..."
            ;;
    esac
}

# Database setup
setup_database() {
    if [ -n "$DATABASE_URL" ]; then
        print_info "Running database migrations..."
        npm run db:migrate || print_warning "Database migration failed or not needed"
    else
        print_warning "DATABASE_URL not set. Skipping database setup."
    fi
}

# Health check
health_check() {
    print_info "Performing health check..."
    
    # Check if required environment variables are set
    REQUIRED_VARS=()
    
    case $PLATFORM in
        "vercel")
            REQUIRED_VARS=("NEXT_PUBLIC_API_URL" "NEXTAUTH_SECRET")
            ;;
        *)
            REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "NEXTAUTH_SECRET")
            ;;
    esac
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            print_warning "Environment variable $var is not set"
        else
            print_status "Environment variable $var is configured"
        fi
    done
}

# Main execution
main() {
    print_info "Starting BluelearnerHub setup for $PLATFORM platform..."
    
    check_node
    check_python
    setup_env
    platform_optimizations
    install_dependencies
    build_app
    setup_database
    health_check
    
    echo ""
    print_status "Setup completed successfully!"
    
    case $PLATFORM in
        "vercel")
            echo -e "${GREEN}Next steps:${NC}"
            echo "1. Configure environment variables in Vercel dashboard"
            echo "2. Deploy: vercel --prod"
            ;;
        "railway")
            echo -e "${GREEN}Next steps:${NC}"
            echo "1. Configure environment variables in Railway dashboard"
            echo "2. Deploy: railway up"
            ;;
        "aws")
            echo -e "${GREEN}Next steps:${NC}"
            echo "1. Configure AWS credentials"
            echo "2. Deploy: ./aws/deploy.sh"
            ;;
        *)
            echo -e "${GREEN}Next steps:${NC}"
            echo "1. Configure environment variables"
            echo "2. Start services: npm run start"
            ;;
    esac
    
    echo ""
    print_info "Platform is ready for deployment! 🎉"
}

# Run main function
main "$@"