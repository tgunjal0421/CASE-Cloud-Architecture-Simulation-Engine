export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString();
}

export function createNode(component, index, position) {
  return {
    id: `n${Date.now()}-${index}`,
    domain: component.domain,
    kind: component.kind,
    icon: component.icon,
    status: "healthy",
    rps: 110 + Math.round(Math.random() * 110),
    latency: 24 + Math.round(Math.random() * 65),
    x: position.x,
    y: position.y
  };
}

function buildIncomingMap(nodes, edges) {
  const incoming = new Map();
  const outgoing = new Map();

  nodes.forEach((node) => {
    incoming.set(node.id, []);
    outgoing.set(node.id, []);
  });

  edges.forEach((edge) => {
    if (!incoming.has(edge.to) || !outgoing.has(edge.from)) {
      return;
    }
    incoming.get(edge.to).push(edge.from);
    outgoing.get(edge.from).push(edge.to);
  });

  return { incoming, outgoing };
}

export function stepSimulation(previousNodes, edges, trafficMultiplier) {
  const byId = new Map(previousNodes.map((node) => [node.id, node]));
  const { incoming } = buildIncomingMap(previousNodes, edges);

  return previousNodes.map((node) => {
    const upstreamIds = incoming.get(node.id) || [];
    const upstreamFlow = upstreamIds.reduce((sum, upstreamId) => {
      const upstreamNode = byId.get(upstreamId);
      if (!upstreamNode || upstreamNode.status === "failed") {
        return sum;
      }
      return sum + upstreamNode.rps * 0.68;
    }, 0);

    const hasNoIncoming = upstreamIds.length === 0;
    const sourceTraffic = hasNoIncoming ? (130 + Math.random() * 65) * trafficMultiplier : 0;
    const candidateRps = sourceTraffic + upstreamFlow;

    const domainWeight = node.domain === "Security" ? 1.15 : node.domain === "Database" ? 0.82 : 1;
    const statusPenalty = node.status === "failed" ? 0.22 : 1;
    const jitter = 0.92 + Math.random() * 0.2;
    const nextRps = Math.max(0, Math.round((node.rps * 0.74 + candidateRps * 0.26) * domainWeight * statusPenalty * jitter));

    const congestion = Math.min(180, Math.floor(nextRps / 8));
    const domainLatencyBias = node.domain === "Database" ? 18 : node.domain === "Security" ? 12 : 6;
    const failureLatency = node.status === "failed" ? 130 : 0;
    const nextLatency = Math.max(
      18,
      Math.round(node.latency * 0.72 + (22 + domainLatencyBias + congestion + failureLatency) * 0.28)
    );

    return { ...node, rps: nextRps, latency: nextLatency };
  });
}

export function calculateMetrics(nodes) {
  const totalRps = nodes.reduce((sum, node) => sum + node.rps, 0);
  const failedCount = nodes.filter((node) => node.status === "failed").length;
  const averageLatency = nodes.length
    ? Math.round(nodes.reduce((sum, node) => sum + node.latency, 0) / nodes.length)
    : 0;
  const resilienceScore = Math.max(0, 100 - failedCount * 20 - Math.floor(averageLatency / 9));
  return { totalRps, failedCount, averageLatency, resilienceScore };
}
