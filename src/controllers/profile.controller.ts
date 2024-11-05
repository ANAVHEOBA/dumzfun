// controllers/profile.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { CustomError, ErrorCode } from '../types/error.types';
import { IProfileCreate, IProfileUpdate } from '../types/profile.types';

interface CreateProfileRequest extends AuthRequest {
  body: IProfileCreate;
}

interface UpdateProfileRequest extends AuthRequest {
  body: IProfileUpdate;
}

export class ProfileController {
  static async createProfile(
    req: CreateProfileRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletAddress } = req.user!;
      // Combine the request body with the wallet address
      const profile = await ProfileService.createProfile({
        ...req.body,
        walletAddress
      });

      res.status(201).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(
    req: UpdateProfileRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletAddress } = req.user!;
      const profile = await ProfileService.updateProfile(walletAddress, req.body);

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletAddress } = req.params;
      const profile = await ProfileService.getProfile(walletAddress);

      if (!profile) {
        throw new CustomError(
          'Profile not found',
          ErrorCode.NOT_FOUND,
          404
        );
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletAddress } = req.user!;
      await ProfileService.deleteProfile(walletAddress);

      res.json({
        success: true,
        message: 'Profile deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOwnProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { walletAddress } = req.user!;
      const profile = await ProfileService.getProfile(walletAddress);

      if (!profile) {
        throw new CustomError(
          'Profile not found',
          ErrorCode.NOT_FOUND,
          404
        );
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }
}