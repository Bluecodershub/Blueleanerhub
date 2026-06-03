#Requires -Version 5.0
# Blue Learner Hub Deployment Validation Script
# Validates deployment readiness across all supported platforms

param(
    [string]$Platform = "all",
    [switch]$Verbose = $false
)


$ErrorActionPreference = "Continue"

Write-Host "[INFO] BluelearnerHub Deployment Validation" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Validation results
$script:ValidationResults = @()

function Add-ValidationResult {
    param(
        [string]$Category,
        [string]$Check,
        [bool]$Passed,
        [string]$Message = "",
        [string]$Severity = "Error"
    )
    
    $script:ValidationResults += [PSCustomObject]@{
        Category = $Category
        Check = $Check
        Passed = $Passed
        Message = $Message
        Severity = $Severity
    }
    
    $Icon = if ($Passed) { "[OK]" } else { if ($Severity -eq "Warning") { "[WARN]" } else { "[FAIL]" } }
    $Color = if ($Passed) { "Green" } else { if ($Severity -eq "Warning") { "Yellow" } else { "Red" } }
    
    if ($Verbose -or -not $Passed) {
        Write-Host "$Icon [$Category] $Check" -ForegroundColor $Color
        if ($Message) {
            Write-Host "  $Message" -ForegroundColor Gray
        }
    }
}

# File structure validation
function Test-FileStructure {
    $RequiredFiles = @(
        "package.json",
        "frontend/package.json",
        "frontend/next.config.ts",
        "frontend/Dockerfile",
        "backend/package.json",
        "backend/Dockerfile",
        "backend/tsconfig.json",
        "worker/ai-services/requirements.txt",
        "worker/ai-services/Dockerfile",
        "devops/docker-compose.yml",
        "devops/docker-compose.prod.yml",
        "frontend/vercel.json",
        "devops/railway.json",
        "devops/aws/cloudformation-template.yml",
        ".github/workflows/ci-cd.yml"
    )
    
    foreach ($File in $RequiredFiles) {
        $Exists = Test-Path $File
        Add-ValidationResult "Files" "Required file: $File" $Exists "File is required for deployment"
    }
    
    # Check for environment examples
    $EnvFiles = @(
        "backend/.env.example",
        "frontend/.env.production",
        "worker/ai-services/.env.example"
    )
    
    foreach ($EnvFile in $EnvFiles) {
        $Exists = Test-Path $EnvFile
        Add-ValidationResult "Environment" "Environment example: $EnvFile" $Exists "Example file helps with setup" "Warning"
    }
}

# Package.json validation
function Test-PackageJson {
    try {
        $RootPackage = Get-Content "package.json" | ConvertFrom-Json
        
        # Check scripts
        $RequiredScripts = @("dev:frontend", "dev:backend", "dev:ai-services", "build", "test", "lint", "verify")
        foreach ($Script in $RequiredScripts) {
            $HasScript = $RootPackage.scripts.PSObject.Properties.Name -contains $Script
            Add-ValidationResult "Scripts" "Root script: $Script" $HasScript "Required for platform deployment"
        }
        
        # Check engines
        $HasNodeEngine = [bool]$RootPackage.engines.node
        Add-ValidationResult "Engines" "Node.js engine specified" $HasNodeEngine "Helps platforms choose correct Node version" "Warning"
        
        if ($HasNodeEngine) {
            $NodeVersion = $RootPackage.engines.node
            $IsCorrectVersion = $NodeVersion -match ">=18" -or $NodeVersion -match "\^18" -or $NodeVersion -match "18\."
            Add-ValidationResult "Engines" "Node.js version >= 18" $IsCorrectVersion "Current: $NodeVersion"
        }
        
    } catch {
        Add-ValidationResult "Package" "Root package.json valid" $false "Failed to parse: $_"
    }
}

