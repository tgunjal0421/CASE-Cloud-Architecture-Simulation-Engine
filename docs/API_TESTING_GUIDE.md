# CASE Simulator API Testing Guide

## Base URL
```
http://localhost:8000
```

## Health Check Endpoints

### 1. Root Health Check
**Method:** GET  
**Endpoint:** `/`  
**Description:** Basic health check to verify API is running

**Expected Response:**
```json
{
  "service": "CASE Simulator API",
  "version": "1.0.0",
  "status": "running"
}
```

### 2. Health Endpoint
**Method:** GET  
**Endpoint:** `/health`  
**Description:** Detailed health check

**Expected Response:**
```json
{
  "status": "ok"
}
```

---

## Architecture API

### 3. Save Architecture
**Method:** POST  
**Endpoint:** `/api/architecture`  
**Description:** Save a new architecture with nodes and edges

**Request Body:**
```json
{
  "name": "Three-Tier Architecture",
  "nodes": [
    {
      "id": "lb-1",
      "type": "caseNode",
      "position": { "x": 250, "y": 60 },
      "data": {
        "label": "Load Balancer",
        "type": "loadbalancer",
        "color": "#3b82f6",
        "icon": "server",
        "config_values": {
          "instanceType": "t3.medium",
          "numberOfInstances": 2
        },
        "summary_lines": ["Type: t3.medium", "Instances: 2"]
      }
    },
    {
      "id": "vm-1",
      "type": "caseNode",
      "position": { "x": 100, "y": 200 },
      "data": {
        "label": "App Server 1",
        "type": "vm",
        "color": "#10b981",
        "icon": "cpu",
        "config_values": {
          "os": "Ubuntu 22.04",
          "vcpu": 2,
          "memory": 4
        },
        "summary_lines": ["OS: Ubuntu 22.04", "vCPU: 2", "Memory: 4GB"]
      }
    },
    {
      "id": "db-1",
      "type": "caseNode",
      "position": { "x": 200, "y": 360 },
      "data": {
        "label": "Primary DB",
        "type": "database",
        "color": "#f59e0b",
        "icon": "database",
        "config_values": {
          "engine": "PostgreSQL",
          "version": "14",
          "storage": 100
        },
        "summary_lines": ["Engine: PostgreSQL 14", "Storage: 100GB"]
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "lb-1",
      "target": "vm-1"
    },
    {
      "id": "e2",
      "source": "vm-1",
      "target": "db-1"
    }
  ]
}
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "saved_at": "2024-07-16T08:00:00Z"
}
```

**Test Cases:**
- Save simple architecture with 1 node
- Save complex architecture with multiple nodes and edges
- Save architecture with missing required fields (should fail)
- Save architecture with invalid node types (should fail)

---

### 4. List All Architectures
**Method:** GET  
**Endpoint:** `/api/architecture`  
**Description:** Get list of all saved architectures (summary only)

**Expected Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Three-Tier Architecture",
    "node_count": 3,
    "updated_at": "2024-07-16T08:00:00Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Microservices",
    "node_count": 5,
    "updated_at": "2024-07-16T08:05:00Z"
  }
]
```

**Test Cases:**
- Get empty list (no architectures saved)
- Get list with multiple architectures
- Verify node_count is accurate

---

### 5. Get Specific Architecture
**Method:** GET  
**Endpoint:** `/api/architecture/{arch_id}`  
**Description:** Get full architecture details including all nodes and edges

**URL Parameters:**
- `arch_id`: Architecture ID from save response

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Three-Tier Architecture",
  "nodes": [
    {
      "id": "lb-1",
      "type": "caseNode",
      "position": { "x": 250, "y": 60 },
      "data": {
        "label": "Load Balancer",
        "type": "loadbalancer",
        "color": "#3b82f6",
        "icon": "server",
        "config_values": { "instanceType": "t3.medium" },
        "summary_lines": ["Type: t3.medium"]
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "lb-1",
      "target": "vm-1"
    }
  ],
  "created_at": "2024-07-16T08:00:00Z",
  "updated_at": "2024-07-16T08:00:00Z"
}
```

**Test Cases:**
- Get valid architecture
- Get non-existent architecture (should return 404)
- Verify all node data is preserved
- Verify all edges are preserved

