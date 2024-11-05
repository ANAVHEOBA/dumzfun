// services/auth.service.ts
import { User } from '../models/user.model';
import { Session } from '../models/session.model';
import { WalletService } from './wallet.service';
import { JWTService } from './jwt.service';
import { CacheService } from './cache.service';
import { CustomError, ErrorCode } from '../types/error.types';
import { IUser, IUserWithToken } from '../types/user.types';
import { ISession } from '../types/session.types';

export class AuthService {
  private static readonly NONCE_CACHE_PREFIX = 'nonce:';
  private static readonly NONCE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static async initiateWalletConnection(walletAddress: string): Promise<string> {
    try {
      // Validate wallet address
      if (!WalletService.validateWalletAddress(walletAddress)) {
        throw new CustomError(
          'Invalid wallet address',
          ErrorCode.VALIDATION_ERROR,
          400
        );
      }

      // Generate nonce
      const nonce = WalletService.generateNonce();
      
      // Cache nonce
      const cacheKey = `${this.NONCE_CACHE_PREFIX}${walletAddress}`;
      CacheService.set(cacheKey, nonce, this.NONCE_CACHE_TTL);

      return nonce;
    } catch (error) {
      throw new CustomError(
        'Failed to initiate wallet connection',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async verifyWalletSignature(
    walletAddress: string,
    signature: string
  ): Promise<IUserWithToken> {
    try {
      // Get cached nonce
      const cacheKey = `${this.NONCE_CACHE_PREFIX}${walletAddress}`;
      const nonce = CacheService.get<string>(cacheKey);

      if (!nonce) {
        throw new CustomError(
          'Nonce expired or not found',
          ErrorCode.AUTHENTICATION_ERROR,
          401
        );
      }

      // Verify signature
      const message = `Verify wallet ownership with nonce: ${nonce}`;
      const isValid = WalletService.verifySignature(message, signature, walletAddress);

      if (!isValid) {
        throw new CustomError(
          'Invalid signature',
          ErrorCode.AUTHENTICATION_ERROR,
          401
        );
      }

      // Find or create user
      let user = await User.findOne({ walletAddress });
      if (!user) {
        user = await User.create({
          walletAddress,
          roles: ['user'],
          isActive: true
        });
      }

      // Generate tokens
      const token = JWTService.generateToken({
        walletAddress: user.walletAddress,
        roles: user.roles
      });

      const refreshToken = JWTService.generateRefreshToken();

      // Create session
      await Session.create({
        walletAddress,
        token,
        refreshToken,
        isValid: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Clear nonce cache
      CacheService.delete(cacheKey);

      return {
        user: user.toObject(),
        token,
        refreshToken
      };
    } catch (error) {
      throw new CustomError(
        error.message || 'Authentication failed',
        error.code || ErrorCode.AUTHENTICATION_ERROR,
        error.status || 401
      );
    }
  }

  static async refreshToken(refreshToken: string): Promise<IUserWithToken> {
    try {
      const session = await Session.findOne({
        refreshToken,
        isValid: true,
        expiresAt: { $gt: new Date() }
      });

      if (!session) {
        throw new CustomError(
          'Invalid or expired refresh token',
          ErrorCode.AUTHENTICATION_ERROR,
          401
        );
      }

      const user = await User.findOne({ walletAddress: session.walletAddress });
      if (!user) {
        throw new CustomError(
          'User not found',
          ErrorCode.NOT_FOUND,
          404
        );
      }

      // Generate new tokens
      const newToken = JWTService.generateToken({
        walletAddress: user.walletAddress,
        roles: user.roles
      });

      const newRefreshToken = JWTService.generateRefreshToken();

      // Update session
      session.token = newToken;
      session.refreshToken = newRefreshToken;
      session.lastUsed = new Date();
      await session.save();

      return {
        user: user.toObject(),
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new CustomError(
        error.message || 'Token refresh failed',
        error.code || ErrorCode.AUTHENTICATION_ERROR,
        error.status || 401
      );
    }
  }

  static async logout(token: string): Promise<void> {
    try {
      const session = await Session.findOne({ token });
      if (session) {
        await session.invalidate();
      }
    } catch (error) {
      throw new CustomError(
        'Logout failed',
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

      return session;
    } catch (error) {
      throw new CustomError(
        error.message || 'Session validation failed',
        error.code || ErrorCode.AUTHENTICATION_ERROR,
        error.status || 401
      );
    }
  }
}