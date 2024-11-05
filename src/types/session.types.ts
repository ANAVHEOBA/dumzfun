// types/session.types.ts
import { Document } from 'mongoose';

export interface ISession {
  walletAddress: string;
  token: string;
  refreshToken: string;
  isValid: boolean;
  expiresAt: Date;
  lastUsed: Date;
  userAgent?: string;
  ipAddress?: string;
  deviceInfo?: {
    type?: string;
    os?: string;
    browser?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionDocument extends ISession, Document {
  invalidate(): Promise<void>;
  updateLastUsed(): Promise<void>;
}

export interface ISessionCreate {
  walletAddress: string;
  token: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  deviceInfo?: {
    type?: string;
    os?: string;
    browser?: string;
  };
}

export interface ISessionUpdate {
  token?: string;
  refreshToken?: string;
  isValid?: boolean;
  lastUsed?: Date;
}