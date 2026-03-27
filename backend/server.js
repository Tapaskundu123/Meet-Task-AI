require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const uploadRoute = require('./routes/upload');
const meetingsRoute = require('./routes/meetings');
const tasksRoute = require('./routes/tasks');
const { startAgentJob } = require('./utils/agentJob');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure dirs exist
const dirs = [
  path.resolve(__dirname, '../uploads'),
  path.resolve(__dirname, '../outputs'),
];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (optional)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Routes
app.use('/api/upload', uploadRoute);
app.use('/api/meetings', meetingsRoute);
app.use('/api/tasks', tasksRoute);

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Connect to MongoDB then start
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meetings_db';
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('[MongoDB] Connected to', MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      startAgentJob();
    });
  })
  .catch(err => {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  });
