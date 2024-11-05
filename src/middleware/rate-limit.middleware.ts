// middleware/rate-limit.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError, ErrorCode } from '../types/error.types';
import { CacheService } from '../services/cache.service';

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export const rateLimitMiddleware = (config: RateLimitConfig) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const key = `rateLimit:${req.ip}`;
      const current = CacheService.get<number>(key) || 0;

      if (current >= config.max) {
        throw new CustomError(
          'Too many requests',
          ErrorCode.RATE_LIMIT_EXCEEDED,
          429
        );
      }

      CacheService.set(key, current + 1, config.windowMs);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.max);
      res.setHeader('X-RateLimit-Remaining', config.max - (current + 1));
      res.setHeader('X-RateLimit-Reset', Date.now() + config.windowMs);

      next();
    } catch (error) {
      next(error);
    }
  };
};