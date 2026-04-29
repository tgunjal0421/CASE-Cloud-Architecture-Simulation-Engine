export const TEMPLATES = {
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
        rps: 200,
        latency: 25,
        x: 80,
        y: 90
      },
      {
        id: "n2",
        domain: "Network",
        kind: "API Gateway",
        icon: "GW",
        status: "healthy",
        rps: 170,
        latency: 37,
        x: 290,
        y: 90
      },
      {
        id: "n3",
        domain: "Network",
        kind: "Message Queue",
        icon: "MQ",
        status: "healthy",
        rps: 150,
        latency: 32,
        x: 500,
        y: 90
      },
      {
        id: "n4",
        domain: "Compute",
        kind: "Serverless Function",
        icon: "SF",
        status: "healthy",
        rps: 140,
        latency: 60,
        x: 500,
        y: 245
      }
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n3" },
      { id: "e3", from: "n3", to: "n4" }
    ]
  }
};
