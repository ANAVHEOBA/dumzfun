// config/arweave.ts
import Arweave from 'arweave';
import { arweaveConfig } from './index';
import { Logger } from '../utils/logger.utils';

export const arweave = Arweave.init({
  host: arweaveConfig.host,
  port: arweaveConfig.port,
  protocol: arweaveConfig.protocol,
  timeout: arweaveConfig.timeout,
  logging: arweaveConfig.logging,
});

export const arweaveKey = arweaveConfig.key;

export const initArweave = async (): Promise<void> => {
  try {
    const networkInfo = await arweave.network.getInfo();
    Logger.info('Successfully connected to Arweave network', {
      height: networkInfo.height,
      peers: networkInfo.peers,
      version: networkInfo.version,
    });
  } catch (error) {
    Logger.error('Failed to connect to Arweave network:', error);
    process.exit(1);
  }
};