---

### 6. Update Node Position
**Method:** PATCH  
**Endpoint:** `/api/architecture/{arch_id}/nodes/{node_id}/position`  
**Description:** Update canvas position of a specific node

**URL Parameters:**
- `arch_id`: Architecture ID
- `node_id`: Node ID to update

**Request Body:**
```json
{
  "x": 350,
  "y": 150
}
```

**Expected Response:**
```json
{
  "ok": true
}
```

**Test Cases:**
- Update position of valid node
- Update position of non-existent node (should return 404)
- Update with invalid coordinates (negative numbers)

---

### 7. Update Node Configuration
**Method:** PATCH  
**Endpoint:** `/api/architecture/{arch_id}/nodes/{node_id}/config`  
**Description:** Update configuration of a specific node

**URL Parameters:**
- `arch_id`: Architecture ID
- `node_id`: Node ID to update

**Request Body:**
```json
{
  "label": "Updated App Server",
  "type": "vm",
  "color": "#10b981",
  "icon": "cpu",
  "config_values": {
    "os": "Ubuntu 22.04",
    "vcpu": 4,
    "memory": 8
  },
  "summary_lines": ["OS: Ubuntu 22.04", "vCPU: 4", "Memory: 8GB"]
}
```

**Expected Response:**
```json
{
  "ok": true
}
```

**Test Cases:**
- Update config of valid node
- Update config of non-existent node (should return 404)
- Update with invalid config values

---

### 8. Delete Architecture
**Method:** DELETE  
**Endpoint:** `/api/architecture/{arch_id}`  
**Description:** Delete an architecture and all its nodes/edges

**URL Parameters:**
- `arch_id`: Architecture ID to delete

**Expected Response:**
```json
{
  "ok": true
}
```

**Test Cases:**
- Delete valid architecture
- Delete non-existent architecture (should return 404)
- Verify cascade delete removes all nodes and edges

---

## Simulation API

### 9. Start Simulation
**Method:** POST  
**Endpoint:** `/api/simulation/start`  
**Description:** Start a new simulation run

**Query Parameters:**
- `architecture_id` (optional): Architecture ID to associate with simulation

**Request Body:**
```json
{
  "nodes": [
    {
      "id": "lb-1",
      "data": {
        "type": "loadbalancer",
        "label": "Load Balancer",
        "config_values": {
          "instanceType": "t3.medium",
          "numberOfInstances": 2
        }
      }
    },
    {
      "id": "vm-1",
      "data": {
        "type": "vm",
        "label": "App Server",
        "config_values": {
          "os": "Ubuntu 22.04",
          "vcpu": 2,
          "memory": 4
        }
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "lb-1",
      "target": "vm-1"
    }
  ],
  "traffic_multiplier": 1.0,
  "failure_mode": false
}
```

**Expected Response:**
```json
{
  "run_id": "770e8400-e29b-41d4-a716-446655440002",
  "status": "success",
  "duration_ms": 150,
  "summary": "Simulation complete — 2 nodes, ×1 traffic, 45ms avg latency",
  "system_metrics": {
    "total_throughput": 150.5,
    "avg_latency": 45.2,
    "error_rate": 0.0,
    "active_requests": 3,
    "dropped_requests": 0
  },
  "node_metrics": [
    {
      "node_id": "lb-1",
      "throughput": 75.3,
      "latency": 25.1,
      "error_rate": 0.0,
      "is_failed": false,
      "is_overloaded": false
    }
  ],
  "logs": [
    {
      "id": "log-1",
      "timestamp": "08:00:00",
      "level": "success",
      "request_id": 1001,
      "message": "Req 1001: Load Balancer → App Server | total 45ms"
    }
  ]
}
```

**Test Cases:**
- Start simulation with simple architecture
- Start simulation with high traffic multiplier (5.0)
- Start simulation with failure mode enabled
- Start simulation with no nodes (should return empty result)
- Start simulation with invalid node types

---

### 10. Get Simulation State
**Method:** GET  
**Endpoint:** `/api/simulation/{run_id}`  
**Description:** Get current simulation state from Redis

**URL Parameters:**
- `run_id`: Simulation run ID from start response

