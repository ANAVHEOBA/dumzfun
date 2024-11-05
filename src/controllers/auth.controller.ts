// controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { WalletService } from '../services/wallet.service';
import { CustomError, ErrorCode } from '../types/error.types';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async connectWallet(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletAddress } = req.body;
      const nonce = await AuthService.initiateWalletConnection(walletAddress);
      
      res.json({
        success: true,
        data: {
          nonce,
          walletAddress,
          message: `Verify wallet ownership with nonce: ${nonce}`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifySignature(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletAddress, signature } = req.body;
      const authResult = await AuthService.verifyWalletSignature(
        walletAddress,
        signature
      );

      res.json({
        success: true,
        data: authResult
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const newTokens = await AuthService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: newTokens
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await AuthService.logout(req.token!);
      
      res.json({
        success: true,
        message: 'Successfully logged out'
      });
    } catch (error) {
      next(error);
    }
  }
}