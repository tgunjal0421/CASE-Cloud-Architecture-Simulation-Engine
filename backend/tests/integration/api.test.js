// Integration tests for API endpoints
const request = require('supertest');
const app = require('../../src/index');

describe('API Integration Tests', () => {
  describe('GET /', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('GET /api/domains', () => {
    it('should return domain components', async () => {
      const response = await request(app)
        .get('/api/domains')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should have correct domain structure', async () => {
      const response = await request(app)
        .get('/api/domains')
        .expect(200);

      response.body.forEach(domain => {
        expect(domain).toHaveProperty('domain');
        expect(domain).toHaveProperty('items');
        expect(Array.isArray(domain.items)).toBe(true);

        domain.items.forEach(item => {
          expect(item).toHaveProperty('kind');
          expect(item).toHaveProperty('icon');
          expect(item).toHaveProperty('description');
        });
      });
    });

    it('should include all expected domains', async () => {
      const response = await request(app)
        .get('/api/domains')
        .expect(200);

      const domains = response.body.map(d => d.domain);
      expect(domains).toContain('Compute');
      expect(domains).toContain('Storage');
      expect(domains).toContain('Database');
      expect(domains).toContain('Network');
      expect(domains).toContain('Security');
    });
  });

  describe('GET /api/templates', () => {
    it('should return templates object', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(typeof response.body).toBe('object');
      expect(Object.keys(response.body).length).toBeGreaterThan(0);
    });

    it('should have correct template structure', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      Object.values(response.body).forEach(template => {
        expect(template).toHaveProperty('nodes');
        expect(template).toHaveProperty('edges');
        expect(Array.isArray(template.nodes)).toBe(true);
        expect(Array.isArray(template.edges)).toBe(true);
      });
    });

    it('should include predefined templates', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(response.body).toHaveProperty('3-tier web app');
      expect(response.body).toHaveProperty('secure event pipeline');
    });
  });

  describe('GET /api/templates/:name', () => {
    it('should return specific template', async () => {
      const response = await request(app)
        .get('/api/templates/3-tier%20web%20app')
        .expect(200);

      expect(response.body).toHaveProperty('nodes');
      expect(response.body).toHaveProperty('edges');
    });

    it('should return 404 for non-existent template', async () => {
      const response = await request(app)
        .get('/api/templates/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/simulate', () => {
    const validSimulationInput = {
      nodes: [
        {
          id: 'n1',
          domain: 'Network',
          kind: 'Load Balancer',
          status: 'healthy',
          rps: 100,
          latency: 50,
          x: 100,
          y: 100
        },
        {
          id: 'n2',
          domain: 'Compute',
          kind: 'Container Service',
          status: 'healthy',
          rps: 80,
          latency: 60,
          x: 300,
          y: 100
        }
      ],
      edges: [
        { id: 'e1', from: 'n1', to: 'n2' }
      ],
      steps: 5
    };

    it('should run simulation successfully', async () => {
      const response = await request(app)
        .post('/api/simulate')
        .send(validSimulationInput)
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('simulation');
      expect(Array.isArray(response.body.simulation)).toBe(true);
    });

    it('should return correct number of simulation steps', async () => {
      const response = await request(app)
        .post('/api/simulate')
        .send(validSimulationInput)
        .expect(200);

      expect(response.body.simulation.length).toBe(6); // Initial + 5 steps
    });

    it('should use default steps if not provided', async () => {
      const input = { ...validSimulationInput };
      delete input.steps;

      const response = await request(app)
        .post('/api/simulate')
        .send(input)
        .expect(200);

      expect(response.body.simulation.length).toBe(11); // Initial + 10 default steps
    });

    it('should return 400 if nodes missing', async () => {
      const input = { edges: [] };

      const response = await request(app)
        .post('/api/simulate')
        .send(input)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if edges missing', async () => {
      const input = {
        nodes: [{ id: 'n1', rps: 100, latency: 50, status: 'healthy' }]
      };

      const response = await request(app)
        .post('/api/simulate')
        .send(input)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if steps out of range', async () => {
      const input = { ...validSimulationInput, steps: 2000 };

      const response = await request(app)
        .post('/api/simulate')
        .send(input)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if steps is not integer', async () => {
      const input = { ...validSimulationInput, steps: 5.5 };

      const response = await request(app)
        .post('/api/simulate')
        .send(input)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid node references in edges', async () => {
      const input = {
        ...validSimulationInput,
        edges: [{ id: 'e1', from: 'n1', to: 'n99' }]
      };

      const response = await request(app)
        .post('/api/simulate')
        .send(input)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should simulate metric changes', async () => {
      const response = await request(app)
        .post('/api/simulate')
        .send(validSimulationInput)
        .expect(200);

      const initialNode = response.body.simulation[0][0];
      const lastNode = response.body.simulation[response.body.simulation.length - 1][0];

      // At least one metric should have changed (very high probability)
      const rpsChanged = initialNode.rps !== lastNode.rps;
      const latencyChanged = initialNode.latency !== lastNode.latency;

      expect(rpsChanged || latencyChanged).toBe(true);
    });
  });

  describe('404 Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
