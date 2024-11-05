// utils/logger.utils.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { logConfig } from '../config';

interface QueryOptions {
  filters: any;
  skip: number;
  limit: number;
  sort: any;
}

interface QueryResult {
  entries: Array<{
    timestamp: Date;
    level: string;
    message: string;
    metadata?: any;
  }>;
  total: number;
}

export class Logger {
  private static logger = winston.createLogger({
    level: logConfig.level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple()
      }),
      new DailyRotateFile({
        filename: 'logs/%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: logConfig.maxSize,
        maxFiles: logConfig.maxFiles
      })
    ]
  });

  static info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  static error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  static warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  static debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  static async query(options: QueryOptions): Promise<QueryResult> {
    try {
      const { filters, skip, limit, sort } = options;

      // This is a basic implementation using winston's query interface
      // You might want to implement a more sophisticated solution for production
      return new Promise((resolve, reject) => {
        this.logger.query({
          from: filters.timestamp?.$gte,
          until: filters.timestamp?.$lte,
          limit,
          start: skip,
          order: 'desc',
          fields: ['timestamp', 'level', 'message', 'metadata']
        }, (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          const logs = results.file || [];
          resolve({
            entries: logs,
            total: logs.length // Note: This is not accurate for pagination
          });
        });
      });
    } catch (error) {
      throw new Error('Failed to query logs');
    }
  }
}