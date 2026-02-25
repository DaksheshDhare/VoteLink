/**
 * Async Handler Utility
 * Wraps async route handlers to automatically catch errors
 * and pass them to Express error handling middleware.
 */
const asynchandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asynchandler;
