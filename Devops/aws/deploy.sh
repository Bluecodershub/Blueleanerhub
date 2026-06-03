#!/bin/bash

# BluelearnerHub AWS Deployment Script
# This script automates the complete deployment of BluelearnerHub to AWS

set -e

# Configuration
REGION="us-east-1"
ENVIRONMENT="production"
STACK_NAME="bluelearnerhub-${ENVIRONMENT}"
CLUSTER_NAME="BluelearnerHub-Cluster-${ENVIRONMENT}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🚀 Starting BluelearnerHub AWS Deployment"
echo "Account ID: ${ACCOUNT_ID}"
echo "Region: ${REGION}"
echo "Environment: ${ENVIRONMENT}"
echo "Stack Name: ${STACK_NAME}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
echo "✅ Checking required tools..."
for tool in aws docker jq; do
    if ! command_exists $tool; then
        echo "❌ $tool is required but not installed. Please install it first."
        exit 1
    fi
done

# Verify AWS credentials
echo "✅ Verifying AWS credentials..."
aws sts get-caller-identity > /dev/null || {
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
}

# Build and push Docker images
echo "🐳 Building and pushing Docker images..."

# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build and push frontend
echo "📦 Building frontend image..."
cd frontend
docker build -t bluelearnerhub-frontend .
docker tag bluelearnerhub-frontend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/bluelearnerhub-frontend:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/bluelearnerhub-frontend:latest
cd ..

# Build and push backend
echo "📦 Building backend image..."
cd backend
docker build -t bluelearnerhub-backend .
docker tag bluelearnerhub-backend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/bluelearnerhub-backend:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/bluelearnerhub-backend:latest
cd ..

# Build and push AI services
echo "📦 Building AI services image..."
cd ai-services
docker build -t bluelearnerhub-ai-services .
docker tag bluelearnerhub-ai-services:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/bluelearnerhub-ai-services:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/bluelearnerhub-ai-services:latest
cd ..

# Deploy CloudFormation stack
echo "☁️ Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file aws/cloudformation-template.yml \
    --stack-name $STACK_NAME \
    --parameter-overrides Environment=$ENVIRONMENT \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION

# Get stack outputs
echo "📋 Getting stack outputs..."
VPC_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`VPC`].OutputValue' --output text)
ALB_DNS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNSName`].OutputValue' --output text)
DB_ENDPOINT=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' --output text)
REDIS_ENDPOINT=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`RedisEndpoint`].OutputValue' --output text)
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' --output text)

echo "VPC ID: $VPC_ID"
echo "Load Balancer DNS: $ALB_DNS"
echo "Database Endpoint: $DB_ENDPOINT"
echo "Redis Endpoint: $REDIS_ENDPOINT"
echo "S3 Bucket: $S3_BUCKET"

# Create SSM parameters for secrets
echo "🔐 Creating SSM parameters..."
aws ssm put-parameter \
    --name "/bluelearnerhub/${ENVIRONMENT}/database-url" \
    --value "postgresql://postgres:$(aws rds generate-db-auth-token --hostname $DB_ENDPOINT --port 5432 --region $REGION --username postgres)@$DB_ENDPOINT:5432/edtech_platform" \
    --type "SecureString" \
    --overwrite

aws ssm put-parameter \
    --name "/bluelearnerhub/${ENVIRONMENT}/redis-url" \
    --value "redis://$REDIS_ENDPOINT:6379" \
    --type "SecureString" \
    --overwrite

# Generate JWT secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

aws ssm put-parameter \
    --name "/bluelearnerhub/${ENVIRONMENT}/jwt-secret" \
    --value "$JWT_SECRET" \
    --type "SecureString" \
    --overwrite

aws ssm put-parameter \
    --name "/bluelearnerhub/${ENVIRONMENT}/jwt-refresh-secret" \
    --value "$JWT_REFRESH_SECRET" \
    --type "SecureString" \
    --overwrite

aws ssm put-parameter \
    --name "/bluelearnerhub/${ENVIRONMENT}/nextauth-secret" \
    --value "$NEXTAUTH_SECRET" \
    --type "SecureString" \
    --overwrite

aws ssm put-parameter \
    --name "/bluelearnerhub/${ENVIRONMENT}/api-url" \
    --value "https://$ALB_DNS" \
    --type "SecureString" \
    --overwrite

aws ssm put-parameter \
    --name "/bluelearnerhub/${ENVIRONMENT}/nextauth-url" \
    --value "https://$ALB_DNS" \
    --type "SecureString" \
    --overwrite

# Update ECS task definitions with actual values
echo "📝 Updating ECS task definitions..."
sed -i "s/ACCOUNT_ID/$ACCOUNT_ID/g" aws/ecs-task-*.json
sed -i "s/REGION/$REGION/g" aws/ecs-task-*.json

# Register ECS task definitions
echo "📋 Registering ECS task definitions..."
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-frontend.json
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-backend.json
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-ai-services.json

# Get subnet IDs for ECS services
PRIVATE_SUBNET_IDS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*Private*" \
    --query 'Subnets[].SubnetId' \
    --output text | tr '\t' ',')

# Get security group ID for ECS services
ECS_SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=group-name,Values=BluelearnerHub-ECS-SG-${ENVIRONMENT}" \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

echo "Subnets: $PRIVATE_SUBNET_IDS"
echo "Security Group: $ECS_SG_ID"

# Create ECS services
echo "🚢 Creating ECS services..."

# Frontend service
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name bluelearnerhub-frontend \
    --task-definition bluelearnerhub-frontend:1 \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNET_IDS],securityGroups=[$ECS_SG_ID],assignPublicIp=DISABLED}"

# Backend service
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name bluelearnerhub-backend \
    --task-definition bluelearnerhub-backend:1 \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNET_IDS],securityGroups=[$ECS_SG_ID],assignPublicIp=DISABLED}"

# AI services
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name bluelearnerhub-ai-services \
    --task-definition bluelearnerhub-ai-services:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNET_IDS],securityGroups=[$ECS_SG_ID],assignPublicIp=DISABLED}"

echo "✅ Deployment complete!"
echo "🌐 Your application will be available at: https://$ALB_DNS"
echo "📊 Monitor your services in the AWS ECS console"
echo "🔍 View logs in CloudWatch Logs"

echo "⚠️  Don't forget to:"
echo "1. Set up your domain name and SSL certificate"
echo "2. Configure your Google Gemini API key in SSM Parameter Store"
echo "3. Run database migrations"
echo "4. Set up monitoring and alerting"