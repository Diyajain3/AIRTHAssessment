const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jobRoutes = require('./routes/jobRoutes');
const { errorHandler, NotFoundError } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Mini Job Queue API'
  });
});

// Mount routes (supporting both /jobs and /api/jobs)
app.use('/jobs', jobRoutes);
app.use('/api/jobs', jobRoutes);

// Catch 404s
app.use((req, res, next) => {
  next(new NotFoundError(`Route '${req.method} ${req.originalUrl}' not found.`));
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
