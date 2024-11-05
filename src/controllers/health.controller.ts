// controllers/health.controller.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { redis } from '../config/redis';
import { arweave } from '../config/arweave';
import { CustomError, ErrorCode } from '../types/error.types';
import { Logger } from '../utils/logger.utils';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    [key: string]: {
      status: 'connected' | 'disconnected' | 'error';
      latency?: number;
      details?: any;
    };
  };
}

interface ArweaveNetworkInfo {
  network: string;
  version: number;
  release: number;
  height: number;
  current: string;
  blocks: number;
  peers: number;
  queue_length: number;
  node_state_latency: number;
}

export class HealthController {
  static async checkHealth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const isDbConnected = mongoose.connection.readyState === 1;

      res.json({
        success: true,
        data: {
          status: isDbConnected ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          services: {
            database: isDbConnected ? 'connected' : 'disconnected',
            api: 'running'
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkDetailedHealth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const startTime = Date.now();
      const healthStatus: HealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {}
      };

      // Check Database
      try {
        const dbStartTime = Date.now();
        if (mongoose.connection.db) {
          await mongoose.connection.db.admin().ping();
          healthStatus.services.database = {
            status: 'connected',
            latency: Date.now() - dbStartTime,
            details: {
              readyState: mongoose.connection.readyState,
              host: mongoose.connection.host,
              name: mongoose.connection.name
            }
          };
        } else {
          throw new Error('Database connection not initialized');
        }
      } catch (error) {
        healthStatus.status = 'unhealthy';
        healthStatus.services.database = {
          status: 'error',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }

      // Check Redis
      try {
        const redisStartTime = Date.now();
        await redis.ping();
        healthStatus.services.redis = {
          status: 'connected',
          latency: Date.now() - redisStartTime
        };
      } catch (error) {
        healthStatus.status = 'unhealthy';
        healthStatus.services.redis = {
          status: 'error',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }

      // Check Arweave
      try {
        const arweaveStartTime = Date.now();
        const networkInfo = await arweave.network.getInfo() as ArweaveNetworkInfo;
        healthStatus.services.arweave = {
          status: 'connected',
          latency: Date.now() - arweaveStartTime,
          details: {
            height: networkInfo.height,
            peers: networkInfo.peers, // peers is now a number
            version: networkInfo.version
          }
        };
      } catch (error) {
        healthStatus.status = 'unhealthy';
        healthStatus.services.arweave = {
          status: 'error',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }

      // Check Memory Usage
      const memoryUsage = process.memoryUsage();
      healthStatus.services.memory = {
        status: 'connected',
        details: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
        }
      };

      // controllers/health.controller.ts
// ... (previous code remains the same until the api details section)

      // Add overall API latency
      healthStatus.services.api = {
        status: 'connected',
        latency: Date.now() - startTime,
        details: {
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform,
          env: process.env.NODE_ENV || 'development'
        }
      };

      // Log health check results
      Logger.info('Detailed health check completed', healthStatus);

      res.json({
        success: true,
        data: healthStatus
      });
    } catch (error) {
      next(new CustomError(
        'Health check failed',
        ErrorCode.INTERNAL_ERROR,
        500
      ));
    }
  }
}