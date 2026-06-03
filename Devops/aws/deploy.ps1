# BluelearnerHub AWS Deployment Script (PowerShell)
# This script automates the complete deployment of BluelearnerHub to AWS

param(
    [string]$Region = "us-east-1",
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

# Configuration
$StackName = "bluelearnerhub-$Environment"
$ClusterName = "BluelearnerHub-Cluster-$Environment"

Write-Host "🚀 Starting BluelearnerHub AWS Deployment" -ForegroundColor Green
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Stack Name: $StackName" -ForegroundColor Cyan

# Function to check if command exists
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Check required tools
Write-Host "✅ Checking required tools..." -ForegroundColor Yellow
$RequiredTools = @("aws", "docker")
foreach ($tool in $RequiredTools) {
    if (-not (Test-Command $tool)) {
        Write-Host "❌ $tool is required but not installed. Please install it first." -ForegroundColor Red
        exit 1
    }
}

# Verify AWS credentials
Write-Host "✅ Verifying AWS credentials..." -ForegroundColor Yellow
try {
    $CallerIdentity = aws sts get-caller-identity --output json | ConvertFrom-Json
    $AccountId = $CallerIdentity.Account
    Write-Host "Account ID: $AccountId" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ AWS credentials not configured. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}

# Build and push Docker images
Write-Host "🐳 Building and pushing Docker images..." -ForegroundColor Yellow

# Login to ECR
Write-Host "🔐 Logging into ECR..." -ForegroundColor Cyan
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"

# Build and push frontend
Write-Host "📦 Building frontend image..." -ForegroundColor Cyan
Set-Location frontend
docker build -t bluelearnerhub-frontend .
docker tag bluelearnerhub-frontend:latest "$AccountId.dkr.ecr.$Region.amazonaws.com/bluelearnerhub-frontend:latest"
docker push "$AccountId.dkr.ecr.$Region.amazonaws.com/bluelearnerhub-frontend:latest"
Set-Location ..

# Build and push backend
Write-Host "📦 Building backend image..." -ForegroundColor Cyan
Set-Location backend
docker build -t bluelearnerhub-backend .
docker tag bluelearnerhub-backend:latest "$AccountId.dkr.ecr.$Region.amazonaws.com/bluelearnerhub-backend:latest"
docker push "$AccountId.dkr.ecr.$Region.amazonaws.com/bluelearnerhub-backend:latest"
Set-Location ..

# Build and push AI services
Write-Host "📦 Building AI services image..." -ForegroundColor Cyan
Set-Location ai-services
docker build -t bluelearnerhub-ai-services .
docker tag bluelearnerhub-ai-services:latest "$AccountId.dkr.ecr.$Region.amazonaws.com/bluelearnerhub-ai-services:latest"
docker push "$AccountId.dkr.ecr.$Region.amazonaws.com/bluelearnerhub-ai-services:latest"
Set-Location ..

# Deploy CloudFormation stack
Write-Host "☁️ Deploying CloudFormation stack..." -ForegroundColor Yellow
aws cloudformation deploy `
    --template-file aws/cloudformation-template.yml `
    --stack-name $StackName `
    --parameter-overrides Environment=$Environment `
    --capabilities CAPABILITY_NAMED_IAM `
    --region $Region

# Get stack outputs
Write-Host "📋 Getting stack outputs..." -ForegroundColor Yellow
$StackOutputs = aws cloudformation describe-stacks --stack-name $StackName --region $Region --output json | ConvertFrom-Json
$Outputs = $StackOutputs.Stacks[0].Outputs

$VpcId = ($Outputs | Where-Object { $_.OutputKey -eq "VPC" }).OutputValue
$AlbDns = ($Outputs | Where-Object { $_.OutputKey -eq "LoadBalancerDNSName" }).OutputValue
$DbEndpoint = ($Outputs | Where-Object { $_.OutputKey -eq "DatabaseEndpoint" }).OutputValue
$RedisEndpoint = ($Outputs | Where-Object { $_.OutputKey -eq "RedisEndpoint" }).OutputValue
$S3Bucket = ($Outputs | Where-Object { $_.OutputKey -eq "S3BucketName" }).OutputValue

Write-Host "VPC ID: $VpcId" -ForegroundColor Cyan
Write-Host "Load Balancer DNS: $AlbDns" -ForegroundColor Cyan
Write-Host "Database Endpoint: $DbEndpoint" -ForegroundColor Cyan
Write-Host "Redis Endpoint: $RedisEndpoint" -ForegroundColor Cyan
Write-Host "S3 Bucket: $S3Bucket" -ForegroundColor Cyan

# Create SSM parameters for secrets
Write-Host "🔐 Creating SSM parameters..." -ForegroundColor Yellow

# Generate JWT secrets
function New-RandomSecret {
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

$JwtSecret = New-RandomSecret
$JwtRefreshSecret = New-RandomSecret
$NextAuthSecret = New-RandomSecret

# Create SSM parameters
$Parameters = @(
    @{
        Name = "/bluelearnerhub/$Environment/database-url"
        Value = "postgresql://postgres:password@$($DbEndpoint):5432/edtech_platform"
        Type = "SecureString"
    },
    @{
        Name = "/bluelearnerhub/$Environment/redis-url"
        Value = "redis://$($RedisEndpoint):6379"
        Type = "SecureString"
    },
    @{
        Name = "/bluelearnerhub/$Environment/jwt-secret"
        Value = $JwtSecret
        Type = "SecureString"
    },
    @{
        Name = "/bluelearnerhub/$Environment/jwt-refresh-secret"
        Value = $JwtRefreshSecret
        Type = "SecureString"
    },
    @{
        Name = "/bluelearnerhub/$Environment/nextauth-secret"
        Value = $NextAuthSecret
        Type = "SecureString"
    },
    @{
        Name = "/bluelearnerhub/$Environment/api-url"
        Value = "https://$AlbDns"
        Type = "SecureString"
    },
    @{
        Name = "/bluelearnerhub/$Environment/nextauth-url"
        Value = "https://$AlbDns"
        Type = "SecureString"
    }
)

foreach ($param in $Parameters) {
    aws ssm put-parameter `
        --name $param.Name `
        --value $param.Value `
        --type $param.Type `
        --overwrite `
        --region $Region
}

