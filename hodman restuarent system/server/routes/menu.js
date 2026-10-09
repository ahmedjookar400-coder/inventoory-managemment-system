const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all categories
router.get('/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET all menu items (with category filter)
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM menu_items WHERE available = 1';
  const params = [];

  if (category && category !== 'all') {
    sql += ' AND category_id = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET single item
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM menu_items WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Item not found' });
    res.json(row);
  });
});

module.exports = router;
