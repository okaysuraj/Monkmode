import { errorResponse } from '../utils/apiResponse.js';

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.originalUrl} - ${statusCode}:`, err);

  const errors = process.env.NODE_ENV === 'development' ? { stack: err.stack } : null;

  return errorResponse(res, message, statusCode, errors);
};
