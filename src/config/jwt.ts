// config/jwt.ts
import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET!,
  expiresIn: '24h',
  refreshExpiresIn: '7d',
};