**Expected Response:**
```json
{
  "run_id": "770e8400-e29b-41d4-a716-446655440002",
  "status": "running",
  "config": {
    "traffic": 1.0,
    "chaos": false,
    "failed_nodes": []
  },
  "system_metrics": {
    "total_throughput": 150.5,
    "avg_latency": 45.2,
    "error_rate": 0.0,
    "active_requests": 3,
    "dropped_requests": 0
  },
  "node_metrics": {
    "lb-1": {
      "throughput": 75.3,
      "latency": 25.1,
      "error_rate": 0.0,
      "is_failed": false,
      "is_overloaded": false
    }
  },
  "active_edges": ["e1"],
  "logs": []
}
```

**Test Cases:**
- Get state of running simulation
- Get state of non-existent simulation (should return 404)
- Get state of expired simulation (should return 404)

---

11. Stop Simulation
**Method:** POST  
**Endpoint:** `/api/simulation/{run_id}/stop`  
**Description:** Stop a running simulation

**URL Parameters:**
- `run_id`: Simulation run ID to stop

**Expected Response:**
```json
{
  "run_id": "770e8400-e29b-41d4-a716-446655440002",
  "status": "stopped"
}
```

**Test Cases:**
- Stop running simulation
- Stop already stopped simulation
- Stop non-existent simulation

---

### 12. Toggle Node Failure
**Method:** POST  
**Endpoint:** `/api/simulation/{run_id}/toggle-failure`  
**Description:** Toggle failure state for a specific node during simulation

**URL Parameters:**
- `run_id`: Simulation run ID

**Request Body:**
```json
{
  "node_id": "vm-1"
}
```

**Expected Response:**
```json
{
  "failed_nodes": ["vm-1"]
}
```

**Test Cases:**
- Mark node as failed
- Mark node as recovered (toggle again)
- Toggle non-existent node
- Toggle node in non-existent simulation

---

### 13. Get Simulation Logs
**Method:** GET  
**Endpoint:** `/api/simulation/{run_id}/logs`  
**Description:** Get recent log entries from simulation

**URL Parameters:**
- `run_id`: Simulation run ID

**Query Parameters:**
- `limit` (optional): Number of log entries to return (default: 50, max: 200)

**Expected Response:**
```json
{
  "run_id": "770e8400-e29b-41d4-a716-446655440002",
  "logs": [
    {
      "id": "log-1",
      "timestamp": "08:00:00",
      "level": "success",
      "request_id": 1001,
      "message": "Req 1001: Load Balancer → App Server | total 45ms"
    },
    {
      "id": "log-2",
      "timestamp": "08:00:01",
      "level": "error",
      "request_id": 1002,
      "message": "Req 1002 DROPPED — App Server is FAILED"
    }
  ]
}
```

**Test Cases:**
- Get logs with default limit
- Get logs with custom limit (10)
- Get logs with limit > 200 (should cap at 200)
- Get logs from simulation with no logs

---

### 14. Get Simulation History
**Method:** GET  
**Endpoint:** `/api/simulation/history/{architecture_id}`  
**Description:** Get historical simulation runs for a specific architecture

**URL Parameters:**
- `architecture_id`: Architecture ID

