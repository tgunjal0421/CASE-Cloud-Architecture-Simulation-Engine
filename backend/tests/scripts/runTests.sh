#!/bin/bash

# CASE Backend Test Suite Runner (Python/pytest)
# This script provides various ways to run tests

set -e

echo "======================================"
echo "CASE Backend Test Suite (Python)"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Check if dependencies are installed
if ! pip show pytest &>/dev/null; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pip install -r requirements.txt
fi

# Parse command line arguments
TEST_TYPE=${1:-"all"}

case $TEST_TYPE in
    all)
        echo -e "${BLUE}Running all tests...${NC}"
        pytest
        ;;
    unit)
        echo -e "${BLUE}Running unit tests...${NC}"
        pytest tests/unit -v
        ;;
    integration)
        echo -e "${BLUE}Running integration tests...${NC}"
        pytest tests/integration -v
        ;;
    watch)
        echo -e "${BLUE}Running tests in watch mode...${NC}"
        pytest-watch
        ;;
    coverage)
        echo -e "${BLUE}Running tests with coverage...${NC}"
        pytest --cov=app --cov-report=html
        ;;
    help)
        echo "Usage: ./runTests.sh [test-type]"
        echo ""
        echo "Test Types:"
        echo "  all          - Run all tests (default)"
        echo "  unit         - Run unit tests only"
        echo "  integration  - Run integration tests only"
        echo "  coverage     - Run tests with coverage report"
        echo "  help         - Show this help message"
        echo ""
        echo "Example: ./runTests.sh unit"
        ;;
    *)
        echo -e "${YELLOW}Unknown test type: $TEST_TYPE${NC}"
        echo "Run './runTests.sh help' for usage information"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Test suite completed!${NC}"

