// services/cache.service.ts
import { CustomError, ErrorCode } from '../types/error.types';

interface CacheItem<T> {
  value: T;
  expiry: number;
}

export class CacheService {
  private static cache: Map<string, CacheItem<any>> = new Map();
  private static readonly DEFAULT_TTL = 3600000; // 1 hour

  static set<T>(
    key: string,
    value: T,
    ttl: number = CacheService.DEFAULT_TTL
  ): void {
    try {
      const expiry = Date.now() + ttl;
      CacheService.cache.set(key, { value, expiry });
    } catch (error) {
      throw new CustomError(
        'Cache set failed',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = CacheService.cache.get(key);
      
      if (!item) return null;
      
      if (Date.now() > item.expiry) {
        CacheService.cache.delete(key);
        return null;
      }

      return item.value as T;
    } catch (error) {
      throw new CustomError(
        'Cache get failed',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static delete(key: string): void {
    try {
      CacheService.cache.delete(key);
    } catch (error) {
      throw new CustomError(
        'Cache delete failed',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static clear(): void {
    try {
      CacheService.cache.clear();
    } catch (error) {
      throw new CustomError(
        'Cache clear failed',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static cleanup(): void {
    try {
      const now = Date.now();
      for (const [key, item] of CacheService.cache.entries()) {
        if (now > item.expiry) {
          CacheService.cache.delete(key);
        }
      }
    } catch (error) {
      throw new CustomError(
        'Cache cleanup failed',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }
}

// Run cleanup periodically
setInterval(() => {
  CacheService.cleanup();
}, 300000); // Every 5 minutes