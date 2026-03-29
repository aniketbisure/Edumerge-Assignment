import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    const messages = Object.values(err.errors).map((val: any) => val.message);
    message = `Validation Error: ${messages.join(', ')}`;
  }

  // Handle Mongoose Cast Error (invalid ID)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id of ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token has expired or is invalid';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler;
