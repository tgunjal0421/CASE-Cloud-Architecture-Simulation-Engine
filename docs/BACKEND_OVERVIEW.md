# Backend Overview

The CASE (Cloud Architecture Simulation Engine) backend provides RESTful APIs to support the frontend simulation interface. It serves domain components, templates, and handles simulation computations.

## Architecture

The backend is built with Node.js and Express.js, providing a lightweight API server that can be easily deployed and scaled.

### Key Components

- **API Server**: Express.js application serving REST endpoints
- **Simulation Engine**: Server-side computation of architecture performance metrics
- **Data Layer**: In-memory data store (can be extended to database)

## API Design

### Endpoints

1. **Domain Components** (`/api/domains`)
   - Purpose: Provide available cloud components organized by domain
   - Method: GET
   - Response: Array of domain groups with component items

2. **Templates** (`/api/templates`)
   - Purpose: Serve predefined architecture templates
   - Method: GET
   - Response: Object mapping template names to node/edge structures

3. **Simulation** (`/api/simulate`)
   - Purpose: Run performance simulations on architectures
   - Method: POST
   - Request: Architecture definition (nodes, edges, simulation parameters)
   - Response: Time-series simulation results

### Data Models

#### Component
```javascript
{
  domain: "Compute",
  kind: "Virtual Machine",
  icon: "🖥️",
  description: "General purpose compute instance."
}
```

#### Node
```javascript
{
  id: "n1",
  domain: "Network",
  kind: "Load Balancer",
  icon: "LB",
  status: "healthy",
  rps: 220,
  latency: 28,
  x: 80,
  y: 110
}
```

#### Edge
```javascript
{
  id: "e1",
  from: "n1",
  to: "n2"
}
```

## Simulation Logic

The simulation engine models cloud architecture performance using a flow-based approach:

1. **Traffic Flow**: Requests flow from upstream to downstream components
2. **Performance Metrics**: Each component has RPS (requests per second) and latency
3. **Dependencies**: Component performance affects downstream components
4. **Failure Modeling**: Components can fail randomly, affecting the entire flow

### Algorithm

For each simulation step:
1. Calculate incoming traffic for each node based on upstream RPS
2. Apply component-specific processing (68% throughput assumption)
3. Add random variation to simulate real-world conditions
4. Update status (95% healthy, 5% failed)

## Deployment

The backend can be deployed as a standalone service or containerized with Docker.

### Environment Variables

- `PORT`: Server port (default: 3000)

### Health Checks

The server provides basic health check via root endpoint (`/`).

## Security Considerations

- CORS enabled for frontend integration
- Input validation on simulation requests
- Rate limiting should be added for production use

## Future Development

- **Database Integration**: Persistent storage for user architectures
- **Authentication**: User sessions and saved simulations
- **Advanced Simulation**: More sophisticated performance modeling
- **Real-time Updates**: WebSocket support for live simulation
- **Load Testing**: Integration with actual cloud provider APIs