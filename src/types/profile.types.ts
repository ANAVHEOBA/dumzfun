// types/profile.types.ts
import { Document } from 'mongoose';

export interface IProfile {
  walletAddress: string;
  arweaveId: string;
  username: string;
  bio: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    discord?: string;
    website?: string;
  };
  isActive: boolean;
  version: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProfileDocument extends IProfile, Document {
  updateVersion(): Promise<void>;
  deactivate(): Promise<void>;
  addSocialLink(platform: string, url: string): Promise<void>;
}

export interface IProfileCreate {
  walletAddress: string;
  username: string;
  bio: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    discord?: string;
    website?: string;
  };
}

export interface IProfileUpdate {
  username?: string;
  bio?: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    discord?: string;
    website?: string;
  };
  metadata?: Record<string, any>;
}

export interface IProfileResponse extends IProfile {
  arweaveData?: any;
}