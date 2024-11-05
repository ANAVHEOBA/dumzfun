// controllers/admin.controller.ts
import { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../types/user.types';

export class AdminController {
  static async getUsers(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const users = await AdminService.getUsers(
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRoles(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletAddress } = req.params;
      const { roles } = req.body;

      const user = await AdminService.updateUserRoles(
        walletAddress,
        roles as UserRole[]
      );

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSystemStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await AdminService.getSystemStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async invalidateUserSessions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletAddress } = req.params;
      await AdminService.invalidateUserSessions(walletAddress);

      res.json({
        success: true,
        message: 'All user sessions invalidated'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSystemLogs(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { 
        startDate, 
        endDate, 
        level, 
        limit = 100, 
        page = 1 
      } = req.query;

      const logs = await AdminService.getSystemLogs({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        level: level as string,
        limit: Number(limit),
        page: Number(page)
      });

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
}