// Simulation engine - handles architecture performance calculations

/**
 * Simulates a single step of the architecture
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge connections
 * @returns {Array} Updated nodes with new metrics
 */
function stepSimulation(nodes, edges) {
  const byId = new Map(nodes.map(node => [node.id, node]));
  const incoming = new Map();

  // Initialize incoming map
  nodes.forEach(node => incoming.set(node.id, []));
  
  // Map edges to identify downstream dependencies
  edges.forEach(edge => {
    if (incoming.has(edge.to)) {
      incoming.get(edge.to).push(edge.from);
    }
  });

  // Calculate new metrics for each node
  return nodes.map(node => {
    const upstreamIds = incoming.get(node.id) || [];
    
    // Calculate traffic from upstream nodes
    const upstreamFlow = upstreamIds.reduce((sum, upstreamId) => {
      const upstreamNode = byId.get(upstreamId);
      if (!upstreamNode || upstreamNode.status === 'failed') {
        return sum;
      }
      return sum + upstreamNode.rps * 0.68; // 68% throughput assumption
    }, 0);

    // Calculate new RPS with variation
    const newRps = Math.max(0, upstreamFlow + (Math.random() - 0.5) * 20);
    
    // Calculate new latency with variation
    const newLatency = Math.max(10, node.latency + (Math.random() - 0.5) * 10);

    // Determine status (95% healthy, 5% failed)
    const newStatus = Math.random() < 0.95 ? 'healthy' : 'failed';

    return {
      ...node,
      rps: Math.round(newRps),
      latency: Math.round(newLatency),
      status: newStatus
    };
  });
}

/**
 * Run a complete simulation
 * @param {Array} nodes - Initial nodes
 * @param {Array} edges - Edge connections
 * @param {Number} steps - Number of simulation steps
 * @returns {Array} Array of node states at each step
 */
function runSimulation(nodes, edges, steps = 10) {
  let currentNodes = JSON.parse(JSON.stringify(nodes)); // Deep copy
  const results = [currentNodes];

  for (let i = 0; i < steps; i++) {
    currentNodes = stepSimulation(currentNodes, edges);
    results.push(JSON.parse(JSON.stringify(currentNodes))); // Store copy
  }

  return results;
}

/**
 * Validates simulation input
 * @param {Object} input - Input object with nodes and edges
 * @returns {Object} { isValid: boolean, error: string|null }
 */
function validateSimulationInput(input) {
  if (!input) {
    return { isValid: false, error: 'Input object is required' };
  }

  if (!Array.isArray(input.nodes)) {
    return { isValid: false, error: 'Nodes must be an array' };
  }

  if (!Array.isArray(input.edges)) {
    return { isValid: false, error: 'Edges must be an array' };
  }

  if (input.nodes.length === 0) {
    return { isValid: false, error: 'At least one node is required' };
  }

  // Validate node structure
  for (const node of input.nodes) {
    if (!node.id) {
      return { isValid: false, error: 'Each node must have an id' };
    }
  }

  // Validate edges reference existing nodes
  const nodeIds = new Set(input.nodes.map(n => n.id));
  for (const edge of input.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      return { isValid: false, error: 'Edge references non-existent node' };
    }
  }

  return { isValid: true, error: null };
}

module.exports = {
  stepSimulation,
  runSimulation,
  validateSimulationInput
};
