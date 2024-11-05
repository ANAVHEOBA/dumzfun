// config/redis.ts
import Redis from 'ioredis';
import { redisConfig } from './index';
import { Logger } from '../utils/logger.utils';

export const redis = new Redis({
  host: redisConfig.host,
  port: redisConfig.port,
  password: redisConfig.password,
  db: redisConfig.db,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  Logger.info('Successfully connected to Redis');
});

redis.on('error', (error) => {
  Logger.error('Redis connection error:', error);
});

redis.on('close', () => {
  Logger.warn('Redis connection closed');
});

export const initRedis = async (): Promise<void> => {
  try {
    await redis.ping();
  } catch (error) {
    Logger.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
};