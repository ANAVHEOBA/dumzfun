// types/request.types.ts
import { Request } from 'express';
import { IUser } from './user.types';
import { ISession } from './session.types';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  session?: ISession;
}

export interface SignatureRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface ConnectWalletRequest {
  walletAddress: string;
}

export interface ProfileRequest {
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

export interface TokenRefreshRequest {
  refreshToken: string;
}