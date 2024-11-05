// services/admin.service.ts
import { User } from '../models/user.model';
import { Session } from '../models/session.model';
import { Profile } from '../models/profile.model';
import { CustomError, ErrorCode } from '../types/error.types';
import { IUser, UserRole } from '../types/user.types';
import { CacheService } from './cache.service';
import { Logger } from '../utils/logger.utils';


interface LogQuery {
  startDate?: Date;
  endDate?: Date;
  level?: string;
  limit: number;
  page: number;
}

interface SystemLogs {
  logs: Array<{
    timestamp: Date;
    level: string;
    message: string;
    metadata?: any;
  }>;
  total: number;
  page: number;
  totalPages: number;
}


export class AdminService {
  private static readonly CACHE_PREFIX = 'admin:';
  private static readonly STATS_CACHE_TTL = 300000; // 5 minutes

  static async getUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: IUser[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [users, total] = await Promise.all([
        User.find()
          .skip(skip)
          .limit(limit)
          .select('-nonce')
          .lean(),
        User.countDocuments()
      ]);

      return {
        users,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new CustomError(
        'Failed to fetch users',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async updateUserRoles(
    walletAddress: string,
    roles: UserRole[]
  ): Promise<IUser> {
    try {
      const user = await User.findOne({ walletAddress });
      
      if (!user) {
        throw new CustomError(
          'User not found',
          ErrorCode.NOT_FOUND,
          404
        );
      }

      // Validate roles
      const validRoles = Object.values(UserRole);
      const invalidRoles = roles.filter(role => !validRoles.includes(role));
      
      if (invalidRoles.length > 0) {
        throw new CustomError(
          `Invalid roles: ${invalidRoles.join(', ')}`,
          ErrorCode.VALIDATION_ERROR,
          400
        );
      }

      user.roles = roles;
      await user.save();

      return user.toObject();
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'Failed to update user roles',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }


  static async getSystemStats(): Promise<any> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}stats`;
      const cachedStats = CacheService.get(cacheKey);
      
      if (cachedStats) {
        return cachedStats;
      }

      const [
        totalUsers,
        activeUsers,
        totalProfiles,
        activeSessions,
        roleDistribution
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        Profile.countDocuments(),
        Session.countDocuments({ isValid: true }),
        User.aggregate([
          { $unwind: '$roles' },
          { $group: { _id: '$roles', count: { $sum: 1 } } }
        ])
      ]);

      const stats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        profiles: {
          total: totalProfiles,
          profileRate: (totalProfiles / totalUsers * 100).toFixed(2) + '%'
        },
        sessions: {
          active: activeSessions,
          averagePerUser: (activeSessions / activeUsers).toFixed(2)
        },
        roles: roleDistribution.reduce((acc, { _id, count }) => ({
          ...acc,
          [_id]: count
        }), {}),
        timestamp: new Date()
      };

      CacheService.set(cacheKey, stats, this.STATS_CACHE_TTL);

      return stats;
    } catch (error) {
      throw new CustomError(
        'Failed to fetch system stats',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async invalidateUserSessions(walletAddress: string): Promise<void> {
    try {
      const user = await User.findOne({ walletAddress });
      
      if (!user) {
        throw new CustomError(
          'User not found',
          ErrorCode.NOT_FOUND,
          404
        );
      }

      await Session.updateMany(
        { walletAddress },
        { $set: { isValid: false } }
      );
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'Failed to invalidate user sessions',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }


  static async getSystemLogs(query: LogQuery): Promise<SystemLogs> {
    try {
      const { startDate, endDate, level, limit, page } = query;
      const skip = (page - 1) * limit;

      // Build query filters
      const filters: any = {};
      
      if (startDate) {
        filters.timestamp = { $gte: startDate };
      }
      
      if (endDate) {
        filters.timestamp = { ...filters.timestamp, $lte: endDate };
      }
      
      if (level) {
        filters.level = level;
      }

      // This get logs from the logging system
      // This is an example implementation - adjust based on your logging setup
      const logs = await Logger.query({
        filters,
        skip,
        limit,
        sort: { timestamp: -1 }
      });

      return {
        logs: logs.entries.map(log => ({
          timestamp: log.timestamp,
          level: log.level,
          message: log.message,
          metadata: log.metadata
        })),
        total: logs.total,
        page,
        totalPages: Math.ceil(logs.total / limit)
      };
    } catch (error) {
      throw new CustomError(
        'Failed to fetch system logs',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }
}