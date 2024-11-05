// server.ts
import app from './app';
import { Logger } from './utils/logger.utils';

const startServer = async () => {
  try {
    await app.listen();
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();