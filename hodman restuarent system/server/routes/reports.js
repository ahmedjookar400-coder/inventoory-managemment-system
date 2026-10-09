const express = require('express');
const router = express.Router();
const db = require('../database');

// GET analytics summary
router.get('/summary', (req, res) => {
  const querySummary = `
    SELECT 
      COUNT(*) as total_orders,
      COALESCE(SUM(total), 0) as total_revenue,
      COALESCE(AVG(total), 0) as avg_order_value,
      SUM(CASE WHEN status IN ('pending', 'preparing', 'ready') THEN 1 ELSE 0 END) as active_orders,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders
    FROM orders
  `;

  db.get(querySummary, [], (err, summary) => {
    if (err) return res.status(500).json({ error: err.message });

    // Payment methods
    db.all(`SELECT payment_method, SUM(total) as revenue, COUNT(*) as count FROM orders GROUP BY payment_method`, [], (pErr, payments) => {
      if (pErr) return res.status(500).json({ error: pErr.message });

      // Top selling items
      const queryTop = `
        SELECT name, SUM(quantity) as units_sold, SUM(quantity * unit_price) as revenue
        FROM order_items
        GROUP BY name
        ORDER BY units_sold DESC
        LIMIT 6
      `;

      db.all(queryTop, [], (tErr, topItems) => {
        if (tErr) return res.status(500).json({ error: tErr.message });

        res.json({
          summary: {
            total_orders: summary.total_orders,
            total_revenue: Number(summary.total_revenue.toFixed(2)),
            avg_order_value: Number(summary.avg_order_value.toFixed(2)),
            active_orders: summary.active_orders,
            completed_orders: summary.completed_orders
          },
          payments,
          top_items: topItems
        });
      });
    });
  });
});

module.exports = router;
