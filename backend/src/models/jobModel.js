const { getDatabase } = require('../config/database');

class JobModel {
  static get db() {
    return getDatabase();
  }

  static create({ id, title, type, status = 'pending', createdAt, updatedAt }) {
    const db = this.db;
    const now = new Date().toISOString();
    const job = {
      id,
      title,
      type,
      status,
      version: 1,
      createdAt: createdAt || now,
      updatedAt: updatedAt || now
    };

    const insertJob = db.prepare(`
      INSERT INTO jobs (id, title, type, status, version, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLog = db.prepare(`
      INSERT INTO job_logs (job_id, from_status, to_status, timestamp, details)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Run within transaction
    db.exec('BEGIN IMMEDIATE;');
    try {
      insertJob.run(
        job.id,
        job.title,
        job.type,
        job.status,
        job.version,
        job.createdAt,
        job.updatedAt
      );

      insertLog.run(
        job.id,
        null,
        job.status,
        job.createdAt,
        'Job created and placed in queue'
      );

      db.exec('COMMIT;');
      return job;
    } catch (error) {
      db.exec('ROLLBACK;');
      throw error;
    }
  }

  static findById(id) {
    const db = this.db;
    const stmt = db.prepare(`
      SELECT 
        id, 
        title, 
        type, 
        status, 
        version, 
        created_at AS createdAt, 
        updated_at AS updatedAt 
      FROM jobs 
      WHERE id = ?
    `);
    return stmt.get(id) || null;
  }

  static findAll({ status, search, sort = 'desc' } = {}) {
    const db = this.db;
    let query = `
      SELECT 
        id, 
        title, 
        type, 
        status, 
        version, 
        created_at AS createdAt, 
        updated_at AS updatedAt 
      FROM jobs 
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND status = ?`;
      params.push(status.toLowerCase());
    }

    if (search && search.trim()) {
      query += ` AND (title LIKE ? OR type LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    const orderDirection = sort.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY created_at ${orderDirection}`;

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getCounts() {
    const db = this.db;
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) AS running,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed
      FROM jobs
    `);
    const row = stmt.get();
    return {
      total: Number(row.total) || 0,
      pending: Number(row.pending) || 0,
      running: Number(row.running) || 0,
      completed: Number(row.completed) || 0,
      failed: Number(row.failed) || 0
    };
  }

  /**
   * Concurrency-safe atomic state transition.
   * Performs atomic UPDATE with condition matching expected current status.
   */
  static updateStatusAtomic({ id, newStatus, expectedCurrentStatus, reason }) {
    const db = this.db;
    const now = new Date().toISOString();

    db.exec('BEGIN IMMEDIATE;');
    try {
      // 1. Verify existence first
      const checkStmt = db.prepare(`
        SELECT id, title, type, status, version, created_at AS createdAt, updated_at AS updatedAt 
        FROM jobs WHERE id = ?
      `);
      const existing = checkStmt.get(id);

      if (!existing) {
        db.exec('COMMIT;');
        return { success: false, reason: 'NOT_FOUND' };
      }

      // If caller specified an expected current status, check if it matches
      if (expectedCurrentStatus && existing.status !== expectedCurrentStatus) {
        db.exec('COMMIT;');
        return {
          success: false,
          reason: 'CONFLICT',
          currentStatus: existing.status,
          currentVersion: existing.version
        };
      }

      // 2. Perform atomic update where status still matches existing.status
      const updateStmt = db.prepare(`
        UPDATE jobs 
        SET status = ?, version = version + 1, updated_at = ? 
        WHERE id = ? AND status = ?
      `);

      const result = updateStmt.run(newStatus, now, id, existing.status);

      if (result.changes === 0) {
        // Another thread updated the record right between SELECT and UPDATE!
        db.exec('COMMIT;');
        const recheck = checkStmt.get(id);
        return {
          success: false,
          reason: 'CONFLICT',
          currentStatus: recheck ? recheck.status : null,
          currentVersion: recheck ? recheck.version : null
        };
      }

      // 3. Write audit log
      const logStmt = db.prepare(`
        INSERT INTO job_logs (job_id, from_status, to_status, timestamp, details)
        VALUES (?, ?, ?, ?, ?)
      `);
      logStmt.run(
        id,
        existing.status,
        newStatus,
        now,
        reason || `Status updated from ${existing.status} to ${newStatus}`
      );

      db.exec('COMMIT;');

      return {
        success: true,
        job: {
          ...existing,
          status: newStatus,
          version: existing.version + 1,
          updatedAt: now
        }
      };
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }

  static delete(id) {
    const db = this.db;
    const stmt = db.prepare('DELETE FROM jobs WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getLogs(jobId) {
    const db = this.db;
    const stmt = db.prepare(`
      SELECT 
        id, 
        job_id AS jobId, 
        from_status AS fromStatus, 
        to_status AS toStatus, 
        timestamp, 
        details 
      FROM job_logs 
      WHERE job_id = ? 
      ORDER BY id ASC
    `);
    return stmt.all(jobId);
  }
}

module.exports = JobModel;
