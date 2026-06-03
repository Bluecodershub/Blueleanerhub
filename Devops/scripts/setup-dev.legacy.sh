#!/bin/bash

# EdTech Platform Development Setup Script
# This script sets up the complete development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js v18 or later."
        exit 1
    fi
    
    if ! command_exists npm; then
        log_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    if ! command_exists docker; then
        log_warning "Docker is not installed. You'll need Docker for database services."
        DOCKER_AVAILABLE=false
    else
        DOCKER_AVAILABLE=true
    fi
    
    if ! command_exists git; then
        log_error "Git is not installed. Please install Git."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18 or later is required. Current version: $(node --version)"
        exit 1
    fi
    
    log_success "Prerequisites check passed!"
}

# Setup environment files
setup_environment() {
    log_info "Setting up environment configuration..."
    
    # Copy environment template if .env doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_success "Created .env file from template"
            log_warning "Please review and update .env file with your configuration"
        else
            log_error ".env.example not found!"
            exit 1
        fi
    else
        log_info ".env file already exists"
    fi
    
    # Create frontend environment file
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=BluelearnerHub
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
        log_success "Created frontend/.env.local"
    else
        log_info "frontend/.env.local already exists"
    fi
    
    # Create AI services environment file
    if [ ! -f "ai-services/.env" ]; then
        cat > ai-services/.env << EOF
DATABASE_URL=postgresql://edtech_user:YOUR_POSTGRES_PASSWORD_HERE@localhost:5432/edtech_platform
REDIS_URL=redis://:YOUR_REDIS_PASSWORD_HERE@localhost:6379/1
DEBUG=True
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000
EOF
        log_success "Created ai-services/.env"
    else
        log_info "ai-services/.env already exists"
    fi
}

# Install backend dependencies
install_backend() {
    log_info "Installing backend dependencies..."
    cd backend
    
    if [ ! -d "node_modules" ]; then
        npm install
        log_success "Backend dependencies installed"
    else
        log_info "Backend dependencies already installed"
        npm ci  # Clean install for consistency
    fi
    
    cd ..
}

# Install frontend dependencies
install_frontend() {
    log_info "Installing frontend dependencies..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        npm install
        log_success "Frontend dependencies installed"
    else
        log_info "Frontend dependencies already installed"
        npm ci  # Clean install for consistency
    fi
    
    cd ..
}

# Install AI services dependencies
install_ai_services() {
    log_info "Installing AI services dependencies..."
    cd ai-services
    
    # Check if Python is available
    if command_exists python3; then
        PYTHON_CMD=python3
    elif command_exists python; then
        PYTHON_CMD=python
    else
        log_error "Python is not installed. Please install Python 3.8 or later."
        cd ..
        return 1
    fi
    
    # Check Python version
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1-2)
    log_info "Found Python version: $PYTHON_VERSION"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        log_info "Creating Python virtual environment..."
        $PYTHON_CMD -m venv venv
        log_success "Virtual environment created"
    fi
    
    # Activate virtual environment and install dependencies
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install dependencies
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        log_success "AI services dependencies installed"
    else
        log_warning "requirements.txt not found in ai-services directory"
    fi
    
    deactivate
    cd ..
}

# Setup Docker services
setup_docker() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        log_info "Setting up Docker services..."
        
        # Check if docker-compose.yml exists
        if [ ! -f "docker-compose.yml" ]; then
            log_error "docker-compose.yml not found!"
            return 1
        fi
        
        # Start database services
        log_info "Starting database services with Docker..."
        docker-compose up -d postgres redis
        
        # Wait for services to be ready
        log_info "Waiting for services to be ready..."
        sleep 10
        
        # Test PostgreSQL connection
        if docker-compose exec -T postgres pg_isready -U postgres; then
            log_success "PostgreSQL is ready"
        else
            log_warning "PostgreSQL may not be ready yet"
        fi
        
        # Test Redis connection
        if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
            log_success "Redis is ready"
        else
            log_warning "Redis may not be ready yet"
        fi
    else
        log_warning "Docker not available. Please set up PostgreSQL and Redis manually."
        log_info "PostgreSQL: Create database 'edtech_platform' with user 'edtech_user'"
        log_info "Redis: Default configuration on port 6379"
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    cd backend
    
    # Check if migration files exist
    if [ -d "../database/migrations" ]; then
        log_info "Database migrations found"
        # Note: This would need a proper migration runner
        log_warning "Please run migrations manually using your preferred method"
        log_info "Migration files are in: database/migrations/"
    else
        log_warning "No migration directory found"
    fi
    
    cd ..
}

# Build projects
build_projects() {
    log_info "Building projects..."
    
    # Build backend
    log_info "Building backend..."
    cd backend
    npm run build
    log_success "Backend built successfully"
    cd ..
    
    # Build frontend
    log_info "Building frontend..."
    cd frontend
    npm run build
    log_success "Frontend built successfully"
    cd ..
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Backend tests
    log_info "Running backend tests..."
    cd backend
    npm test
    cd ..
    
    # Frontend tests
    log_info "Running frontend tests..."
    cd frontend
    npm test -- --watchAll=false
    cd ..
    
    log_success "All tests completed"
}

# Create development scripts
create_dev_scripts() {
    log_info "Creating development scripts..."
    
    # Create start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash
# Start all development servers

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Starting EdTech Platform Development Environment${NC}"

# Start Docker services
if command -v docker-compose >/dev/null 2>&1; then
    echo "Starting Docker services..."
    docker-compose up -d postgres redis
fi

# Start services in parallel
echo "Starting all services..."

# Backend
(cd backend && npm run dev) &

# Frontend  
(cd frontend && npm run dev) &

# AI Services
(cd ai-services && source venv/bin/activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) &

echo "All services started!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo "AI Services: http://localhost:8000"

wait
EOF

    chmod +x start-dev.sh
    
    # Create stop script
    cat > stop-dev.sh << 'EOF'
#!/bin/bash
# Stop all development servers

echo "Stopping all development services..."

# Kill Node.js processes
pkill -f "npm run dev"
pkill -f "next dev"
pkill -f "ts-node-dev"

# Kill Python processes  
pkill -f "uvicorn"

# Stop Docker services
if command -v docker-compose >/dev/null 2>&1; then
    docker-compose down
fi

echo "All services stopped!"
EOF

    chmod +x stop-dev.sh
    
    log_success "Development scripts created (start-dev.sh, stop-dev.sh)"
}

# Main setup function
main() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "     EdTech Platform Development Setup"
    echo "=================================================="
    echo -e "${NC}"
    
    check_prerequisites
    setup_environment
    install_backend
    install_frontend
    install_ai_services
    setup_docker
    run_migrations
    create_dev_scripts
    
    echo -e "${GREEN}"
    echo "=================================================="
    echo "          Setup Complete! 🎉"
    echo "=================================================="
    echo -e "${NC}"
    echo
    echo "Next steps:"
    echo "1. Review and update .env files with your configuration"
    echo "2. Run database migrations if needed"
    echo "3. Start development environment: ./start-dev.sh"
    echo
    echo "Services will be available at:"
    echo "- Frontend: http://localhost:3000"
    echo "- Backend API: http://localhost:5000"  
    echo "- AI Services: http://localhost:8000"
    echo "- API Docs: http://localhost:5000/api/docs (if available)"
    echo
    echo "To stop all services: ./stop-dev.sh"
    echo
    log_success "Happy coding! 🚀"
}

# Run main function
main "$@"