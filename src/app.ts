// app.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database';
import { initArweave } from './config/arweave';
import { initRedis, redis } from './config/redis';
import { appConfig, docsConfig } from './config';
import routes from './routes';
import docsRoutes from './routes/docs.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import { docsAuthMiddleware } from './middleware/docs-auth.middleware';
import { Logger } from './utils/logger.utils';
import { CustomError, ErrorCode } from './types/error.types';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middlewares
    this.app.use(helmet({
      contentSecurityPolicy: appConfig.env === 'production',
      crossOriginEmbedderPolicy: appConfig.env === 'production',
    }));

    // CORS configuration
    this.app.use(cors({
      origin: appConfig.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: appConfig.rateLimitWindow, // Default: 15 minutes
      max: appConfig.rateLimitMax, // Default: 100 requests per windowMs
      message: {
        success: false,
        error: {
          message: 'Too many requests, please try again later',
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          status: 429,
        },
      },
    });

    // Apply rate limiter to all routes
    this.app.use(limiter);

    // Body parsing middlewares
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Compression
    this.app.use(compression());

    // Logging
    if (appConfig.env === 'development') {
      this.app.use(morgan('dev'));
    }
    this.app.use(loggingMiddleware);

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: appConfig.env,
          version: appConfig.version,
        },
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/v1', routes);

    // API documentation (only in non-production environments or if explicitly enabled)
    if (docsConfig.enabled) {
      this.app.use('/api/docs', docsAuthMiddleware, docsRoutes);
    }

    // Handle 404
    this.app.use((req, res, next) => {
      next(new CustomError(
        `Cannot ${req.method} ${req.path}`,
        ErrorCode.NOT_FOUND,
        404
      ));
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  public async listen(): Promise<void> {
    try {
      // Initialize services
      await this.initializeServices();

      // Start server
      this.app.listen(appConfig.port, () => {
        Logger.info(`🚀 Server running on port ${appConfig.port} in ${appConfig.env} mode`);
        if (docsConfig.enabled) {
          Logger.info(`📚 API Documentation available at http://localhost:${appConfig.port}/api/docs`);
        }
      });

      // Handle process events
      this.setupProcessHandlers();
    } catch (error) {
      Logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupProcessHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      Logger.error('Uncaught Exception:', error);
      this.gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      Logger.error('Unhandled Rejection:', reason);
      this.gracefulShutdown('UNHANDLED_REJECTION');
    });

    // Handle shutdown signals
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
  }

  private async initializeServices(): Promise<void> {
    try {
      Logger.info('Initializing services...');

      // Connect to database
      await connectDatabase();
      Logger.info('✅ Database connected');

      // Initialize Arweave
      await initArweave();
      Logger.info('✅ Arweave initialized');

      // Initialize Redis
      await initRedis();
      Logger.info('✅ Redis initialized');

      Logger.info('All services initialized successfully');
    } catch (error) {
      Logger.error('Service initialization failed:', error);
      throw error;
    }
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    try {
      Logger.info(`Received ${signal}. Starting graceful shutdown...`);

      // Close database connection
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        Logger.info('Database connection closed');
      }

      // Close Redis connection
      await redis.quit();
      Logger.info('Redis connection closed');

      Logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      Logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and export app instance
const app = new App();
export default app;

// Start server if this file is run directly
if (require.main === module) {
  app.listen().catch((error) => {
    Logger.error('Failed to start application:', error);
    process.exit(1);
  });
}