# Docker configuration validation
function Test-DockerConfiguration {
    # Check Dockerfile optimization
    $Services = @("frontend", "backend", "ai-services")
    
    foreach ($Service in $Services) {
        $DockerfilePath = "$Service/Dockerfile"
        if (Test-Path $DockerfilePath) {
            $Content = Get-Content $DockerfilePath -Raw
            
            # Check for multi-stage build
            $HasMultiStage = $Content -match "FROM .* AS"
            Add-ValidationResult "Docker" "$Service multi-stage build" $HasMultiStage "Optimizes image size and security"
            
            # Check for health check
            $HasHealthCheck = $Content -match "HEALTHCHECK"
            Add-ValidationResult "Docker" "$Service health check" $HasHealthCheck "Required for container orchestration" "Warning"
            
            # Check for non-root user
            $HasUserConfig = $Content -match "USER " -and $Content -notmatch "USER root"
            Add-ValidationResult "Docker" "$Service non-root user" $HasUserConfig "Security best practice"
        }
    }
    
    # Check docker-compose files
    $ComposeFiles = @("docker-compose.yml", "docker-compose.prod.yml")
    foreach ($ComposeFile in $ComposeFiles) {
        if (Test-Path $ComposeFile) {
            $Content = Get-Content $ComposeFile -Raw
            
            # Check for health checks
            $HasHealthChecks = $Content -match "healthcheck:"
            Add-ValidationResult "Docker" "$ComposeFile health checks" $HasHealthChecks "Required for production deployment"
            
            # Check for restart policies
            $HasRestartPolicy = $Content -match "restart:"
            Add-ValidationResult "Docker" "$ComposeFile restart policy" $HasRestartPolicy "Required for production resilience"
        }
    }
}

# Platform-specific validation
function Test-VercelConfiguration {
    if (Test-Path "frontend/vercel.json") {
        try {
            $VercelConfig = Get-Content "frontend/vercel.json" | ConvertFrom-Json
            
            # Check modern Vercel configuration keys
            $HasBuilds = [bool]$VercelConfig.build -or [bool]$VercelConfig.functions
            Add-ValidationResult "Vercel" "Build/functions configuration" $HasBuilds "Required for proper deployment"
            
            # Check rewrites/redirects
            $HasRoutes = [bool]$VercelConfig.rewrites -or [bool]$VercelConfig.routes
            Add-ValidationResult "Vercel" "Route/rewrites configuration" $HasRoutes "Required for API routing"
            
            # Check headers
            $HasHeaders = [bool]$VercelConfig.headers
            Add-ValidationResult "Vercel" "Security headers" $HasHeaders "Required for security" "Warning"
            
        } catch {
            Add-ValidationResult "Vercel" "Configuration valid" $false "Failed to parse vercel.json: $_"
        }
    }
}

function Test-RailwayConfiguration {
    if (Test-Path "devops/railway.json") {
        try {
            $RailwayConfig = Get-Content "devops/railway.json" | ConvertFrom-Json
            
            # Check services
            $HasServices = [bool]$RailwayConfig.services
            Add-ValidationResult "Railway" "Services configuration" $HasServices "Required for multi-service deployment"
            
            if ($HasServices) {
                $ServiceCount = @($RailwayConfig.services).Count
                # Expecting at least 3 services: frontend, backend, ai-services
                $HasAllServices = $ServiceCount -ge 3
                Add-ValidationResult "Railway" "All services defined" $HasAllServices "Found $ServiceCount services, expected 3+"
            }
            
        } catch {
            Add-ValidationResult "Railway" "Configuration valid" $false "Failed to parse railway.json: $_"
        }
    }
}

function Test-AWSConfiguration {
    # Check CloudFormation template
    if (Test-Path "devops/aws/cloudformation-template.yml") {
        $Content = Get-Content "devops/aws/cloudformation-template.yml" -Raw
        
        # Check for key AWS resources
        $RequiredResources = @("VPC", "ECSCluster", "LoadBalancer", "RDS", "ElastiCache")
        foreach ($Resource in $RequiredResources) {
            $HasResource = $Content -match $Resource
            Add-ValidationResult "AWS" "CloudFormation resource: $Resource" $HasResource "Required for complete AWS deployment"
        }
    }
    
    # Check ECS task definitions
    $TaskDefinitions = @("ecs-task-frontend.json", "ecs-task-backend.json", "ecs-task-ai-services.json")
    foreach ($TaskDef in $TaskDefinitions) {
        $TaskDefPath = "devops/aws/$TaskDef"
        if (Test-Path $TaskDefPath) {
            try {
                $TaskConfig = Get-Content $TaskDefPath | ConvertFrom-Json
                
                # Check for health checks
                $HasHealthCheck = [bool]$TaskConfig.containerDefinitions[0].healthCheck
                Add-ValidationResult "AWS" "$TaskDef health check" $HasHealthCheck "Required for ECS service stability"
                
                # Check for logging
                $HasLogging = [bool]$TaskConfig.containerDefinitions[0].logConfiguration
                Add-ValidationResult "AWS" "$TaskDef logging configuration" $HasLogging "Required for monitoring"
                
            } catch {
                Add-ValidationResult "AWS" "$TaskDef valid JSON" $false "Failed to parse: $_"
            }
        }
    }
}

