const logger = require('../logger');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err.message, { error: err, stack: err.stack });

  // Determine the status code
  const statusCode = err.statusCode || 500;

  // Send the error response
  res.status(statusCode).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
