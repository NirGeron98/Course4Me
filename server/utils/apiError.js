// Unified error utilities. All HTTP error responses share one JSON shape:
//   { message: <Hebrew user-facing>, error?: <English dev detail, non-prod only> }
// Dev logs are English; user-facing messages are Hebrew.

class AppError extends Error {
  constructor(message, status = 500, cause) {
    super(message);
    this.status = status;
    this.cause = cause;
  }
}

const sendError = (res, status, message, err) => {
  const body = { message };
  if (process.env.NODE_ENV !== "production" && err) {
    body.error = err.message || String(err);
  }
  return res.status(status).json(body);
};

// Wraps an async route handler so rejections flow to the global error handler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { AppError, sendError, asyncHandler };
