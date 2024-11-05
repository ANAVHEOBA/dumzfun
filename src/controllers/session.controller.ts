// controllers/session.controller.ts
import { Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class SessionController {
  static async getActiveSessions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const walletAddress = req.user!.walletAddress;
      const sessions = await SessionService.getActiveSessions(walletAddress);

      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  }

  static async invalidateSession(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      const walletAddress = req.user!.walletAddress;

      await SessionService.invalidateSession(sessionId, walletAddress);

      res.json({
        success: true,
        message: 'Session successfully invalidated'
      });
    } catch (error) {
      next(error);
    }
  }

  static async invalidateAllSessions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const walletAddress = req.user!.walletAddress;
      await SessionService.invalidateAllSessions(walletAddress);

      res.json({
        success: true,
        message: 'All sessions successfully invalidated'
      });
    } catch (error) {
      next(error);
    }
  }
}