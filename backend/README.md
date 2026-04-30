# CASE Backend

Backend API for the Cloud Architecture Simulation Engine (CASE).

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3000` by default.

## API Endpoints

### GET /api/domains
Returns the available domain components for building architectures.

**Response:**
```json
[
  {
    "domain": "Compute",
    "items": [
      {
        "kind": "Virtual Machine",
        "icon": "🖥️",
        "description": "General purpose compute instance."
      }
    ]
  }
]
```

### GET /api/templates
Returns predefined architecture templates.

**Response:**
```json
{
  "3-tier web app": {
    "nodes": [...],
    "edges": [...]
  }
}
```

### POST /api/simulate
Runs a simulation on the provided architecture.

**Request Body:**
```json
{
  "nodes": [...],
  "edges": [...],
  "steps": 10
}
```

**Response:**
```json
{
  "simulation": [
    [...], // Initial state
    [...]  // After step 1
  ]
}
```

## Architecture

- **Express.js**: Web framework for Node.js
- **CORS**: Cross-origin resource sharing support
- **Simulation Engine**: Basic flow-based simulation logic

## Future Enhancements

- Database integration for storing architectures
- User authentication
- Advanced simulation algorithms
- Real-time simulation updates via WebSockets