# CI/CD validation
function Test-CICDConfiguration {
    if (Test-Path ".github/workflows/ci-cd.yml") {
        $Content = Get-Content ".github/workflows/ci-cd.yml" -Raw
        
        # Check for test jobs
        $HasTests = $Content -match "test-"
        Add-ValidationResult "CI/CD" "Test jobs defined" $HasTests "Required for quality assurance"
        
        # Check for build jobs
        $HasBuild = $Content -match "build"
        Add-ValidationResult "CI/CD" "Build jobs defined" $HasBuild "Required for deployment pipeline"
        
        # Check for deployment jobs
        $HasDeploy = $Content -match "deploy"
        Add-ValidationResult "CI/CD" "Deploy jobs defined" $HasDeploy "Required for automated deployment"
        
        # Check for security scanning
        $HasSecurity = $Content -match "trivy" -or $Content -match "security"
        Add-ValidationResult "CI/CD" "Security scanning" $HasSecurity "Security best practice"
    }
}

# Environment validation
function Test-EnvironmentSetup {
    # Check if files have required variables
    $EnvChecks = @(
        @{ File = "backend/.env.example"; RequiredVars = @("MONGODB_URL", "JWT_SECRET", "REDIS_URL") },
        @{ File = "frontend/.env.production"; RequiredVars = @("NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_WS_URL") },
        @{ File = "worker/ai-services/.env.example"; RequiredVars = @("GEMINI_API_KEY") }
    )
    
    foreach ($EnvCheck in $EnvChecks) {
        if (Test-Path $EnvCheck.File) {
            $Content = Get-Content $EnvCheck.File -Raw
            
            foreach ($Var in $EnvCheck.RequiredVars) {
                $HasVar = $Content -match "(?m)^$Var=" -or $Content -match "(?m)^#\s*$Var="
                Add-ValidationResult "Environment" "$($EnvCheck.File): $Var" $HasVar "Required environment variable"
            }
        }
    }
}

# Security validation
function Test-SecurityConfiguration {
    # Check for security headers in Next.js config
    if (Test-Path "frontend/next.config.ts") {
        $Content = Get-Content "frontend/next.config.ts" -Raw
        
        $SecurityHeaders = @("X-Frame-Options", "X-Content-Type-Options", "Strict-Transport-Security")
        foreach ($Header in $SecurityHeaders) {
            $HasHeader = $Content -match $Header
            Add-ValidationResult "Security" "Security header: $Header" $HasHeader "Security best practice"
        }
    }
    
    # Check for .gitignore
    if (Test-Path ".gitignore") {
        $Content = Get-Content ".gitignore" -Raw
        
        $IgnoredItems = @("\.env", "node_modules", "\.next", "dist")
        foreach ($Item in $IgnoredItems) {
            $IsIgnored = $Content -match $Item
            Add-ValidationResult "Security" "Gitignore: $Item" $IsIgnored "Prevents sensitive data commit"
        }
    }
}

# Performance validation
function Test-PerformanceConfiguration {
    # Check Next.js config for optimizations
    if (Test-Path "frontend/next.config.ts") {
        $Content = Get-Content "frontend/next.config.ts" -Raw
        
        # Check for image optimization
        $HasImageConfig = $Content -match "images:"
        Add-ValidationResult "Performance" "Image optimization configured" $HasImageConfig "Improves loading performance" "Warning"
        
        # Check for compression
        $HasCompression = $Content -match "compress:" -or $Content -match "gzip"
        Add-ValidationResult "Performance" "Compression enabled" $HasCompression "Reduces bandwidth usage" "Warning"
        
        # Check for minification
        $HasMinification = $Content -match "swcMinify" -or $Content -match "removeConsole"
        Add-ValidationResult "Performance" "Code minification" $HasMinification "Reduces bundle size" "Warning"
    }
}

