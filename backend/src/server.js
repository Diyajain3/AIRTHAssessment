require('dotenv').config();
const app = require('./app');
const { getDatabase } = require('./config/database');

const PORT = process.env.PORT || 5000;

// Initialize database
try {
  getDatabase();
  console.log('📦 SQLite database initialized successfully.');
} catch (err) {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Mini Job Queue API server running on port ${PORT}`);
  console.log(`📡 Endpoints available:`);
  console.log(`   - GET    http://localhost:${PORT}/health`);
  console.log(`   - GET    http://localhost:${PORT}/jobs`);
  console.log(`   - POST   http://localhost:${PORT}/jobs`);
  console.log(`   - PATCH  http://localhost:${PORT}/jobs/:id/status`);
  console.log(`   - DELETE http://localhost:${PORT}/jobs/:id`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
