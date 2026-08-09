const path = require('path');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err.stack || err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (req.accepts('html') && !req.path.startsWith('/api')) {
    return res.status(statusCode).sendFile(path.join(__dirname, '../../dashboard/error.html'));
  }

  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: message
  });
};

module.exports = errorHandler;
