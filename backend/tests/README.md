# CASE Backend Testing Guide (Python/pytest)

This directory contains comprehensive tests for the CASE (Cloud Architecture Simulation Engine) backend using Python and pytest.

## Test Structure

```
tests/
├── unit/                          # Unit tests for individual functions
│   ├── __init__.py
│   └── test_simulator.py          # Tests for simulation engine
├── integration/                   # Integration tests for API endpoints
│   ├── __init__.py
│   └── test_api.py                # Tests for all REST API endpoints
└── scripts/                       # Helper scripts for running tests
    ├── runTests.sh                # Main test runner script
    └── manual-test.sh             # Manual API testing with curl
```

## Running Tests

### Automated Tests (Recommended)

#### Run all tests:
```bash
pytest
```

#### Run only unit tests:
```bash
pytest tests/unit -v
```

#### Run only integration tests:
```bash
pytest tests/integration -v
```

#### Run with coverage report:
```bash
pytest --cov=app --cov-report=html
```

### Using the Test Runner Script

```bash
# Make script executable
chmod +x tests/scripts/runTests.sh

# Run all tests
./tests/scripts/runTests.sh all

# Run unit tests
./tests/scripts/runTests.sh unit

# Run integration tests
./tests/scripts/runTests.sh integration

# Show help
./tests/scripts/runTests.sh help
```

### Manual API Testing

For manual testing of the API endpoints using curl:

```bash
# Make script executable
chmod +x tests/scripts/manual-test.sh

# Start the backend server in one terminal
python3 run.py

# In another terminal, run manual tests
./tests/scripts/manual-test.sh
```

This will test all endpoints including:
- Health check (`GET /`)
- Get domains (`GET /api/domains/`)
- Get templates (`GET /api/templates/`)
- Get specific template (`GET /api/templates/{name}`)
- Run simulations with various inputs
- Error handling for invalid inputs

## Test Coverage

### Unit Tests (test_simulator.py)

Tests the simulation engine's core functions (21 tests):

- **validateSimulationInput()**: Input validation logic
  - Valid input acceptance
  - Rejection of missing fields
  - Validation of node and edge integrity
  
- **stepSimulation()**: Single step of simulation
  - Node count preservation
  - Metric updates (RPS, latency)
  - Flow propagation through edges
  - Status management
  - Failure node handling

- **runSimulation()**: Complete simulation execution
  - Correct number of steps
  - Original data not modified
  - Valid data at each step

### Integration Tests (test_api.py)

Tests all REST API endpoints (17 tests):

- **GET /**: Health check endpoint
  - Returns proper status and service info

- **GET /api/domains/**: Domain components endpoint
  - Returns all domains
  - Correct data structure
  - All expected domains present

- **GET /api/templates/**: Templates listing endpoint
  - Returns template object
  - Correct structure
  - Predefined templates available

- **GET /api/templates/{name}**: Specific template endpoint
  - Returns requested template
  - Proper 404 handling

- **POST /api/simulate/**: Simulation execution endpoint
  - Successful simulation runs
  - Correct number of steps returned
  - Default steps handling
  - Input validation
  - Error responses for invalid input

- **Error Handling**: Proper HTTP status codes and error messages

## Test Dependencies

The test suite uses:

- **pytest**: Testing framework
- **pytest-asyncio**: Support for async tests
- **httpx**: HTTP testing library for FastAPI

These are installed as dependencies in requirements.txt.

## Example Test Output

```
tests/unit/test_simulator.py::TestValidateSimulationInput::test_valid_input PASSED
tests/unit/test_simulator.py::TestValidateSimulationInput::test_missing_nodes PASSED
...
tests/integration/test_api.py::TestHealthEndpoint::test_returns_health_status PASSED
tests/integration/test_api.py::TestDomainsEndpoint::test_returns_domain_components PASSED
...

====== 38 passed in 0.45s ======
```

## Adding New Tests

When adding new features:

1. **Add unit tests** in `tests/unit/` for new functions/services
2. **Add integration tests** in `tests/integration/` for new endpoints
3. **Run tests** to ensure all pass: `pytest`

Example unit test:
```python
import pytest
from app.services.simulator import some_function

class TestSomeFunction:
    def test_some_condition(self):
        result = some_function(input_data)
        assert result == expected_output
```

Example integration test:
```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoint():
    response = client.get("/api/endpoint/")
    assert response.status_code == 200
    assert response.json() == expected_data
```

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```bash
# GitHub Actions example
pip install -r requirements.txt
pytest
```

## Troubleshooting

### Module Not Found
Ensure you've installed dependencies and are in the correct directory:
```bash
pip install -r requirements.txt
```

### Tests Timeout
Increase the timeout in specific tests:
```python
@pytest.mark.timeout(30)
def test_function():
    # test code
```

### Virtual Environment Issues
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pytest
```

## Best Practices

1. ✅ Keep tests focused and isolated
2. ✅ Use descriptive test names
3. ✅ Test both happy paths and error cases
4. ✅ Use fixtures for common test data
5. ✅ Mock external dependencies when needed
6. ✅ Run tests before committing code
7. ✅ Aim for high code coverage
8. ✅ Use pytest markers for test organization

## Running Tests with Options

### Verbose output:
```bash
pytest -v
```

### Stop on first failure:
```bash
pytest -x
```

### Show print statements:
```bash
pytest -s
```

### Run specific test:
```bash
pytest tests/unit/test_simulator.py::TestValidateSimulationInput::test_valid_input
```

### Run tests matching pattern:
```bash
pytest -k "test_valid"
```

## Coverage Report

Generate HTML coverage report:
```bash
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

Generate terminal coverage report:
```bash
pytest --cov=app
```

## Performance Tips

1. Run tests in parallel (requires pytest-xdist):
   ```bash
   pip install pytest-xdist
   pytest -n auto
   ```

2. Use fixtures for efficient test setup
3. Keep unit tests fast by avoiding I/O
4. Use mocks for external service calls

