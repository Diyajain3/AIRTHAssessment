const { ValidationError } = require('./errorHandler');

const ALLOWED_STATUSES = ['pending', 'running', 'completed', 'failed'];

function validateCreateJob(req, res, next) {
  const { title, type } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new ValidationError('Job title is required and must be a non-empty string.'));
  }

  if (title.trim().length > 200) {
    return next(new ValidationError('Job title must not exceed 200 characters.'));
  }

  if (!type || typeof type !== 'string' || type.trim().length === 0) {
    return next(new ValidationError('Job type is required and must be a non-empty string.'));
  }

  if (type.trim().length > 50) {
    return next(new ValidationError('Job type must not exceed 50 characters.'));
  }

  req.body.title = title.trim();
  req.body.type = type.trim();
  next();
}

function validateUpdateStatus(req, res, next) {
  const { status } = req.body || {};

  if (!status || typeof status !== 'string') {
    return next(new ValidationError('Status is required in request body.'));
  }

  const normalizedStatus = status.trim().toLowerCase();

  if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
    return next(
      new ValidationError(
        `Invalid status '${status}'. Allowed statuses are: ${ALLOWED_STATUSES.join(', ')}.`
      )
    );
  }

  req.body.status = normalizedStatus;
  next();
}

module.exports = {
  validateCreateJob,
  validateUpdateStatus,
  ALLOWED_STATUSES
};
