// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwt.service';
import { AuthService } from '../services/auth.service';
import { CustomError, ErrorCode } from '../types/error.types';
import { IUserRequest } from '../types/user.types';
import { IJWTPayload } from '../types/jwt.types';

export interface AuthRequest extends Request {
  user?: IUserRequest;
  token?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError(
        'No token provided',
        ErrorCode.AUTHENTICATION_ERROR,
        401
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = JWTService.verifyToken(token) as IJWTPayload;

    // Validate session
    const session = await AuthService.validateSession(token);
    if (!session) {
      throw new CustomError(
        'Invalid session',
        ErrorCode.AUTHENTICATION_ERROR,
        401
      );
    }

    // Only include necessary user information in the request
    req.user = {
      id: decoded.id,
      walletAddress: decoded.walletAddress,
      roles: decoded.roles
    };
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};