# Update ECS task definitions with actual values
Write-Host "📝 Updating ECS task definitions..." -ForegroundColor Yellow
$TaskDefinitionFiles = @("aws/ecs-task-frontend.json", "aws/ecs-task-backend.json", "aws/ecs-task-ai-services.json")

foreach ($file in $TaskDefinitionFiles) {
    $content = Get-Content $file -Raw
    $content = $content -replace "ACCOUNT_ID", $AccountId
    $content = $content -replace "REGION", $Region
    Set-Content $file $content
}

# Register ECS task definitions
Write-Host "📋 Registering ECS task definitions..." -ForegroundColor Yellow
aws ecs register-task-definition --cli-input-json "file://aws/ecs-task-frontend.json" --region $Region
aws ecs register-task-definition --cli-input-json "file://aws/ecs-task-backend.json" --region $Region
aws ecs register-task-definition --cli-input-json "file://aws/ecs-task-ai-services.json" --region $Region

# Get subnet IDs for ECS services
Write-Host "🔍 Getting subnet and security group information..." -ForegroundColor Yellow
$Subnets = aws ec2 describe-subnets `
    --filters "Name=vpc-id,Values=$VpcId" "Name=tag:Name,Values=*Private*" `
    --query 'Subnets[].SubnetId' `
    --output text `
    --region $Region

$PrivateSubnetIds = $Subnets -split "`t" -join ","

$EcsSgId = aws ec2 describe-security-groups `
    --filters "Name=vpc-id,Values=$VpcId" "Name=group-name,Values=BluelearnerHub-ECS-SG-$Environment" `
    --query 'SecurityGroups[0].GroupId' `
    --output text `
    --region $Region

Write-Host "Subnets: $PrivateSubnetIds" -ForegroundColor Cyan
Write-Host "Security Group: $EcsSgId" -ForegroundColor Cyan

# Create ECS services
Write-Host "🚢 Creating ECS services..." -ForegroundColor Yellow

$NetworkConfig = "awsvpcConfiguration={subnets=[$PrivateSubnetIds],securityGroups=[$EcsSgId],assignPublicIp=DISABLED}"

# Frontend service
aws ecs create-service `
    --cluster $ClusterName `
    --service-name bluelearnerhub-frontend `
    --task-definition bluelearnerhub-frontend:1 `
    --desired-count 2 `
    --launch-type FARGATE `
    --network-configuration $NetworkConfig `
    --region $Region

# Backend service
aws ecs create-service `
    --cluster $ClusterName `
    --service-name bluelearnerhub-backend `
    --task-definition bluelearnerhub-backend:1 `
    --desired-count 2 `
    --launch-type FARGATE `
    --network-configuration $NetworkConfig `
    --region $Region

# AI services
aws ecs create-service `
    --cluster $ClusterName `
    --service-name bluelearnerhub-ai-services `
    --task-definition bluelearnerhub-ai-services:1 `
    --desired-count 1 `
    --launch-type FARGATE `
    --network-configuration $NetworkConfig `
    --region $Region

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your application will be available at: https://$AlbDns" -ForegroundColor Cyan
Write-Host "📊 Monitor your services in the AWS ECS console" -ForegroundColor Cyan
Write-Host "🔍 View logs in CloudWatch Logs" -ForegroundColor Cyan

Write-Host "`n⚠️  Don't forget to:" -ForegroundColor Yellow
Write-Host "1. Set up your domain name and SSL certificate" -ForegroundColor White
Write-Host "2. Configure your Google Gemini API key in SSM Parameter Store" -ForegroundColor White
Write-Host "3. Run database migrations" -ForegroundColor White
Write-Host "4. Set up monitoring and alerting" -ForegroundColor White