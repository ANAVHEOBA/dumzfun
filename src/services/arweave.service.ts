// services/arweave.service.ts
import { arweave, arweaveKey } from '../config/arweave';
import { CustomError, ErrorCode } from '../types/error.types';
import { CacheService } from './cache.service';

export class ArweaveService {
  private static readonly CACHE_PREFIX = 'arweave:';
  private static readonly CACHE_TTL = 3600000; // 1 hour

  static async storeData(data: any): Promise<string> {
    try {
      const transaction = await arweave.createTransaction({
        data: JSON.stringify(data)
      }, arweaveKey);

      transaction.addTag('Content-Type', 'application/json');
      transaction.addTag('App-Name', 'WalletAuthApp');
      transaction.addTag('Version', '1.0.0');

      await arweave.transactions.sign(transaction, arweaveKey);
      await arweave.transactions.post(transaction);

      return transaction.id;
    } catch (error) {
      throw new CustomError(
        'Failed to store data on Arweave',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async getData(transactionId: string): Promise<any> {
    try {
      // Check cache
      const cacheKey = `${this.CACHE_PREFIX}${transactionId}`;
      const cachedData = CacheService.get(cacheKey);
      if (cachedData) return cachedData;

      const transaction = await arweave.transactions.get(transactionId);
      const data = transaction.get('data', { decode: true, string: true });
      const parsedData = JSON.parse(data as string);

      // Cache data
      CacheService.set(cacheKey, parsedData, this.CACHE_TTL);

      return parsedData;
    } catch (error) {
      throw new CustomError(
        'Failed to fetch data from Arweave',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async getTransactionStatus(transactionId: string): Promise<string> {
    try {
      const status = await arweave.transactions.getStatus(transactionId);
      return status.status === 200 ? 'confirmed' : 'pending';
    } catch (error) {
      throw new CustomError(
        'Failed to check transaction status',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }
}