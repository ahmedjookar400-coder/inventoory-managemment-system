const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve client static files if present
app.use(express.static(path.join(__dirname, '..')));

// Routes
const menuRoutes = require('./routes/menu');
const ordersRoutes = require('./routes/orders');
const reportsRoutes = require('./routes/reports');

app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Hodman Restaurant API', timestamp: new Date() });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Hodman Restaurant System Server is running!`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`===============================================`);
});
