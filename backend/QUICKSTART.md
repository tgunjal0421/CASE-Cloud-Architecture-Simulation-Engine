# Quick Start Guide - CASE Backend (Python/FastAPI)

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python3 run.py
```

Server will run on: **http://localhost:3001**

### 3. Access API Documentation
Open in browser:
- **Swagger UI**: http://localhost:3001/docs
- **ReDoc**: http://localhost:3001/redoc

## Run Tests

```bash
# All tests
pytest

# Specific test type
pytest tests/unit -v
pytest tests/integration -v

# With coverage
pytest --cov=app
```

## Common Commands

### Development
```bash
python3 run.py              # Start with auto-reload
```

### Production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 3001
```

### Testing
```bash
pytest                      # Run all tests
pytest -v                   # Verbose output
pytest -s                   # Show print statements
pytest --cov=app            # With coverage
pytest -k test_name         # Run specific test
```

### Manual API Testing
```bash
# Start server in one terminal
python3 run.py

# In another terminal
curl http://localhost:3001/              # Health check
curl http://localhost:3001/api/domains/  # Get domains
curl http://localhost:3001/api/templates/ # Get templates

# Simulation
curl -X POST http://localhost:3001/api/simulate/ \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": [{"id": "n1", "rps": 100, "latency": 50, "status": "healthy"}],
    "edges": [],
    "steps": 5
  }'
```

## Project Structure

```
app/
├── main.py           # FastAPI app
├── models.py         # Pydantic models
├── data/             # Static data
├── services/         # Business logic
└── routes/           # API endpoints

tests/
├── unit/             # Unit tests
└── integration/      # Integration tests
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Health check |
| GET | /api/domains/ | Get all domains |
| GET | /api/templates/ | Get all templates |
| GET | /api/templates/{name} | Get specific template |
| POST | /api/simulate/ | Run simulation |

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Import Errors
```bash
# Ensure virtual env is active and deps installed
pip install -r requirements.txt
```

### Test Issues
```bash
# Make sure you're in the right directory
cd /path/to/backend
pytest tests/
```

## Features

✅ Type-safe with Pydantic
✅ Async FastAPI framework
✅ 38 comprehensive tests
✅ Auto-generated API docs
✅ CORS enabled
✅ Full error handling
✅ Production ready

## Documentation

- **Full Guide**: See `PYTHON_README.md`
- **Migration Info**: See `MIGRATION_SUMMARY.md`
- **Testing Guide**: See `tests/README.md`
- **API Docs**: http://localhost:3001/docs (when running)

## Files to Know

- `run.py` - Server entry point
- `app/main.py` - FastAPI application
- `app/services/simulator.py` - Core logic
- `requirements.txt` - Dependencies
- `pytest.ini` - Test configuration

## Next Steps

1. ✅ Install deps: `pip install -r requirements.txt`
2. ✅ Start server: `python3 run.py`
3. ✅ Run tests: `pytest`
4. ✅ Check docs: http://localhost:3001/docs
5. ✅ Explore API endpoints

Happy testing! 🚀
