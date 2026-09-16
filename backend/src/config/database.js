const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

let dbInstance = null;

function getDatabase(dbPath) {
  if (dbInstance) return dbInstance;

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.SERVERLESS);

  let targetPath = dbPath;
  if (!targetPath) {
    if (process.env.NODE_ENV === 'test') {
      targetPath = ':memory:';
    } else if (isServerless) {
      targetPath = path.join('/tmp', 'jobs.db');
    } else {
      targetPath = path.join(__dirname, '..', '..', 'data', 'jobs.db');
    }
  }

  if (targetPath !== ':memory:') {
    try {
      const dataDir = path.dirname(targetPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    } catch (e) {
      console.warn('⚠️ Could not create data directory, using /tmp/jobs.db:', e.message);
      targetPath = path.join('/tmp', 'jobs.db');
    }
  }

  let db;
  try {
    db = new DatabaseSync(targetPath);
  } catch (err) {
    console.warn(`⚠️ Failed to open DatabaseSync at ${targetPath}, falling back to in-memory:`, err.message);
    db = new DatabaseSync(':memory:');
    targetPath = ':memory:';
  }

  // Performance and integrity pragmas
  if (targetPath !== ':memory:') {
    try {
      db.exec('PRAGMA journal_mode = WAL;');
    } catch (e) {
      console.warn('⚠️ WAL mode pragma warning:', e.message);
    }
  }
  db.exec('PRAGMA foreign_keys = ON;');

  // Schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'running', 'completed', 'failed')),
      version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS job_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      details TEXT,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_logs(job_id);
  `);

  // Seed sample records if completely empty (only in non-test mode)
  if (process.env.NODE_ENV !== 'test') {
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM jobs');
    const result = countStmt.get();
    if (result && result.count === 0) {
      seedInitialJobs(db);
    }
  }

  dbInstance = db;
  return dbInstance;
}

function seedInitialJobs(db) {
  const now = new Date();
  const sampleJobs = [
    {
      id: 'job_sample_01',
      title: 'Generate Monthly Sales Report (PDF)',
      type: 'REPORT_GENERATION',
      status: 'pending',
      version: 1,
      created_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      updated_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString()
    },
    {
      id: 'job_sample_02',
      title: 'Sync Stripe Customer Subscriptions',
      type: 'DATA_SYNC',
      status: 'running',
      version: 2,
      created_at: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
      updated_at: new Date(now.getTime() - 1000 * 60 * 5).toISOString()
    },
    {
      id: 'job_sample_03',
      title: 'Process User Avatar Image Transcode',
      type: 'IMAGE_PROCESSING',
      status: 'completed',
      version: 3,
      created_at: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      updated_at: new Date(now.getTime() - 1000 * 60 * 45).toISOString()
    },
    {
      id: 'job_sample_04',
      title: 'Bulk Welcome Email Dispatch (Batch #42)',
      type: 'EMAIL_DISPATCH',
      status: 'failed',
      version: 3,
      created_at: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      updated_at: new Date(now.getTime() - 1000 * 60 * 110).toISOString()
    }
  ];

  const insertJob = db.prepare(`
    INSERT INTO jobs (id, title, type, status, version, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLog = db.prepare(`
    INSERT INTO job_logs (job_id, from_status, to_status, timestamp, details)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const job of sampleJobs) {
    insertJob.run(
      job.id,
      job.title,
      job.type,
      job.status,
      job.version,
      job.created_at,
      job.updated_at
    );

    insertLog.run(
      job.id,
      null,
      'pending',
      job.created_at,
      'Job initially queued'
    );

    if (job.status === 'running') {
      insertLog.run(
        job.id,
        'pending',
        'running',
        job.updated_at,
        'Worker picked up job execution'
      );
    } else if (job.status === 'completed') {
      insertLog.run(
        job.id,
        'pending',
        'running',
        new Date(now.getTime() - 1000 * 60 * 55).toISOString(),
        'Worker started image transcoding'
      );
      insertLog.run(
        job.id,
        'running',
        'completed',
        job.updated_at,
        'Transcoding completed successfully'
      );
    } else if (job.status === 'failed') {
      insertLog.run(
        job.id,
        'pending',
        'running',
        new Date(now.getTime() - 1000 * 60 * 115).toISOString(),
        'Worker started dispatch'
      );
      insertLog.run(
        job.id,
        'running',
        'failed',
        job.updated_at,
        'SMTP Gateway timeout error: connection refused'
      );
    }
  }
}

function closeDatabase() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (_) {}
    dbInstance = null;
  }
}

module.exports = {
  getDatabase,
  closeDatabase
};