# Main validation execution
function Start-Validation {
    Write-Host "Running deployment validation checks..." -ForegroundColor Yellow
    Write-Host ""
    
    if ($Platform -eq "all" -or $Platform -eq "files") {
        Test-FileStructure
    }
    
    if ($Platform -eq "all" -or $Platform -eq "package") {
        Test-PackageJson
    }
    
    if ($Platform -eq "all" -or $Platform -eq "docker") {
        Test-DockerConfiguration
    }
    
    if ($Platform -eq "all" -or $Platform -eq "vercel") {
        Test-VercelConfiguration
    }
    
    if ($Platform -eq "all" -or $Platform -eq "railway") {
        Test-RailwayConfiguration
    }
    
    if ($Platform -eq "all" -or $Platform -eq "aws") {
        Test-AWSConfiguration
    }
    
    if ($Platform -eq "all" -or $Platform -eq "cicd") {
        Test-CICDConfiguration
    }
    
    if ($Platform -eq "all" -or $Platform -eq "environment") {
        Test-EnvironmentSetup
    }
    
    if ($Platform -eq "all" -or $Platform -eq "security") {
        Test-SecurityConfiguration
    }
    
    if ($Platform -eq "all" -or $Platform -eq "performance") {
        Test-PerformanceConfiguration
    }
}

# Generate summary report
function Write-ValidationSummary {
    Write-Host ""
    Write-Host "[INFO] Validation Summary" -ForegroundColor Cyan
    Write-Host "====================" -ForegroundColor Cyan
    
    $GroupedResults = $script:ValidationResults | Group-Object Category
    
    foreach ($Group in $GroupedResults) {
        Write-Host ""
        Write-Host "[$($Group.Name)]" -ForegroundColor Magenta
        
        $Passed = ($Group.Group | Where-Object { $_.Passed }).Count
        $Total = $Group.Group.Count
        $Errors = ($Group.Group | Where-Object { -not $_.Passed -and $_.Severity -eq "Error" }).Count
        $Warnings = ($Group.Group | Where-Object { -not $_.Passed -and $_.Severity -eq "Warning" }).Count
        
        Write-Host "  Passed: $Passed/$Total" -ForegroundColor Green
        if ($Errors -gt 0) {
            Write-Host "  Errors: $Errors" -ForegroundColor Red
        }
        if ($Warnings -gt 0) {
            Write-Host "  Warnings: $Warnings" -ForegroundColor Yellow
        }
    }
    
    # Overall summary
    $TotalPassed = ($script:ValidationResults | Where-Object { $_.Passed }).Count
    $TotalChecks = $script:ValidationResults.Count
    $TotalErrors = ($script:ValidationResults | Where-Object { -not $_.Passed -and $_.Severity -eq "Error" }).Count
    $TotalWarnings = ($script:ValidationResults | Where-Object { -not $_.Passed -and $_.Severity -eq "Warning" }).Count
    
    Write-Host ""
    Write-Host "Overall: $TotalPassed/$TotalChecks passed" -ForegroundColor $(if ($TotalErrors -eq 0) { "Green" } else { "Red" })
    
    if ($TotalErrors -eq 0 -and $TotalWarnings -eq 0) {
        Write-Host "[READY] All checks passed. Platform is ready for deployment." -ForegroundColor Green
    } elseif ($TotalErrors -eq 0) {
        Write-Host "[PASS] No critical errors found. $TotalWarnings warnings should be addressed." -ForegroundColor Yellow
    } else {
        Write-Host "[BLOCKED] $TotalErrors critical errors must be fixed before deployment." -ForegroundColor Red
        Write-Host "[WARN] $TotalWarnings warnings should also be addressed." -ForegroundColor Yellow
    }
    
    return $TotalErrors -eq 0
}

# Execute validation
Start-Validation
$Success = Write-ValidationSummary

if (-not $Success) {
    exit 1
}