# BlueLearnerHub Database Setup Script (Windows)
# Run this in PowerShell as Administrator

param(
    [string]$DbName = "edtech_platform",
    [string]$DbUser = "postgres",
    [string]$DbPassword = "edtech_dev_password",
    [string]$DbPort = "5432"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  BlueLearnerHub Database Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if Docker is installed
Write-Host "`nChecking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if (-not $dockerVersion) {
        throw "Docker not found"
    }
    Write-Host "Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not installed or not running" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://docs.docker.com/get-docker/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
Write-Host "`nChecking Docker daemon..." -ForegroundColor Yellow
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker daemon not running"
    }
    Write-Host "Docker daemon is running" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if container exists
Write-Host "`nChecking for existing containers..." -ForegroundColor Yellow
$existingDb = docker ps -a --format '{{.Names}}' | Where-Object { $_ -eq "edtech_db" }
$existingRedis = docker ps -a --format '{{.Names}}' | Where-Object { $_ -eq "edtech_redis" }

if ($existingDb) {
    Write-Host "PostgreSQL container already exists." -ForegroundColor Yellow
    $response = Read-Host "Do you want to remove it and start fresh? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Removing existing containers..." -ForegroundColor Yellow
        docker rm -f edtech_db edtech_redis 2>$null
        Write-Host "Containers removed." -ForegroundColor Green
    } else {
        Write-Host "Keeping existing containers. Starting them..." -ForegroundColor Green
        docker start edtech_db edtech_redis 2>$null
        Write-Host "Setup complete!" -ForegroundColor Green
        exit 0
    }
}

# Create Docker network
Write-Host "`nCreating Docker network..." -ForegroundColor Yellow
docker network create edtech-network 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Network created." -ForegroundColor Green
} else {
    Write-Host "Network already exists or could not be created." -ForegroundColor Yellow
}

# Run PostgreSQL container
Write-Host "`nCreating PostgreSQL container..." -ForegroundColor Yellow
docker run -d `
    --name edtech_db `
    --network edtech-network `
    -e POSTGRES_DB="$DbName" `
    -e POSTGRES_USER="$DbUser" `
    -e POSTGRES_PASSWORD="$DbPassword" `
    -p "${DbPort}:5432" `
    -v edtech_postgres_data:/var/lib/postgresql/data `
    postgres:16-alpine

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to create PostgreSQL container" -ForegroundColor Red
    exit 1
}
Write-Host "PostgreSQL container created." -ForegroundColor Green

# Wait for PostgreSQL to be ready
Write-Host "`nWaiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
while ($attempt -lt $maxAttempts) {
    $result = docker exec edtech_db pg_isready -U "$DbUser" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL is ready!" -ForegroundColor Green
        break
    }
    $attempt++
    if ($attempt -ge $maxAttempts) {
        Write-Host "Error: PostgreSQL failed to start after $maxAttempts seconds" -ForegroundColor Red
        exit 1
    }
    Start-Sleep -Seconds 1
}

# Run migrations
Write-Host "`nRunning database migrations..." -ForegroundColor Yellow
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$migrationFile = Join-Path $scriptDir "..\database\migrations\001_initial_schema.sql"

if (Test-Path $migrationFile) {
    docker exec -i edtech_db psql -U "$DbUser" -d "$DbName" < $migrationFile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migrations completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Warning: Migration may have encountered issues" -ForegroundColor Yellow
    }
} else {
    Write-Host "Warning: Migration file not found at $migrationFile" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Database Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Database connection details:" -ForegroundColor Cyan
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: $DbPort" -ForegroundColor White
Write-Host "  Database: $DbName" -ForegroundColor White
Write-Host "  User: $DbUser" -ForegroundColor White
Write-Host "  Password: $DbPassword" -ForegroundColor White
Write-Host ""
Write-Host "Connection string:" -ForegroundColor Cyan
Write-Host "  postgresql://${DbUser}:${DbPassword}@localhost:${DbPort}/${DbName}" -ForegroundColor White
Write-Host ""
