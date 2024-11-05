// middleware/role.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { CustomError, ErrorCode } from '../types/error.types';
import { UserRole } from '../types/user.types';

export const roleMiddleware = (requiredRoles: UserRole[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError(
          'User not authenticated',
          ErrorCode.AUTHENTICATION_ERROR,
          401
        );
      }

      const hasRequiredRole = req.user.roles.some(role => 
        requiredRoles.includes(role as UserRole)
      );

      if (!hasRequiredRole) {
        throw new CustomError(
          'Insufficient permissions',
          ErrorCode.AUTHORIZATION_ERROR,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Convenience middleware factories
export const adminOnly = roleMiddleware([UserRole.ADMIN]);
export const creatorOnly = roleMiddleware([UserRole.ADMIN, UserRole.CREATOR]);
export const userOnly = roleMiddleware([UserRole.ADMIN, UserRole.CREATOR, UserRole.USER]);