#!/bin/bash

# BlueLearnerHub Database Setup Script
# This script sets up PostgreSQL and runs migrations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  BlueLearnerHub Database Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${YELLOW}Docker is not running. Starting Docker...${NC}"
    # Try to start Docker daemon
    if command -v dockerd &> /dev/null; then
        sudo dockerd > /dev/null 2>&1 &
        sleep 5
    else
        echo -e "${RED}Please start Docker manually and run this script again${NC}"
        exit 1
    fi
fi

# Check if PostgreSQL container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^edtech_db$"; then
    echo -e "${YELLOW}PostgreSQL container already exists.${NC}"
    read -p "Do you want to remove it and start fresh? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Removing existing container...${NC}"
        docker rm -f edtech_db edtech_redis 2>/dev/null || true
    else
        echo -e "${GREEN}Keeping existing container.${NC}"
        echo -e "${GREEN}Starting existing container...${NC}"
        docker start edtech_db edtech_redis 2>/dev/null || true
        exit 0
    fi
fi

# Environment variables
DB_NAME="${DB_NAME:-edtech_platform}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-edtech_dev_password}"
DB_PORT="${DB_PORT:-5432}"

echo -e "${GREEN}Creating PostgreSQL container...${NC}"

# Create Docker network if it doesn't exist
docker network create edtech-network 2>/dev/null || true

# Run PostgreSQL container
docker run -d \
    --name edtech_db \
    --network edtech-network \
    -e POSTGRES_DB="$DB_NAME" \
    -e POSTGRES_USER="$DB_USER" \
    -e POSTGRES_PASSWORD="$DB_PASSWORD" \
    -p "${DB_PORT}:5432" \
    -v edtech_postgres_data:/var/lib/postgresql/data \
    postgres:16-alpine

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
for i in {1..30}; do
    if docker exec edtech_db pg_isready -U "$DB_USER" > /dev/null 2>&1; then
        echo -e "${GREEN}PostgreSQL is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}PostgreSQL failed to start after 30 seconds${NC}"
        exit 1
    fi
    sleep 1
done

# Run migrations
echo -e "${GREEN}Running database migrations...${NC}"
docker exec -i edtech_db psql -U "$DB_USER" -d "$DB_NAME" < ./database/migrations/001_initial_schema.sql

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Database Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Database connection details:"
echo "  Host: localhost"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "Connection string:"
echo "  postgresql://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME"
echo ""
