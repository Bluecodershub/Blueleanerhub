'use strict';

/**
 * Wraps an async route handler so unhandled promise rejections are forwarded
 * to Express's next(err) error handler instead of crashing the process.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
