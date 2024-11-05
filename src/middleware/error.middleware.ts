// middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types/error.types';
import { Logger } from '../utils/logger.utils';

export const errorMiddleware = (
  error: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  Logger.error('Error occurred:', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: {
      path: req.path,
      method: req.method,
      ip: req.ip,
      headers: req.headers
    }
  });

  if (error instanceof CustomError) {
    res.status(error.status).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        status: error.status
      }
    });
    return;
  }

  // Handle mongoose validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation Error',
        code: 'VALIDATION_ERROR',
        status: 400,
        details: error.message
      }
    });
    return;
  }

  // Handle duplicate key errors
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    res.status(409).json({
      success: false,
      error: {
        message: 'Duplicate Entry',
        code: 'DUPLICATE_ERROR',
        status: 409,
        details: error.message
      }
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      status: 500
    }
  });
};