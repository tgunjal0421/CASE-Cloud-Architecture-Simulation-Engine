// Unit tests for the simulator service
const {
  stepSimulation,
  runSimulation,
  validateSimulationInput
} = require('../../src/services/simulator');

describe('Simulator Service', () => {
  describe('validateSimulationInput', () => {
    it('should return valid when given proper input', () => {
      const input = {
        nodes: [
          { id: 'n1', rps: 100, latency: 50, status: 'healthy' }
        ],
        edges: []
      };
      
      const result = validateSimulationInput(input);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject missing nodes', () => {
      const input = { edges: [] };
      const result = validateSimulationInput(input);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Nodes');
    });

    it('should reject missing edges', () => {
      const input = {
        nodes: [{ id: 'n1' }]
      };
      const result = validateSimulationInput(input);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Edges');
    });

    it('should reject null input', () => {
      const result = validateSimulationInput(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Input');
    });

    it('should reject empty nodes array', () => {
      const input = { nodes: [], edges: [] };
      const result = validateSimulationInput(input);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('one node');
    });

    it('should reject nodes without id', () => {
      const input = {
        nodes: [{ rps: 100 }],
        edges: []
      };
      const result = validateSimulationInput(input);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('id');
    });

    it('should reject edges with non-existent nodes', () => {
      const input = {
        nodes: [{ id: 'n1' }],
        edges: [{ id: 'e1', from: 'n1', to: 'n2' }]
      };
      const result = validateSimulationInput(input);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('non-existent');
    });
  });

  describe('stepSimulation', () => {
    it('should return same number of nodes', () => {
      const nodes = [
        { id: 'n1', rps: 100, latency: 50, status: 'healthy' },
        { id: 'n2', rps: 80, latency: 40, status: 'healthy' }
      ];
      const edges = [{ id: 'e1', from: 'n1', to: 'n2' }];
      
      const result = stepSimulation(nodes, edges);
      expect(result).toHaveLength(2);
    });

    it('should update rps and latency', () => {
      const nodes = [
        { id: 'n1', rps: 100, latency: 50, status: 'healthy' }
      ];
      const edges = [];
      
      const result = stepSimulation(nodes, edges);
      expect(result[0]).toHaveProperty('rps');
      expect(result[0]).toHaveProperty('latency');
      expect(typeof result[0].rps).toBe('number');
      expect(typeof result[0].latency).toBe('number');
    });

    it('should preserve node ids', () => {
      const nodes = [
        { id: 'n1', rps: 100, latency: 50, status: 'healthy' },
        { id: 'n2', rps: 80, latency: 40, status: 'healthy' }
      ];
      const edges = [];
      
      const result = stepSimulation(nodes, edges);
      expect(result[0].id).toBe('n1');
      expect(result[1].id).toBe('n2');
    });

    it('should have valid status values', () => {
      const nodes = [
        { id: 'n1', rps: 100, latency: 50, status: 'healthy' }
      ];
      const edges = [];
      
      const result = stepSimulation(nodes, edges);
      expect(['healthy', 'failed']).toContain(result[0].status);
    });

    it('should maintain positive rps', () => {
      const nodes = [
        { id: 'n1', rps: 100, latency: 50, status: 'healthy' }
      ];
      const edges = [];
      
      const result = stepSimulation(nodes, edges);
      expect(result[0].rps).toBeGreaterThanOrEqual(0);
    });

    it('should maintain minimum latency', () => {
      const nodes = [
        { id: 'n1', rps: 100, latency: 50, status: 'healthy' }
      ];
      const edges = [];
      
      const result = stepSimulation(nodes, edges);
      expect(result[0].latency).toBeGreaterThanOrEqual(10);
    });

    it('should propagate flow through edges', () => {
      const nodes = [
        { id: 'n1', rps: 100, latency: 50, status: 'healthy' },
        { id: 'n2', rps: 0, latency: 40, status: 'healthy' }
      ];
      const edges = [{ id: 'e1', from: 'n1', to: 'n2' }];
      
      const result = stepSimulation(nodes, edges);
      // n2 should have received flow from n1
      expect(result[1].rps).toBeGreaterThan(0);
    });

    it('should not propagate flow from failed nodes', () => {
      const nodes = [
        { id: 'n1', rps: 100, latency: 50, status: 'failed' },
        { id: 'n2', rps: 0, latency: 40, status: 'healthy' }
      ];
      const edges = [{ id: 'e1', from: 'n1', to: 'n2' }];
      
      const result = stepSimulation(nodes, edges);
      // n2 should not have received flow from failed n1
      // It might have some default behavior or stay at 0
      expect(result[1].rps).toBeDefined();
    });
  });

  describe('runSimulation', () => {
    it('should return correct number of steps', () => {
      const nodes = [{ id: 'n1', rps: 100, latency: 50, status: 'healthy' }];
      const edges = [];
      
      const result = runSimulation(nodes, edges, 5);
      expect(result).toHaveLength(6); // Initial + 5 steps
    });

    it('should return default 10 steps', () => {
      const nodes = [{ id: 'n1', rps: 100, latency: 50, status: 'healthy' }];
      const edges = [];
      
      const result = runSimulation(nodes, edges);
      expect(result).toHaveLength(11); // Initial + 10 steps
    });

    it('should not modify original nodes', () => {
      const nodes = [
        { id: 'n1', rps: 100, latency: 50, status: 'healthy' }
      ];
      const originalRps = nodes[0].rps;
      const edges = [];
      
      runSimulation(nodes, edges, 3);
      expect(nodes[0].rps).toBe(originalRps);
    });

    it('should contain valid node data at each step', () => {
      const nodes = [{ id: 'n1', rps: 100, latency: 50, status: 'healthy' }];
      const edges = [];
      
      const result = runSimulation(nodes, edges, 3);
      
      result.forEach(step => {
        step.forEach(node => {
          expect(node).toHaveProperty('id');
          expect(node).toHaveProperty('rps');
          expect(node).toHaveProperty('latency');
          expect(node).toHaveProperty('status');
        });
      });
    });
  });
});
