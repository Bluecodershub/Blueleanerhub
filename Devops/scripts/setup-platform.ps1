# BluelearnerHub Platform Setup Script (PowerShell)
# This script sets up the platform for deployment on any hosting service

param(
    [string]$Platform = "auto"
)

$ErrorActionPreference = "Continue"

Write-Host "🚀 BluelearnerHub Platform Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Function to print colored output
function Write-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

# Detect platform
function Get-DeploymentPlatform {
    if ($env:VERCEL) { return "vercel" }
    if ($env:RAILWAY_ENVIRONMENT) { return "railway" }
    if ($env:AWS_REGION) { return "aws" }
    if ($env:HEROKU_APP_NAME) { return "heroku" }
    if ($env:NETLIFY) { return "netlify" }
    if ($env:RENDER) { return "render" }
    return "generic"
}

$DetectedPlatform = if ($Platform -eq "auto") { Get-DeploymentPlatform } else { $Platform }
Write-Info "Platform: $DetectedPlatform"

# Check Node.js version
function Test-NodeVersion {
    try {
        $NodeVersion = & node --version 2>$null
        if ($NodeVersion -match "v(\d+)\.(\d+)\.(\d+)") {
            $Major = [int]$Matches[1]
            [void][int]$Matches[2]  # Minor version (for completeness)
            [void][int]$Matches[3]  # Patch version (for completeness)
            if ($Major -ge 18) {
                Write-Success "Node.js version: $NodeVersion"
                return $true
            } else {
                Write-Error "Node.js 18 or higher required. Current: $NodeVersion"
                return $false
            }
        }
    } catch {
        Write-Error "Node.js not found. Please install Node.js 18 or higher."
        return $false
    }
}

# Check Python for AI services
function Test-PythonVersion {
    try {
        $PythonVersion = & python --version 2>$null
        if ($PythonVersion) {
            Write-Success "Python version: $PythonVersion"
        } else {
            $Python3Version = & python3 --version 2>$null
            if ($Python3Version) {
                Write-Success "Python version: $Python3Version"
            }
        }
    } catch {
        Write-Warning "Python not found. AI services may not work."
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Info "Installing dependencies..."
    
    try {
        switch ($DetectedPlatform) {
            "vercel" {
                # Vercel only needs frontend
                Set-Location frontend
                & npm ci --production=false
                Set-Location ..
            }
            { $_ -in @("railway", "heroku", "render") } {
                # Full stack platforms
                & npm run setup:prod
            }
            "aws" {
                # AWS needs all for Docker builds
                & npm run setup:prod
            }
            default {
                # Generic installation
                & npm run setup
            }
        }
        Write-Success "Dependencies installed"
        return $true
    } catch {
        Write-Error "Failed to install dependencies: $_"
        return $false
    }
}

# Setup environment variables
function Set-EnvironmentFiles {
    Write-Info "Setting up environment variables..."
    
    $EnvFiles = @(
        @{ Example = "backend\.env.example"; Target = "backend\.env" },
        @{ Example = "frontend\.env.example"; Target = "frontend\.env.local" },
        @{ Example = "ai-services\.env.example"; Target = "ai-services\.env" }
    )
    
    foreach ($EnvFile in $EnvFiles) {
        if ((Test-Path $EnvFile.Example) -and -not (Test-Path $EnvFile.Target)) {
            Copy-Item $EnvFile.Example $EnvFile.Target
            Write-Warning "Created $($EnvFile.Target) from example. Please configure with your values."
        }
    }
}

# Compile and build application
[System.Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseApprovedVerbs', '')]
function Invoke-ApplicationBuild {
    Write-Info "Building application for platform: $DetectedPlatform"
    
    try {
        switch ($DetectedPlatform) {
            "vercel" {
                Set-Location frontend
                & npm run build
                Set-Location ..
            }
            { $_ -in @("railway", "heroku", "render") } {
                & npm run build:all
            }
            "aws" {
                & npm run build:all
                & docker-compose -f docker-compose.prod.yml build
            }
            default {
                & npm run build:all
            }
        }
        Write-Success "Build completed"
        return $true
    } catch {
        Write-Error "Build failed: $_"
        return $false
    }
}

# Platform-specific optimizations
function Set-PlatformOptimizations {
    switch ($DetectedPlatform) {
        "vercel" {
            Write-Info "Applying Vercel optimizations..."
            $env:BUILD_STANDALONE = "false"
        }
        "railway" {
            Write-Info "Applying Railway optimizations..."
            # Railway handles this automatically with railway.json
        }
        "aws" {
            Write-Info "Applying AWS optimizations..."
            $env:BUILD_STANDALONE = "true"
        }
        "heroku" {
            Write-Info "Applying Heroku optimizations..."
            $env:BUILD_STANDALONE = "false"
        }
        default {
            Write-Info "Applying generic optimizations..."
        }
    }
}

# Database setup
function Initialize-Database {
    if ($env:DATABASE_URL) {
        Write-Info "Running database migrations..."
        try {
            & npm run db:migrate
            Write-Success "Database migrations completed"
        } catch {
            Write-Warning "Database migration failed or not needed"
        }
    } else {
        Write-Warning "DATABASE_URL not set. Skipping database setup."
    }
}

# Health check
function Test-Configuration {
    Write-Info "Performing health check..."
    
    $RequiredVars = @()
    
    switch ($DetectedPlatform) {
        "vercel" {
            $RequiredVars = @("NEXT_PUBLIC_API_URL", "NEXTAUTH_SECRET")
        }
        default {
            $RequiredVars = @("DATABASE_URL", "JWT_SECRET", "NEXTAUTH_SECRET")
        }
    }
    
    foreach ($Var in $RequiredVars) {
        $Value = [Environment]::GetEnvironmentVariable($Var)
        if ([string]::IsNullOrEmpty($Value)) {
            Write-Warning "Environment variable $Var is not set"
        } else {
            Write-Success "Environment variable $Var is configured"
        }
    }
}

# Main execution
function Main {
    Write-Info "Starting BluelearnerHub setup for $DetectedPlatform platform..."
    
    $Success = $true
    
    if (-not (Test-NodeVersion)) { $Success = $false }
    Test-PythonVersion
    Set-EnvironmentFiles
    Set-PlatformOptimizations
    
    if (-not (Install-Dependencies)) { $Success = $false }
    if (-not (Invoke-ApplicationBuild)) { $Success = $false }
    
    Initialize-Database
    Test-Configuration
    
    if ($Success) {
        Write-Host ""
        Write-Success "Setup completed successfully!"
        
        switch ($DetectedPlatform) {
            "vercel" {
                Write-Host "Next steps:" -ForegroundColor Green
                Write-Host "1. Configure environment variables in Vercel dashboard"
                Write-Host "2. Deploy: vercel --prod"
            }
            "railway" {
                Write-Host "Next steps:" -ForegroundColor Green
                Write-Host "1. Configure environment variables in Railway dashboard"
                Write-Host "2. Deploy: railway up"
            }
            "aws" {
                Write-Host "Next steps:" -ForegroundColor Green
                Write-Host "1. Configure AWS credentials"
                Write-Host "2. Deploy: .\aws\deploy.ps1"
            }
            default {
                Write-Host "Next steps:" -ForegroundColor Green
                Write-Host "1. Configure environment variables"
                Write-Host "2. Start services: npm run start"
            }
        }
        
        Write-Host ""
        Write-Info "Platform is ready for deployment! 🎉"
    } else {
        Write-Error "Setup completed with errors. Please review and fix the issues above."
        exit 1
    }
}

# Run main function
Main