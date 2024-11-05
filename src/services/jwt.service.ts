// services/jwt.service.ts
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { jwtConfig } from '../config/jwt';
import { IJWTPayload } from '../types/jwt.types';
import { CustomError } from '../utils/error.utils';

export class JWTService {
  static generateToken(payload: Omit<IJWTPayload, 'exp' | 'iat'>): string {
    try {
      return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
      });
    } catch (error) {
      throw new CustomError('Error generating token', 500);
    }
  }

  static generateRefreshToken(): string {
    return uuidv4();
  }

  static verifyToken(token: string): IJWTPayload {
    try {
      return jwt.verify(token, jwtConfig.secret) as IJWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new CustomError('Token expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid token', 401);
      }
      throw new CustomError('Token verification failed', 401);
    }
  }

  static decodeToken(token: string): IJWTPayload | null {
    try {
      return jwt.decode(token) as IJWTPayload;
    } catch (error) {
      return null;
    }
  }
}