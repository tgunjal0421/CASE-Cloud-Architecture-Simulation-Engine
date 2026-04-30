const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample data - in a real app, this would come from a database
const DOMAIN_COMPONENTS = [
  {
    domain: "Compute",
    items: [
      { kind: "Virtual Machine", icon: "🖥️", description: "General purpose compute instance." },
      { kind: "Container Service", icon: "📦", description: "Runs containerized workloads." },
      { kind: "Serverless Function", icon: "⚙️", description: "Executes event-driven compute." }
    ]
  },
  {
    domain: "Storage",
    items: [
      { kind: "Object Storage", icon: "🗂️", description: "Durable blob/object storage." },
      { kind: "Block Storage", icon: "💽", description: "Persistent block volumes." },
      { kind: "File Storage", icon: "📁", description: "Shared network file system." }
    ]
  },
  {
    domain: "Database",
    items: [
      { kind: "SQL Database", icon: "🛢️", description: "Relational transactional database." },
      { kind: "NoSQL Database", icon: "📚", description: "Key-value or document store." },
      { kind: "Cache Layer", icon: "⚡", description: "Low-latency in-memory cache." }
    ]
  },
  {
    domain: "Network",
    items: [
      { kind: "Load Balancer", icon: "🔀", description: "Distributes incoming requests." },
      { kind: "API Gateway", icon: "🌐", description: "Routes and governs APIs." },
      { kind: "Message Queue", icon: "📨", description: "Asynchronous event buffering." }
    ]
  },
  {
    domain: "Security",
    items: [
      { kind: "Web Application Firewall", icon: "🛡️", description: "Filters malicious web traffic." },
      { kind: "Identity Service", icon: "👤", description: "Authentication and authorization." },
      { kind: "Secrets Vault", icon: "🔐", description: "Securely stores credentials and keys." }
    ]
  }
];

const TEMPLATES = {
  "3-tier web app": {
    nodes: [
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
      },
      {
        id: "n2",
        domain: "Compute",
        kind: "Container Service",
        icon: "CS",
        status: "healthy",
        rps: 185,
        latency: 55,
        x: 320,
        y: 110
      },
      {
        id: "n3",
        domain: "Database",
        kind: "SQL Database",
        icon: "SQL",
        status: "healthy",
        rps: 130,
        latency: 80,
        x: 560,
        y: 110
      }
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n3" }
    ]
  },
  "secure event pipeline": {
    nodes: [
      {
        id: "n1",
        domain: "Security",
        kind: "Web Application Firewall",
        icon: "WF",
        status: "healthy",
        rps: 150,
        latency: 20,
        x: 80,
        y: 110
      },
      {
        id: "n2",
        domain: "Network",
        kind: "Message Queue",
        icon: "MQ",
        status: "healthy",
        rps: 120,
        latency: 30,
        x: 320,
        y: 110
      },
      {
        id: "n3",
        domain: "Compute",
        kind: "Serverless Function",
        icon: "SF",
        status: "healthy",
        rps: 100,
        latency: 50,
        x: 560,
        y: 110
      }
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n3" }
    ]
  }
};

// Routes
app.get('/api/domains', (req, res) => {
  res.json(DOMAIN_COMPONENTS);
});

app.get('/api/templates', (req, res) => {
  res.json(TEMPLATES);
});

app.post('/api/simulate', (req, res) => {
  const { nodes, edges, steps = 10 } = req.body;
  
  if (!nodes || !edges) {
    return res.status(400).json({ error: 'Nodes and edges are required' });
  }

  // Simple simulation logic
  let currentNodes = [...nodes];
  const results = [currentNodes];

  for (let i = 0; i < steps; i++) {
    currentNodes = stepSimulation(currentNodes, edges);
    results.push(currentNodes);
  }

  res.json({ simulation: results });
});

// Basic simulation step function
function stepSimulation(nodes, edges) {
  const byId = new Map(nodes.map(node => [node.id, node]));
  const incoming = new Map();

  nodes.forEach(node => incoming.set(node.id, []));
  edges.forEach(edge => {
    if (incoming.has(edge.to)) {
      incoming.get(edge.to).push(edge.from);
    }
  });

  return nodes.map(node => {
    const upstreamIds = incoming.get(node.id) || [];
    const upstreamFlow = upstreamIds.reduce((sum, upstreamId) => {
      const upstreamNode = byId.get(upstreamId);
      if (!upstreamNode || upstreamNode.status === 'failed') {
        return sum;
      }
      return sum + upstreamNode.rps * 0.68;
    }, 0);

    const newRps = Math.max(0, upstreamFlow + (Math.random() - 0.5) * 20);
    const newLatency = Math.max(10, node.latency + (Math.random() - 0.5) * 10);

    return {
      ...node,
      rps: Math.round(newRps),
      latency: Math.round(newLatency),
      status: Math.random() < 0.95 ? 'healthy' : 'failed'
    };
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});