**Expected Response:**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "architecture_id": "550e8400-e29b-41d4-a716-446655440000",
    "traffic_multiplier": 1.0,
    "failure_mode": false,
    "status": "completed",
    "avg_latency_ms": 45.2,
    "total_throughput": 150.5,
    "error_rate": 0.0,
    "dropped_requests": 0,
    "started_at": "2024-07-16T08:00:00Z",
    "completed_at": "2024-07-16T08:00:01Z"
  }
]
```

**Test Cases:**
- Get history for architecture with simulations
- Get history for architecture with no simulations
- Get history for non-existent architecture

---

## Metrics API

### 15. Get Latest Metrics
**Method:** GET  
**Endpoint:** `/api/metrics/latest`  
**Description:** Get latest metrics for dashboard charts

**Query Parameters:**
- `run_id` (optional): Specific simulation run ID to get metrics from

**Expected Response:**
```json
{
  "latency": [
    {
      "time": "00:00",
      "p50": 25.2,
      "p95": 45.2,
      "p99": 67.8
    }
  ],
  "throughput": [
    {
      "time": "00:00",
      "rps": 150.5
    }
  ],
  "resources": [
    {
      "resource": "CPU",
      "usage": 62.0,
      "max": 100,
      "unit": "%"
    },
    {
      "resource": "Memory",
      "usage": 74.0,
      "max": 100,
      "unit": "%"
    },
    {
      "resource": "Network",
      "usage": 38.0,
      "max": 100,
      "unit": "%"
    },
    {
      "resource": "Disk I/O",
      "usage": 28.0,
      "max": 100,
      "unit": "%"
    }
  ]
}
```

**Test Cases:**
- Get metrics without run_id (returns latest from PostgreSQL)
- Get metrics with valid run_id (returns from Redis)
- Get metrics with non-existent run_id (falls back to PostgreSQL)
- Get metrics when no simulations exist (returns mock data)

---

### 16. Get Cost Estimate
**Method:** GET  
**Endpoint:** `/api/metrics/cost/estimate`  
**Description:** Estimate monthly cloud cost based on architecture

**Query Parameters:**
- `node_count` (optional): Number of nodes (default: 1, max: 500)
- `node_types` (optional): Comma-separated list of node types

**Example Requests:**
```
GET /api/metrics/cost/estimate?node_count=5
GET /api/metrics/cost/estimate?node_count=3&node_types=vm,vm,database
GET /api/metrics/cost/estimate?node_types=loadbalancer,vm,vm,postgresql,storage
```

**Expected Response:**
```json
{
  "compute": {
    "label": "Compute",
    "amount": 125.0,
    "unit": "$/mo"
  },
  "storage": {
    "label": "Storage",
    "amount": 12.8,
    "unit": "$/mo"
  },
  "network": {
    "label": "Network Egress",
    "amount": 8.5,
    "unit": "$/mo"
  },
  "total": {
    "label": "Est. Total",
    "amount": 146.3,
    "unit": "$/mo"
  }
}
```

**Test Cases:**
- Get cost estimate with node_count only
- Get cost estimate with node_types only
- Get cost estimate with both parameters
- Get cost estimate with invalid node_count (> 500)
- Get cost estimate with mixed node types

---

## Testing Workflow

### Recommended Test Sequence:

1. **Health Check**
   - Test GET `/` and GET `/health`

2. **Architecture CRUD**
   - POST `/api/architecture` - Create test architecture
   - GET `/api/architecture` - List architectures
   - GET `/api/architecture/{id}` - Get specific architecture
   - PATCH `/api/architecture/{id}/nodes/{node_id}/position` - Update position
   - PATCH `/api/architecture/{id}/nodes/{node_id}/config` - Update config
   - DELETE `/api/architecture/{id}` - Clean up

3. **Simulation Flow**
   - POST `/api/simulation/start` - Start simulation
   - GET `/api/simulation/{run_id}` - Check state
   - POST `/api/simulation/{run_id}/toggle-failure` - Test failure mode
   - GET `/api/simulation/{run_id}/logs` - Check logs
   - POST `/api/simulation/{run_id}/stop` - Stop simulation
   - GET `/api/simulation/history/{arch_id}` - Check history

4. **Metrics**
   - GET `/api/metrics/latest` - Get metrics
   - GET `/api/metrics/cost/estimate` - Get cost estimate

---

## Thunder Client Setup

### Collection Structure:
```
CASE Simulator API
├── Health
│   ├── Root Health Check
│   └── Health Endpoint
├── Architecture
│   ├── Save Architecture
│   ├── List Architectures
│   ├── Get Architecture
│   ├── Update Node Position
│   ├── Update Node Config
│   └── Delete Architecture
├── Simulation
│   ├── Start Simulation
│   ├── Get Simulation State
│   ├── Stop Simulation
│   ├── Toggle Node Failure
│   ├── Get Simulation Logs
│   └── Get Simulation History
└── Metrics
    ├── Get Latest Metrics
    └── Get Cost Estimate
```

### Environment Variables:
```
base_url = http://localhost:8000
arch_id = {{architecture_id}}
run_id = {{simulation_run_id}}
node_id = {{node_id}}
```

### Tips:
- Use Thunder Client's environment variables to store IDs between requests
- Save successful responses as examples for future reference
- Use the "Run Collection" feature to execute multiple tests in sequence
- Check response times to ensure performance is acceptable
