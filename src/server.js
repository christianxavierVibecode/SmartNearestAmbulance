const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const path = require('path');

const authRoutes = require('./routes/authRoutes');
const ambulanceRoutes = require('./routes/ambulanceRoutes');
const locationRoutes = require('./routes/locationRoutes');
const sosRoutes = require('./routes/sosRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging Middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve Operator Web Dashboard Static Files
app.use(express.static(path.join(__dirname, '../dashboard')));

// Serve Driver Mobile Web App Static Files
app.use('/driver', express.static(path.join(__dirname, '../driver-app/www')));

// Custom HTTP Error Code Page Routes
const errorCodes = [400, 401, 403, 404, 429, 500, 503];
errorCodes.forEach(code => {
  app.get(`/${code}`, (req, res) => {
    res.status(code).sendFile(path.join(__dirname, '../dashboard/error.html'));
  });
});

app.get('/error', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard/error.html'));
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', ambulanceRoutes);
app.use('/api', locationRoutes);
app.use('/api', sosRoutes);

// API Welcome Route
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Smart Nearest Ambulance API System is running'
  });
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 Unmatched Route Handler
app.use((req, res, next) => {
  if (req.accepts('html') && !req.path.startsWith('/api')) {
    return res.status(404).sendFile(path.join(__dirname, '../dashboard/error.html'));
  }
  res.status(404).json({
    status: 'fail',
    code: 404,
    message: `Route ${req.originalUrl} not found`
  });
});

// Centralized Error Handler (Must be registered after all routes)
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
