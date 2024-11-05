// middleware/logging.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.utils';

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log request
  Logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    headers: req.headers,
    query: req.query,
    body: req.body
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(body): Response {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Log response
    Logger.info('Outgoing response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      size: Buffer.byteLength(body)
    });

    return originalSend.call(this, body);
  };

  next();
};