// middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError, ErrorCode } from '../types/error.types';
import { validateWalletAddress } from '../utils/validation.utils';
import { Schema } from 'joi';

export const validateSchema = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        throw new CustomError(
          error.details[0].message,
          ErrorCode.VALIDATION_ERROR,
          400
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateWallet = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const walletAddress = req.body.walletAddress || req.params.walletAddress;
    
    if (!walletAddress) {
      throw new CustomError(
        'Wallet address is required',
        ErrorCode.VALIDATION_ERROR,
        400
      );
    }

    if (!validateWalletAddress(walletAddress)) {
      throw new CustomError(
        'Invalid wallet address format',
        ErrorCode.VALIDATION_ERROR,
        400
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};