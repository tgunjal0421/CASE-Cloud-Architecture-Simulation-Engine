// Routes for architecture templates
const express = require('express');
const router = express.Router();
const TEMPLATES = require('../data/templates');

/**
 * GET /api/templates
 * Retrieve all predefined architecture templates
 */
router.get('/', (req, res) => {
  try {
    res.json(TEMPLATES);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve templates' });
  }
});

/**
 * GET /api/templates/:name
 * Retrieve a specific template by name
 */
router.get('/:name', (req, res) => {
  try {
    const templateName = req.params.name;
    const template = TEMPLATES[templateName];
    
    if (!template) {
      return res.status(404).json({ error: `Template '${templateName}' not found` });
    }
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve template' });
  }
});

module.exports = router;
