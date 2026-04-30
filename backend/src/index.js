// Main server entry point
const express = require('express');
const cors = require('cors');

// Routes
const domainsRouter = require('./routes/domains');
const templatesRouter = require('./routes/templates');
const simulateRouter = require('./routes/simulate');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'CASE Backend',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/domains', domainsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/simulate', simulateRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
