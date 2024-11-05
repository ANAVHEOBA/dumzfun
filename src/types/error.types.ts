// types/error.types.ts
export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    CONFLICT = 'CONFLICT',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    BAD_REQUEST = 'BAD_REQUEST',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
  }
  
  export interface IErrorResponse {
    message: string;
    code: ErrorCode;
    status: number;
    details?: any;
  }
  
  export class CustomError extends Error {
    code: ErrorCode;
    status: number;
    details?: any;
  
    constructor(message: string, code: ErrorCode, status: number, details?: any) {
      super(message);
      this.code = code;
      this.status = status;
      this.details = details;
      Error.captureStackTrace(this, this.constructor);
    }
  }