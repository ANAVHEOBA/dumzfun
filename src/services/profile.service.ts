// services/profile.service.ts
import { Profile } from '../models/profile.model';
import { ArweaveService } from './arweave.service';
import { CacheService } from './cache.service';
import { CustomError, ErrorCode } from '../types/error.types';
import { IProfile, IProfileCreate, IProfileUpdate } from '../types/profile.types';

export class ProfileService {
  private static readonly CACHE_PREFIX = 'profile:';
  private static readonly CACHE_TTL = 3600; // 1 hour

  static async createProfile(data: IProfileCreate & { walletAddress: string }): Promise<IProfile> {
    try {
      const existingProfile = await Profile.findOne({ walletAddress: data.walletAddress });
      if (existingProfile) {
        throw new CustomError(
          'Profile already exists',
          ErrorCode.CONFLICT,
          409
        );
      }

      const profile = await Profile.create(data);

      await CacheService.set(
        `${this.CACHE_PREFIX}${data.walletAddress}`,
        profile.toObject(),
        this.CACHE_TTL
      );

      return profile.toObject();
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        'Failed to create profile',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async updateProfile(
    walletAddress: string,
    updates: IProfileUpdate
  ): Promise<IProfile> {
    try {
      const profile = await Profile.findOne({ walletAddress, isActive: true });
      if (!profile) {
        throw new CustomError(
          'Profile not found',
          ErrorCode.NOT_FOUND,
          404
        );
      }

      // Store updated data on Arweave
      const arweaveId = await ArweaveService.storeData({
        ...updates,
        walletAddress,
        version: profile.version + 1
      });

      // Update profile
      Object.assign(profile, updates, {
        arweaveId,
        version: profile.version + 1
      });
      await profile.save();

      // Update cache
      const cacheKey = `${this.CACHE_PREFIX}${walletAddress}`;
      CacheService.delete(cacheKey);

      return profile;
    } catch (error) {
      throw new CustomError(
        'Failed to fetch system stats',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async getProfile(walletAddress: string): Promise<IProfile> {
    try {
      // Check cache
      const cacheKey = `${this.CACHE_PREFIX}${walletAddress}`;
      const cachedProfile = CacheService.get<IProfile>(cacheKey);
      if (cachedProfile) return cachedProfile;

      // Get from database
      const profile = await Profile.findOne({
        walletAddress,
        isActive: true
      });

      if (!profile) {
        throw new CustomError(
          'Profile not found',
          ErrorCode.NOT_FOUND,
          404
        );
      }

      // Get Arweave data
      const arweaveData = await ArweaveService.getData(profile.arweaveId);
      const fullProfile = {
        ...profile.toObject(),
        arweaveData
      };

      // Cache profile
      CacheService.set(cacheKey, fullProfile, this.CACHE_TTL);

      return fullProfile;
    } catch (error) {
      throw new CustomError(
        'Failed to fetch system stats',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async deleteProfile(walletAddress: string): Promise<void> {
    try {
      const profile = await Profile.findOne({ walletAddress });
      if (!profile) {
        throw new CustomError(
          'Profile not found',
          ErrorCode.NOT_FOUND,
          404
        );
      }

      profile.isActive = false;
      await profile.save();

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
}