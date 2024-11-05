// types/user.types.ts
import { Document, Types } from 'mongoose';

export enum UserRole {
  USER = 'user',
  CREATOR = 'creator',
  ADMIN = 'admin'
}

// Base interface without id
export interface IUserBase {
  walletAddress: string;
  nonce: string;
  roles: string[];
  isActive: boolean;
  lastLogin?: Date;
  ensName?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for general use (with string id)
export interface IUser extends IUserBase {
  id: string;
}

// Interface for Mongoose document (with ObjectId)
export interface IUserDocument extends IUserBase, Document {
  compareNonce(nonce: string): Promise<boolean>;
  generateNewNonce(): Promise<string>;
}

export interface IUserRequest {
  id: string;
  walletAddress: string;
  roles: string[];
}

export interface IUserCreate {
  walletAddress: string;
  roles?: UserRole[];
}

export interface IUserUpdate {
  roles?: UserRole[];
  isActive?: boolean;
  lastLogin?: Date;
}

export interface IUserWithToken {
  user: IUser;
  token: string;
  refreshToken: string;
}