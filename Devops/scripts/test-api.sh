#!/bin/bash

# BlueLearnerHub Quick Test Script
# Tests the API endpoints to verify the setup works

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="${API_URL:-http://localhost:5000}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  BlueLearnerHub API Tests${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -e "\n${YELLOW}Testing: $name${NC}"
    echo -e "  Method: $method"
    echo -e "  Endpoint: $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            ${data:+-d "$data"} \
            "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "  ${GREEN}✓ Success (HTTP $http_code)${NC}"
        return 0
    else
        echo -e "  ${RED}✗ Failed (HTTP $http_code)${NC}"
        echo -e "  Response: $body"
        return 1
    fi
}

# Test health endpoint
echo -e "\n${BLUE}--- Basic Tests ---${NC}"

echo -e "${YELLOW}Testing health endpoint...${NC}"
health_response=$(curl -s -w "\n%{http_code}" "$API_URL/health" || echo "000")
health_code=$(echo "$health_response" | tail -n1)

if [ "$health_code" = "200" ]; then
    echo -e "  ${GREEN}✓ Backend is running${NC}"
else
    echo -e "  ${RED}✗ Backend is not running (HTTP $health_code)${NC}"
    echo -e "  ${YELLOW}Please start the backend first: npm run dev:backend${NC}"
    exit 1
fi

# Test hackathons endpoint
echo -e "\n${BLUE}--- Hackathon Tests ---${NC}"
test_endpoint "List Hackathons" "GET" "/api/hackathons"

# Test registration (should fail without auth)
echo -e "\n${BLUE}--- Auth Tests ---${NC}"
test_endpoint "Register User" "POST" "/api/auth/register" '{
    "email": "test_'"$(date +%s)"'@test.com",
    "password": "Test@123456",
    "fullName": "Test User",
    "role": "STUDENT"
}'

# Test login
login_response=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"Test@123456"}' \
    -w "\n%{http_code}")

login_code=$(echo "$login_response" | tail -n1)
echo -e "\n${YELLOW}Testing login with test credentials...${NC}"

if [ "$login_code" = "200" ]; then
    echo -e "  ${GREEN}✓ Login successful${NC}"
    # Extract token for further tests
    token=$(echo "$login_response" | sed '$d' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    if [ -n "$token" ]; then
        echo -e "  Token received: ${GREEN}$(echo $token | cut -c1-20)...${NC}"
    fi
elif [ "$login_code" = "401" ]; then
    echo -e "  ${YELLOW}○ Login failed (expected - no test user yet)${NC}"
else
    echo -e "  ${RED}✗ Login failed with HTTP $login_code${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Tests Complete${NC}"
echo -e "${BLUE}========================================${NC}"
