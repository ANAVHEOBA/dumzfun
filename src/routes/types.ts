// routes/types.ts
import { Request } from 'express';
import { IUser } from '../types/user.types';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  token?: string;
}

export interface PaginatedRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    [key: string]: string | undefined;
  };
}