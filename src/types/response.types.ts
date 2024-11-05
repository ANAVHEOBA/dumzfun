// types/response.types.ts
import { IUser, IUserWithToken } from './user.types';
import { IProfile } from './profile.types';
import { ISession } from './session.types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface AuthResponse extends ApiResponse<IUserWithToken> {}

export interface ProfileResponse extends ApiResponse<IProfile> {}

export interface SessionResponse extends ApiResponse<ISession> {}

export interface NonceResponse extends ApiResponse<{
  nonce: string;
  walletAddress: string;
}> {}

export interface TokenResponse extends ApiResponse<{
  token: string;
  refreshToken: string;
}> {}

export interface ValidationResponse extends ApiResponse<{
  isValid: boolean;
  errors?: string[];
}> {}