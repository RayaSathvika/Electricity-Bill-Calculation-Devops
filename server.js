const express = require('express');
const path = require('path');
const { calculateElectricityBill, TARIFF_CONFIG } = require('./billCalculator');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Electricity-Bill-Service'
  });
});

// Tariff slabs info endpoint
app.get('/api/slabs', (req, res) => {
  res.json(TARIFF_CONFIG);
});

// Bill calculation API
app.post('/api/calculate', (req, res) => {
  try {
    const { units, connectionType, customerName, meterNumber } = req.body;

    if (units === undefined || units === null || units === '') {
      return res.status(400).json({
        success: false,
        error: 'Units consumed is required.'
      });
    }

    const bill = calculateElectricityBill(units, connectionType, {
      name: customerName,
      meterNumber: meterNumber
    });

    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export app for testing, or listen if executed directly
if (require.main === module) {
  const server = app.listen(PORT, HOST, () => {
    console.log(`=======================================================`);
    console.log(` Electricity Bill Application is running!`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => console.log('HTTP server closed'));
  });
}

module.exports = app;
