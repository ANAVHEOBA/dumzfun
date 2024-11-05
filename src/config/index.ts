// config/index.ts
import dotenv from 'dotenv';
import { IAppConfig, IJWTConfig, IDatabaseConfig } from '../types/config.types';

// Load environment variables
dotenv.config();

export const appConfig: IAppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
};

export const jwtConfig: IJWTConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

export const dbConfig: IDatabaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wallet-auth',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
};

export const arweaveConfig = {
  host: process.env.ARWEAVE_HOST || 'arweave.net',
  port: parseInt(process.env.ARWEAVE_PORT || '443', 10),
  protocol: process.env.ARWEAVE_PROTOCOL || 'https',
  timeout: parseInt(process.env.ARWEAVE_TIMEOUT || '20000', 10),
  logging: process.env.ARWEAVE_LOGGING === 'true',
  key: process.env.ARWEAVE_KEY ? JSON.parse(process.env.ARWEAVE_KEY) : null,
};

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
};

export const logConfig = {
  level: process.env.LOG_LEVEL || 'info',
  file: process.env.LOG_FILE || 'app.log',
  maxSize: process.env.LOG_MAX_SIZE || '10m',
  maxFiles: parseInt(process.env.LOG_MAX_FILES || '7', 10),
};

export const docsConfig = {
  enabled: process.env.ENABLE_API_DOCS === 'true',
  username: process.env.API_DOCS_USERNAME || 'admin',
  password: process.env.API_DOCS_PASSWORD || 'password',
};