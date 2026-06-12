// src/middleware/errorMiddleware.js
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, path: req.path });
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
