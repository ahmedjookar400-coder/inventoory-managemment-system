const express = require('express');
const router = express.Router();
const db = require('../database');

// GET active orders (for KDS)
router.get('/active', (req, res) => {
  const sql = `
    SELECT * FROM orders 
    WHERE status IN ('pending', 'preparing', 'ready') 
    ORDER BY created_at ASC
  `;

  db.all(sql, [], (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map(o => `'${o.id}'`).join(',');
    db.all(`SELECT * FROM order_items WHERE order_id IN (${orderIds})`, [], (itemsErr, items) => {
      if (itemsErr) return res.status(500).json({ error: itemsErr.message });

      const mapped = orders.map(o => ({
        ...o,
        items: items.filter(i => i.order_id === o.id)
      }));
      res.json(mapped);
    });
  });
});

// GET all orders
router.get('/', (req, res) => {
  const { status, limit = 50 } = req.query;
  let sql = 'SELECT * FROM orders';
  const params = [];

  if (status && status !== 'all') {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit));

  db.all(sql, params, (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map(o => `'${o.id}'`).join(',');
    db.all(`SELECT * FROM order_items WHERE order_id IN (${orderIds})`, [], (itemsErr, items) => {
      if (itemsErr) return res.status(500).json({ error: itemsErr.message });

      const mapped = orders.map(o => ({
        ...o,
        items: items.filter(i => i.order_id === o.id)
      }));
      res.json(mapped);
    });
  });
});

// POST create new order
router.post('/', (req, res) => {
  const {
    order_type = 'dine-in',
    table_number = 'Table 1',
    customer_name = 'Guest',
    payment_method = 'cash',
    items = [],
    subtotal,
    tax,
    total,
    cash_received = 0,
    change = 0
  } = req.body;

  const orderId = `ord-${Date.now()}`;
  const orderNumber = `HD-${Math.floor(100 + Math.random() * 900)}`;

  db.serialize(() => {
    const stmt = db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, table_number, customer_name,
        status, payment_method, payment_status, subtotal, tax, total,
        cash_received, change
      ) VALUES (?, ?, ?, ?, ?, 'pending', ?, 'paid', ?, ?, ?, ?, ?)
    `);

    stmt.run([
      orderId, orderNumber, order_type, table_number, customer_name,
      payment_method, subtotal, tax, total, cash_received, change
    ], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // Insert line items
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, menu_item_id, name, unit_price, quantity, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      items.forEach(i => {
        itemStmt.run([orderId, i.id, i.name, i.price, i.quantity, i.notes || '']);
      });

      itemStmt.finalize(() => {
        res.status(201).json({
          id: orderId,
          order_number: orderNumber,
          message: 'Order created and sent to kitchen successfully'
        });
      });
    });

    stmt.finalize();
  });
});

// PATCH update order status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const sql = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.run(sql, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order status updated', status });
  });
});

module.exports = router;
