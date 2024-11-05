// services/wallet.service.ts
import { ethers } from 'ethers';
import crypto from 'crypto';
import { CustomError, ErrorCode } from '../types/error.types';

export class WalletService {
  private static provider = ethers.getDefaultProvider();

  static generateNonce(): string {
    try {
      return crypto.randomBytes(32).toString('hex');
    } catch (error) {
      throw new CustomError(
        'Failed to generate nonce',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static validateWalletAddress(address: string): boolean {
    return ethers.utils.isAddress(address);
  }

  static verifySignature(
    message: string,
    signature: string,
    walletAddress: string
  ): boolean {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  static async getENSName(walletAddress: string): Promise<string | null> {
    try {
      return await this.provider.lookupAddress(walletAddress);
    } catch (error) {
      return null;
    }
  }

  static async getWalletBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      throw new CustomError(
        'Failed to get wallet balance',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  static async resolveENSName(ensName: string): Promise<string | null> {
    try {
      return await this.provider.resolveName(ensName);
    } catch (error) {
      return null;
    }
  }
}