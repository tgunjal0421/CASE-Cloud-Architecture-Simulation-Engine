// Routes for domain components
const express = require('express');
const router = express.Router();
const DOMAIN_COMPONENTS = require('../data/components');

/**
 * GET /api/domains
 * Retrieve all available domain components
 */
router.get('/', (req, res) => {
  try {
    res.json(DOMAIN_COMPONENTS);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve domains' });
  }
});

module.exports = router;
