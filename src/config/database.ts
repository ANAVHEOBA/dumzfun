// config/database.ts
import mongoose from 'mongoose';
import { dbConfig } from './index';
import { Logger } from '../utils/logger.utils';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(dbConfig.uri, {
      // Updated mongoose connection options
      autoCreate: true,
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    Logger.info('Successfully connected to database');

    mongoose.connection.on('error', (error) => {
      Logger.error('Database connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      Logger.warn('Database disconnected');
    });

    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        Logger.info('Database connection closed due to app termination');
        process.exit(0);
      } catch (error) {
        Logger.error('Error closing database connection:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    Logger.error('Database connection failed:', error);
    process.exit(1);
  }
};