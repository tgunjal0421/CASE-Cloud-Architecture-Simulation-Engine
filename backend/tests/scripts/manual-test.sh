#!/bin/bash

# Manual API Testing Script for CASE Backend (Python/FastAPI)
# Tests all endpoints using curl

API_BASE="http://localhost:3001"

echo "======================================"
echo "CASE Backend API Manual Tests"
echo "======================================"
echo ""
echo "Make sure the backend server is running on port 3001"
echo "Start it with: python3 run.py"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo -e "${BLUE}Testing ${method} ${endpoint}${NC}"
    
    if [ -z "$data" ]; then
        curl -X $method "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -w "\nHTTP Status: %{http_code}\n" \
            -s
    else
        curl -X $method "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "\nHTTP Status: %{http_code}\n" \
            -s
    fi
    echo ""
}

# Test 1: Health Check
echo -e "${YELLOW}1. Health Check${NC}"
test_endpoint "GET" "/"

# Test 2: Get Domains
echo -e "${YELLOW}2. Get All Domains${NC}"
test_endpoint "GET" "/api/domains/"

# Test 3: Get Templates
echo -e "${YELLOW}3. Get All Templates${NC}"
test_endpoint "GET" "/api/templates/"

# Test 4: Get Specific Template
echo -e "${YELLOW}4. Get Specific Template (3-tier web app)${NC}"
test_endpoint "GET" "/api/templates/3-tier%20web%20app"

# Test 5: Run Simulation with Simple Architecture
echo -e "${YELLOW}5. Run Simulation (Simple)${NC}"
SIMPLE_SIM='{
  "nodes": [
    {
      "id": "n1",
      "domain": "Network",
      "kind": "Load Balancer",
      "status": "healthy",
      "rps": 100,
      "latency": 50
    }
  ],
  "edges": [],
  "steps": 3
}'
test_endpoint "POST" "/api/simulate/" "$SIMPLE_SIM"

# Test 6: Run Simulation with 3-Tier Architecture
echo -e "${YELLOW}6. Run Simulation (3-Tier Web App)${NC}"
COMPLEX_SIM='{
  "nodes": [
    {
      "id": "n1",
      "domain": "Network",
      "kind": "Load Balancer",
      "status": "healthy",
      "rps": 220,
      "latency": 28
    },
    {
      "id": "n2",
      "domain": "Compute",
      "kind": "Container Service",
      "status": "healthy",
      "rps": 185,
      "latency": 55
    },
    {
      "id": "n3",
      "domain": "Database",
      "kind": "SQL Database",
      "status": "healthy",
      "rps": 130,
      "latency": 80
    }
  ],
  "edges": [
    { "id": "e1", "from": "n1", "to": "n2" },
    { "id": "e2", "from": "n2", "to": "n3" }
  ],
  "steps": 5
}'
test_endpoint "POST" "/api/simulate/" "$COMPLEX_SIM"

# Test 7: Error Test - Missing Nodes
echo -e "${YELLOW}7. Error Test - Missing Nodes${NC}"
ERROR_TEST='{
  "edges": []
}'
test_endpoint "POST" "/api/simulate/" "$ERROR_TEST"

# Test 8: Error Test - Invalid Steps
echo -e "${YELLOW}8. Error Test - Invalid Steps${NC}"
ERROR_TEST2='{
  "nodes": [{"id": "n1", "rps": 100, "latency": 50, "status": "healthy"}],
  "edges": [],
  "steps": 2000
}'
test_endpoint "POST" "/api/simulate/" "$ERROR_TEST2"

echo -e "${GREEN}======================================"
echo "Manual API Tests Completed!"
echo "====================================== ${NC}"
