# Backend Source Code Structure

This directory contains the modular backend implementation for the CASE (Cloud Architecture Simulation Engine).

## Directory Structure

```
src/
├── index.js           # Main Express app setup and route configuration
├── data/              # Static data and constants
│   ├── components.js  # Cloud domain components
│   └── templates.js   # Predefined architecture templates
├── services/          # Business logic and core functionality
│   └── simulator.js   # Simulation engine
├── routes/            # API endpoint handlers
│   ├── domains.js     # Domain components endpoints
│   ├── templates.js   # Architecture templates endpoints
│   └── simulate.js    # Simulation execution endpoints
└── middleware/        # Express middleware (for future expansion)
```

## Module Descriptions

### index.js
**Purpose**: Entry point for the Express application
- Creates and configures the Express app
- Sets up middleware (CORS, JSON parsing, logging)
- Mounts all route handlers
- Implements error handling
- Exports the configured app

**Key Exports**:
- `app`: Configured Express application

### data/components.js
**Purpose**: Static domain components data
- Contains all available cloud architecture components
- Organized by domain (Compute, Storage, Database, Network, Security)
- Each component includes icon, description, and kind

**Key Exports**:
- `DOMAIN_COMPONENTS`: Array of domain groups with items

**Example**:
```javascript
{
  domain: "Compute",
  items: [
    {
      kind: "Virtual Machine",
      icon: "🖥️",
      description: "General purpose compute instance."
    },
    ...
  ]
}
```

### data/templates.js
**Purpose**: Predefined architecture templates
- Provides example architectures users can start with
- Each template includes nodes and edges defining the architecture
- Currently includes "3-tier web app" and "secure event pipeline"

**Key Exports**:
- `TEMPLATES`: Object mapping template names to architectures

### services/simulator.js
**Purpose**: Core simulation engine logic
- Calculates architecture performance metrics
- Simulates traffic flow and component degradation
- Validates simulation inputs

**Key Functions**:

#### `validateSimulationInput(input)`
Validates simulation request input
- **Parameters**: Input object with nodes and edges
- **Returns**: `{ isValid: boolean, error: string|null }`

#### `stepSimulation(nodes, edges)`
Executes a single simulation step
- **Parameters**: 
  - `nodes`: Array of node objects with metrics
  - `edges`: Array of connections between nodes
- **Returns**: Updated nodes array with new metrics
- **Algorithm**:
  - Calculate traffic flow from upstream nodes
  - Apply 68% throughput efficiency
  - Add random variation for real-world simulation
  - Update node statuses (95% healthy, 5% failed)

#### `runSimulation(nodes, edges, steps)`
Executes complete simulation for multiple steps
- **Parameters**:
  - `nodes`: Initial node states
  - `edges`: Edge connections
  - `steps`: Number of simulation steps (default: 10)
- **Returns**: Array of node states at each step

### routes/domains.js
**Purpose**: Handle domain component API endpoints

**Endpoints**:
- `GET /api/domains`: Return all domain components

**Middleware**: Error handling for data retrieval

### routes/templates.js
**Purpose**: Handle template management endpoints

**Endpoints**:
- `GET /api/templates`: Return all templates
- `GET /api/templates/:name`: Return specific template

**Features**:
- Name-based template lookup
- 404 handling for non-existent templates

### routes/simulate.js
**Purpose**: Handle simulation execution

**Endpoints**:
- `POST /api/simulate`: Run architecture simulation

**Request Body**:
```javascript
{
  nodes: [/* array of nodes */],
  edges: [/* array of edges */],
  steps: 10  // optional, default 10, max 1000
}
```

**Response**:
```javascript
{
  success: true,
  steps: 10,
  simulation: [/* array of node states */]
}
```

**Features**:
- Input validation
- Parameter boundaries (1-1000 steps)
- Error responses with clear messages

## Data Models

### Node
```javascript
{
  id: string,           // Unique identifier
  domain: string,       // Domain type (Compute, Storage, etc.)
  kind: string,        // Component type (VM, Database, etc.)
  icon: string,        // Display icon
  status: string,      // 'healthy' or 'failed'
  rps: number,         // Requests per second
  latency: number,     // Latency in milliseconds
  x: number,           // Canvas x coordinate (optional)
  y: number            // Canvas y coordinate (optional)
}
```

### Edge
```javascript
{
  id: string,          // Unique identifier
  from: string,        // Source node ID
  to: string           // Target node ID
}
```

## Application Flow

1. **Request arrives** → `index.js` routes to appropriate handler
2. **Validation** → Route validates input using `services/simulator.js`
3. **Processing** → Service executes business logic
4. **Response** → Route formats and sends response

Example for simulation:
```
POST /api/simulate
  ↓
routes/simulate.js
  ↓
validateSimulationInput() (services/simulator.js)
  ↓
runSimulation() (services/simulator.js)
  ↓
Response with results
```

## Design Patterns

### Separation of Concerns
- **Routes**: Handle HTTP requests/responses
- **Services**: Implement business logic
- **Data**: Manage static data and constants

### Input Validation
- Centralized validation in service layer
- Clear error messages returned to client
- Boundary checking on numeric parameters

### Error Handling
- Try-catch blocks in routes
- Consistent error response format
- HTTP status codes reflect error type (400, 404, 500)

## Adding New Features

### Adding a New Endpoint
1. Create route file in `routes/`
2. Implement route handlers
3. Export router from `index.js` and mount it
4. Add corresponding tests

### Adding Business Logic
1. Create service in `services/`
2. Export functions from module
3. Import and use in routes
4. Add unit tests

### Adding Static Data
1. Create file in `data/`
2. Export constant
3. Import in routes/services as needed

## Dependencies

- `express`: Web framework
- `cors`: CORS middleware
- Built-in Node.js modules: No external ones

Dev dependencies for testing:
- `jest`: Testing framework
- `supertest`: HTTP testing library
