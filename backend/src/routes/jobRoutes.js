const express = require('express');
const JobController = require('../controllers/jobController');
const { validateCreateJob, validateUpdateStatus } = require('../middleware/validator');

const router = express.Router();

// Get counts summary
router.get('/counts', JobController.getStatusCounts);

// Get all jobs (with filtering, search, sorting)
router.get('/', JobController.getAllJobs);

// Create a new job
router.post('/', validateCreateJob, JobController.createJob);

// Get single job details
router.get('/:id', JobController.getJobById);

// Update job status (with transition validation and concurrency protection)
router.patch('/:id/status', validateUpdateStatus, JobController.updateStatus);

// Delete a job
router.delete('/:id', JobController.deleteJob);

// Get job transition logs / audit trail
router.get('/:id/logs', JobController.getJobLogs);

// Concurrency race condition simulation
router.post('/:id/simulate-race', JobController.simulateRace);

module.exports = router;
