// types/jwt.types.ts
import { UserRole } from './user.types';

export interface IJWTPayload {
  walletAddress: string;
  roles: string[];
  id: string;
  iat?: number;
  exp?: number;
}

export interface IRefreshTokenPayload {
  walletAddress: string;
  tokenId: string;
  exp: number;
  iat: number;
}

export interface ITokenPair {
  token: string;
  refreshToken: string;
}

export interface IDecodedToken {
  walletAddress: string;
  roles: UserRole[];
  exp: number;
  iat: number;
}