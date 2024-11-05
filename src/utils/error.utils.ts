// utils/error.utils.ts
export class CustomError extends Error {
    status: number;
    code?: string;
  
    constructor(message: string, status: number, code?: string) {
      super(message);
      this.name = this.constructor.name;
      this.status = status;
      this.code = code;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export const errorCodes = {
    INVALID_INPUT: 'INVALID_INPUT',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    ARWEAVE_ERROR: 'ARWEAVE_ERROR',
    WALLET_ERROR: 'WALLET_ERROR',
    RATE_LIMIT: 'RATE_LIMIT'
  } as const;
  
  export const createError = (
    message: string,
    status: number,
    code: keyof typeof errorCodes
  ): CustomError => {
    return new CustomError(message, status, errorCodes[code]);
  };