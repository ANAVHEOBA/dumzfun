// services/session.service.ts
import { Session } from '../models/session.model';
import { CustomError, ErrorCode } from '../types/error.types';
import { ISession } from '../types/session.types';
import { CacheService } from './cache.service';

export class SessionService {
  private static readonly CACHE_PREFIX = 'session:';
  private static readonly CACHE_TTL = 300000; // 5 minutes

  static async getActiveSessions(walletAddress: string): Promise<ISession[]> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${walletAddress}`;
      const cachedSessions = CacheService.get<ISession[]>(cacheKey);

      if (cachedSessions) {
        return cachedSessions;
      }

      const sessions = await Session.find({
        walletAddress,
        isValid: true,
        expiresAt: { $gt: new Date() }
      }).lean();

      CacheService.set(cacheKey, sessions, this.CACHE_TTL);

      return sessions;
    } catch (error) {
      throw new CustomError(
        'Failed to fetch active sessions',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async invalidateSession(
    sessionId: string,
    walletAddress: string
  ): Promise<void> {
    try {
      const session = await Session.findById(sessionId);

      if (!session) {
        throw new CustomError(
          'Session not found',
          ErrorCode.NOT_FOUND,
          404
        );
      }

      if (session.walletAddress !== walletAddress) {
        throw new CustomError(
          'Unauthorized to invalidate this session',
          ErrorCode.AUTHORIZATION_ERROR,
          403
        );
      }

      await session.invalidate();

      // Clear cache
      const cacheKey = `${this.CACHE_PREFIX}${walletAddress}`;
      CacheService.delete(cacheKey);
    } catch (error) {
      throw new CustomError(
        'Failed to fetch system stats',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async invalidateAllSessions(walletAddress: string): Promise<void> {
    try {
      await Session.updateMany(
        { walletAddress, isValid: true },
        { $set: { isValid: false } }
      );

      // Clear cache
      const cacheKey = `${this.CACHE_PREFIX}${walletAddress}`;
      CacheService.delete(cacheKey);
    } catch (error) {
      throw new CustomError(
        'Failed to invalidate all sessions',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async createSession(
    walletAddress: string,
    token: string,
    refreshToken: string,
    deviceInfo?: {
      userAgent?: string;
      ipAddress?: string;
      deviceType?: string;
    }
  ): Promise<ISession> {
    try {
      const session = await Session.create({
        walletAddress,
        token,
        refreshToken,
        isValid: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        userAgent: deviceInfo?.userAgent,
        ipAddress: deviceInfo?.ipAddress,
        deviceInfo: {
          type: deviceInfo?.deviceType
        }
      });

      // Clear cache
      const cacheKey = `${this.CACHE_PREFIX}${walletAddress}`;
      CacheService.delete(cacheKey);

      return session.toObject();
    } catch (error) {
      throw new CustomError(
        'Failed to create session',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async validateSession(token: string): Promise<ISession> {
    try {
      const session = await Session.findOne({
        token,
        isValid: true,
        expiresAt: { $gt: new Date() }
      });

      if (!session) {
        throw new CustomError(
          'Invalid or expired session',
          ErrorCode.AUTHENTICATION_ERROR,
          401
        );
      }

      await session.updateLastUsed();
      return session.toObject();
    } catch (error) {
      throw new CustomError(
        'Failed to fetch system stats',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await Session.deleteMany({
        $or: [
          { expiresAt: { $lte: new Date() } },
          { isValid: false }
        ]
      });
    } catch (error) {
      throw new CustomError(
        'Failed to cleanup expired sessions',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }
}

// Run cleanup periodically
setInterval(() => {
  SessionService.cleanupExpiredSessions()
    .catch(error => console.error('Session cleanup failed:', error));
}, 3600000); // Every hour