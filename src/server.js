const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');

const authRoutes = require('./routes/authRoutes');
const ambulanceRoutes = require('./routes/ambulanceRoutes');
const locationRoutes = require('./routes/locationRoutes');
const sosRoutes = require('./routes/sosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve Operator Web Dashboard Static Files
app.use(express.static(path.join(__dirname, '../dashboard')));

// Serve Driver Mobile Web App Static Files
app.use('/driver', express.static(path.join(__dirname, '../driver-app/www')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', ambulanceRoutes);
app.use('/api', locationRoutes);
app.use('/api', sosRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
