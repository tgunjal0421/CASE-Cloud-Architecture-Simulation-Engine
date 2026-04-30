# CASE Backend - Python/FastAPI Implementation

## Overview

This directory contains the Python/FastAPI implementation of the CASE (Cloud Architecture Simulation Engine) backend. It has been completely refactored from Node.js/Express to Python/FastAPI with comprehensive pytest testing.

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app setup
│   ├── models.py               # Pydantic models
│   ├── data/
│   │   ├── __init__.py
│   │   ├── components.py       # Domain components
│   │   └── templates.py        # Architecture templates
│   ├── services/
│   │   ├── __init__.py
│   │   └── simulator.py        # Simulation logic
│   └── routes/
│       ├── __init__.py
│       ├── domains.py          # Domains endpoints
│       ├── templates.py        # Templates endpoints
│       └── simulate.py         # Simulation endpoints
├── tests/
│   ├── __init__.py
│   ├── unit/
│   │   ├── __init__.py
│   │   └── test_simulator.py   # Simulator unit tests
│   └── integration/
│       ├── __init__.py
│       └── test_api.py         # API integration tests
├── run.py                      # Entry point
├── requirements.txt            # Python dependencies
└── pytest.ini                  # Pytest configuration
```

## Setup & Installation

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation Steps

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Running the Server

### Development Mode (with auto-reload)
```bash
python3 run.py
```

The server will start on `http://localhost:3001`

### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 3001
```

## Testing

### Run All Tests
```bash
pytest
```

### Run Unit Tests Only
```bash
pytest tests/unit -v
```

### Run Integration Tests Only
```bash
pytest tests/integration -v
```

### Run with Coverage Report
```bash
pytest --cov=app --cov-report=html
```

### Using Test Runner Script
```bash
chmod +x tests/scripts/runTests.sh
./tests/scripts/runTests.sh all        # Run all tests
./tests/scripts/runTests.sh unit       # Run unit tests
./tests/scripts/runTests.sh integration # Run integration tests
./tests/scripts/runTests.sh coverage   # Generate coverage report
```

### Manual API Testing
```bash
chmod +x tests/scripts/manual-test.sh
./tests/scripts/manual-test.sh
```

## API Endpoints

### Health Check
```
GET /
```
Returns service status and version information.

### Get Domains
```
GET /api/domains/
```
Returns all available cloud architecture domains and components.

### Get Templates
```
GET /api/templates/
```
Returns all predefined architecture templates.

### Get Specific Template
```
GET /api/templates/{template_name}
```
Returns a specific template by name.

### Run Simulation
```
POST /api/simulate/
Content-Type: application/json

{
  "nodes": [
    {
      "id": "n1",
      "domain": "Network",
      "kind": "Load Balancer",
      "status": "healthy",
      "rps": 100,
      "latency": 50,
      "x": 100,
      "y": 100
    }
  ],
  "edges": [
    {"id": "e1", "from": "n1", "to": "n2"}
  ],
  "steps": 10
}
```

Returns simulation results showing node metrics evolution over time.

## Dependencies

### Core Dependencies
- **fastapi**: Modern web framework for building APIs
- **uvicorn**: ASGI server to run FastAPI applications
- **pydantic**: Data validation using Python type annotations

### Testing Dependencies
- **pytest**: Testing framework
- **pytest-asyncio**: Support for async tests
- **httpx**: Async HTTP client for testing

### Development Dependencies (optional)
- **python-dotenv**: Load environment variables from .env files

## Key Modules

### app/main.py
Main FastAPI application with:
- CORS middleware configuration
- Route registration
- Request logging
- Error handling
- Health check endpoint

### app/models.py
Pydantic models for request/response validation:
- `Node`: Cloud component node
- `Edge`: Connection between nodes
- `SimulationRequest`: Simulation input
- `SimulationResponse`: Simulation output
- `HealthResponse`: Health check response
- `ErrorResponse`: Error responses

### app/services/simulator.py
Core simulation logic:
- `validate_simulation_input()`: Input validation
- `step_simulation()`: Single simulation step
- `run_simulation()`: Complete simulation execution

### app/routes/
FastAPI route handlers:
- `domains.py`: Domain components endpoints
- `templates.py`: Template management endpoints
- `simulate.py`: Simulation endpoints

### app/data/
Static data:
- `components.py`: Cloud architecture components
- `templates.py`: Predefined templates

## Testing Strategy

### Unit Tests (test_simulator.py)
Tests for simulation logic:
- Input validation
- Single step execution
- Complete simulation runs
- Edge case handling

### Integration Tests (test_api.py)
Tests for API endpoints:
- Health check endpoint
- Domains endpoint
- Templates endpoints
- Simulation endpoint
- Error handling
- Request/response validation

**Total Coverage**: 38+ tests, covering all major functionality

## Simulation Algorithm

The simulator models cloud architecture performance:

1. **Traffic Flow**: Requests flow from upstream to downstream components
2. **Throughput Efficiency**: Each component processes 68% of incoming traffic
3. **Random Variation**: Adds real-world variability to metrics
4. **Component Failure**: 5% failure rate to simulate degradation
5. **Health Tracking**: Components can be healthy or failed

## Development Workflow

### Adding a New Endpoint
1. Create route handler in `app/routes/`
2. Define request/response models in `app/models.py`
3. Add service logic in `app/services/` if needed
4. Register route in `app/main.py`
5. Write tests in `tests/integration/`

### Adding Business Logic
1. Create function in `app/services/`
2. Write unit tests in `tests/unit/`
3. Use in route handlers

### Error Handling
- Use FastAPI's `HTTPException` for API errors
- Provide clear error messages
- Use appropriate HTTP status codes

## Environment Variables

- `PORT`: Server port (default: 3001)

## Performance Considerations

- FastAPI is async by default for better concurrency
- Pydantic provides fast validation
- Route handlers use async patterns

## Migration from Node.js

### Key Differences:
- **Framework**: FastAPI instead of Express
- **Type Safety**: Pydantic models for validation
- **Testing**: pytest instead of Jest
- **Package Management**: pip/requirements.txt instead of npm
- **Async**: Native async/await support in FastAPI

### Equivalent Functionality:
- Same API endpoints and responses
- Same data models
- Same simulation algorithm
- Same error handling patterns

## Troubleshooting

### Port Already in Use
```bash
lsof -ti:3001 | xargs kill -9
```

### Virtual Environment Issues
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Import Errors
Ensure you're in the correct directory and virtual environment is activated:
```bash
cd /path/to/backend
source venv/bin/activate
python3 run.py
```

### Test Failures
Check that all dependencies are installed:
```bash
pip install -r requirements.txt
pytest tests/
```

## Documentation

- [API Documentation](http://localhost:3001/docs) - Swagger UI (when server running)
- [ReDoc Documentation](http://localhost:3001/redoc) - Alternative documentation

## Future Enhancements

- Database integration for persistent storage
- Authentication and authorization
- More advanced simulation models
- Performance metrics and monitoring
- WebSocket support for real-time updates
- Docker containerization
- CI/CD pipeline integration
