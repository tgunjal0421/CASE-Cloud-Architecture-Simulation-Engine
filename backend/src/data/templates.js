// Predefined architecture templates
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

module.exports = TEMPLATES;
