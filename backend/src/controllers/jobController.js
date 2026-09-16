const JobService = require('../services/jobService');

class JobController {
  static async createJob(req, res, next) {
    try {
      const { title, type } = req.body;
      const job = JobService.createJob({ title, type });
      return res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: job
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllJobs(req, res, next) {
    try {
      const { status, search, sort } = req.query;
      const result = JobService.getAllJobs({ status, search, sort });
      return res.status(200).json({
        success: true,
        data: result.jobs,
        counts: result.counts
      });
    } catch (err) {
      next(err);
    }
  }

  static async getJobById(req, res, next) {
    try {
      const { id } = req.params;
      const job = JobService.getJobById(id);
      return res.status(200).json({
        success: true,
        data: job
      });
    } catch (err) {
      next(err);
    }
  }

  static async getStatusCounts(req, res, next) {
    try {
      const counts = JobService.getStatusCounts();
      return res.status(200).json({
        success: true,
        data: counts
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, expectedCurrentStatus, reason } = req.body;
      const updatedJob = JobService.updateJobStatus(id, status, {
        expectedCurrentStatus,
        reason
      });

      return res.status(200).json({
        success: true,
        message: `Job status updated to '${status}'`,
        data: updatedJob
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteJob(req, res, next) {
    try {
      const { id } = req.params;
      const result = JobService.deleteJob(id);
      return res.status(200).json({
        success: true,
        message: `Job '${id}' deleted successfully`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  static async getJobLogs(req, res, next) {
    try {
      const { id } = req.params;
      const logs = JobService.getJobLogs(id);
      return res.status(200).json({
        success: true,
        data: logs
      });
    } catch (err) {
      next(err);
    }
  }

  static async simulateRace(req, res, next) {
    try {
      const { id } = req.params;
      const result = await JobService.simulateRaceCondition(id);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = JobController;
