// Routes for simulation operations
const express = require('express');
const router = express.Router();
const { runSimulation, validateSimulationInput } = require('../services/simulator');

/**
 * POST /api/simulate
 * Run a simulation on an architecture
 * 
 * Request body:
 * {
 *   nodes: Array<Node>,
 *   edges: Array<Edge>,
 *   steps: Number (optional, default 10)
 * }
 */
router.post('/', (req, res) => {
  try {
    const { nodes, edges, steps = 10 } = req.body;

    // Validate input
    const validation = validateSimulationInput({ nodes, edges });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Validate steps parameter
    if (!Number.isInteger(steps) || steps < 1 || steps > 1000) {
      return res.status(400).json({ error: 'Steps must be an integer between 1 and 1000' });
    }

    // Run simulation
    const results = runSimulation(nodes, edges, steps);
    
    res.json({
      success: true,
      steps: steps,
      simulation: results
    });
  } catch (error) {
    res.status(500).json({ error: 'Simulation failed: ' + error.message });
  }
});

module.exports = router;
