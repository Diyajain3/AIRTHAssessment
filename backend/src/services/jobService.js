const crypto = require('node:crypto');
const JobModel = require('../models/jobModel');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');

/**
 * State Transition Rules as specified:
 * pending -> running -> completed | failed
 * Terminal states (completed, failed) cannot change.
 */
const VALID_TRANSITIONS = {
  pending: ['running'],
  running: ['completed', 'failed'],
  completed: [],
  failed: []
};

class JobService {
  static createJob({ title, type }) {
    const id = `job_${crypto.randomUUID().slice(0, 8)}`;
    return JobModel.create({
      id,
      title,
      type,
      status: 'pending'
    });
  }

  static getAllJobs(query) {
    const jobs = JobModel.findAll(query);
    const counts = JobModel.getCounts();
    return {
      jobs,
      counts
    };
  }

  static getJobById(id) {
    const job = JobModel.findById(id);
    if (!job) {
      throw new NotFoundError(`Job with ID '${id}' was not found.`);
    }
    return job;
  }

  static getStatusCounts() {
    return JobModel.getCounts();
  }

  static updateJobStatus(id, newStatus, options = {}) {
    const { expectedCurrentStatus, reason } = options;

    // 1. Fetch current job
    const job = JobModel.findById(id);
    if (!job) {
      throw new NotFoundError(`Job with ID '${id}' was not found.`);
    }

    const currentStatus = job.status;

    // 2. Prevent no-op or same-state update
    if (currentStatus === newStatus) {
      throw new ConflictError(
        `Job is already in '${newStatus}' state. No transition occurred.`,
        { currentStatus, attemptedStatus: newStatus }
      );
    }

    // 3. Validate against state machine
    const allowedTargets = VALID_TRANSITIONS[currentStatus] || [];

    if (currentStatus === 'completed' || currentStatus === 'failed') {
      throw new ConflictError(
        `Job is in terminal state '${currentStatus}'. Completed or failed jobs cannot be modified or run again.`,
        { currentStatus, attemptedStatus: newStatus, allowedTransitions: [] }
      );
    }

    if (!allowedTargets.includes(newStatus)) {
      throw new ValidationError(
        `Invalid state transition: Cannot transition job from '${currentStatus}' to '${newStatus}'. Allowed transitions from '${currentStatus}': [${allowedTargets.join(', ')}].`
      );
    }

    // 4. Perform atomic update in DB with concurrency check
    const result = JobModel.updateStatusAtomic({
      id,
      newStatus,
      expectedCurrentStatus: expectedCurrentStatus || currentStatus,
      reason
    });

    if (!result.success) {
      if (result.reason === 'NOT_FOUND') {
        throw new NotFoundError(`Job with ID '${id}' was not found.`);
      }

      if (result.reason === 'CONFLICT') {
        throw new ConflictError(
          `Concurrency Conflict: Job '${id}' was modified by another concurrent request. Current state is '${result.currentStatus}'.`,
          {
            currentStatus: result.currentStatus,
            attemptedStatus: newStatus,
            version: result.currentVersion
          }
        );
      }
    }

    return result.job;
  }

  static deleteJob(id) {
    const job = JobModel.findById(id);
    if (!job) {
      throw new NotFoundError(`Job with ID '${id}' was not found.`);
    }
    const deleted = JobModel.delete(id);
    return { id, deleted };
  }

  static getJobLogs(id) {
    const job = JobModel.findById(id);
    if (!job) {
      throw new NotFoundError(`Job with ID '${id}' was not found.`);
    }
    return JobModel.getLogs(id);
  }

  /**
   * Concurrency demonstration:
   * Fires two concurrent promises attempting to transition the same job
   * at the exact same instant to simulate two browser tabs racing.
   */
  static async simulateRaceCondition(id) {
    const job = JobModel.findById(id);
    if (!job) {
      throw new NotFoundError(`Job with ID '${id}' was not found.`);
    }

    if (job.status !== 'pending') {
      throw new ValidationError(
        `Race condition test requires a 'pending' job. This job is currently '${job.status}'.`
      );
    }

    // Prepare two requests racing to transition this job from 'pending' to 'running'
    const request1 = () => {
      try {
        const updated = this.updateJobStatus(id, 'running', {
          expectedCurrentStatus: 'pending',
          reason: 'Concurrent Tab 1 request'
        });
        return { requester: 'Tab 1', status: 200, success: true, job: updated };
      } catch (err) {
        return {
          requester: 'Tab 1',
          status: err.statusCode || 500,
          success: false,
          error: err.message,
          code: err.code
        };
      }
    };

    const request2 = () => {
      try {
        const updated = this.updateJobStatus(id, 'running', {
          expectedCurrentStatus: 'pending',
          reason: 'Concurrent Tab 2 request'
        });
        return { requester: 'Tab 2', status: 200, success: true, job: updated };
      } catch (err) {
        return {
          requester: 'Tab 2',
          status: err.statusCode || 500,
          success: false,
          error: err.message,
          code: err.code
        };
      }
    };

    // Execute concurrently
    const [result1, result2] = await Promise.all([
      new Promise((resolve) => setImmediate(() => resolve(request1()))),
      new Promise((resolve) => setImmediate(() => resolve(request2())))
    ]);

    const winner = result1.success ? result1.requester : (result2.success ? result2.requester : 'None');
    const conflict = !result1.success ? result1 : (!result2.success ? result2 : null);

    return {
      message: 'Race condition simulation completed.',
      jobId: id,
      summary: `One request succeeded with HTTP 200, while the conflicting request was cleanly rejected with HTTP 409 Conflict.`,
      winner,
      results: [result1, result2],
      conflictHandlingConfirmed: Boolean(conflict && conflict.status === 409)
    };
  }
}

module.exports = JobService;
