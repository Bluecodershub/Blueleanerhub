# BlueLearnerHub Setup Scripts

This folder contains scripts to set up and test the BlueLearnerHub development environment.

Repository-wide operational scripts should live here rather than in the repository root.

## Scripts Overview

### 1. `setup-database.sh` / `setup-database.ps1`

**Purpose**: Sets up PostgreSQL database using Docker.

**Usage (Linux/Mac)**:
```bash
./setup-database.sh
```

**Usage (Windows)**:
```powershell
.\setup-database.ps1
```

**What it does**:
- Creates PostgreSQL container with Docker
- Runs the initial migration (`001_initial_schema.sql`)
- Creates sample data (test users and hackathons)

---

### 2. `setup-dev.sh`

**Purpose**: Full development environment setup.

**Usage**:
```bash
./setup-dev.sh
```

**What it does**:
- Checks prerequisites (Node.js, npm, Docker)
- Sets up database (if Docker available)
- Creates `.env` files for backend and frontend
- Installs all dependencies
- Builds both backend and frontend

---

### 3. `test-api.sh`

**Purpose**: Quick API endpoint testing.

**Usage**:
```bash
./test-api.sh
```

**What it does**:
- Tests health endpoint
- Tests hackathons listing
- Tests user registration
- Tests login flow

---

### 4. `security-remediation.sh`

**Purpose**: Security cleanup and verification workflow for exposed secrets and unsafe defaults.

**Usage**:
```bash
./security-remediation.sh
```

**What it does**:
- Scans for hardcoded secrets
- Generates secure replacement guidance
- Verifies `.gitignore` coverage for sensitive files
- Produces follow-up remediation steps

---

### 5. `sync_to_github.bat`

**Purpose**: Windows convenience script for add/commit/push workflows.

**Usage**:
```bat
sync_to_github.bat
```

Use this carefully. The commit message is hardcoded and may not be appropriate for current changes.

---

### 6. `setup-dev.legacy.sh`

**Purpose**: Older all-in-one development bootstrap retained for reference.

Prefer `setup-dev.sh` for the current repository structure.

---

## Prerequisites

### For Database Setup (Docker)
- Docker installed and running
- Docker daemon accessible

### For Full Setup
- Node.js 18+
- npm 8+
- Docker (for database)

---

## Quick Start

### Option 1: Full Setup (Recommended)
```bash
# Run full setup
./setup-dev.sh

# Start development servers
npm run dev
```

### Option 2: Database Only
```bash
# Setup database
./setup-database.sh

# Start backend only
npm run dev:backend

# Start frontend only  
npm run dev:frontend
```

### Option 3: Test Only
```bash
# Make sure backend is running first
npm run dev:backend

# In another terminal, run tests
./test-api.sh
```

---

## Database Connection Details

After setup, the database will be available at:

```
Host: localhost
Port: 5432
Database: edtech_platform
User: postgres
Password: <set via DB_PASSWORD env var (default: edtech_dev_password)>
```

Connection string:
```
postgresql://postgres:${DB_PASSWORD}@localhost:5432/edtech_platform
```

---

## Troubleshooting

### Docker not running
```bash
# Linux
sudo systemctl start docker

# macOS
open -a Docker

# Windows
Start Docker Desktop
```

### Port already in use
```bash
# Check what's using port 5432
lsof -i :5432  # Linux/Mac
netstat -an | grep 5432  # Windows
```

### Database connection refused
```bash
# Restart the database container
docker restart edtech_db

# Check container logs
docker logs edtech_db
```

---

## Environment Variables

You can customize the setup with environment variables:

```bash
# Custom database settings
DB_NAME=edtech_platform
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_PORT=5432

# Run with custom settings
DB_PASSWORD=mysecret ./setup-database.sh
```
