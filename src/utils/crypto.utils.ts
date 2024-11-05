// utils/crypto.utils.ts
import crypto from 'crypto';
import { CustomError } from './error.utils';

export class CryptoUtils {
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 64;
  private static readonly TAG_LENGTH = 16;
  private static readonly KEY_LENGTH = 32;
  private static readonly ITERATIONS = 100000;

  static generateRandomBytes(length: number): Buffer {
    try {
      return crypto.randomBytes(length);
    } catch (error) {
      throw new CustomError('Failed to generate random bytes', 500);
    }
  }

  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = crypto.randomBytes(this.SALT_LENGTH);
      const hash = await new Promise<Buffer>((resolve, reject) => {
        crypto.pbkdf2(
          password,
          salt,
          this.ITERATIONS,
          this.KEY_LENGTH,
          'sha512',
          (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey);
          }
        );
      });

      return `${salt.toString('hex')}:${hash.toString('hex')}`;
    } catch (error) {
      throw new CustomError('Failed to hash password', 500);
    }
  }

  static encrypt(text: string, secretKey: string): string {
    try {
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const salt = crypto.randomBytes(this.SALT_LENGTH);
      
      const key = crypto.pbkdf2Sync(
        secretKey,
        salt,
        this.ITERATIONS,
        this.KEY_LENGTH,
        'sha512'
      );

      const cipher = crypto.createCipheriv(
        this.ENCRYPTION_ALGORITHM,
        key,
        iv
      );

      const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final()
      ]);

      const tag = cipher.getAuthTag();

      return Buffer.concat([
        salt,
        iv,
        tag,
        encrypted
      ]).toString('base64');
    } catch (error) {
      throw new CustomError('Encryption failed', 500);
    }
  }

  static decrypt(encryptedData: string, secretKey: string): string {
    try {
      const buffer = Buffer.from(encryptedData, 'base64');

      const salt = buffer.slice(0, this.SALT_LENGTH);
      const iv = buffer.slice(
        this.SALT_LENGTH,
        this.SALT_LENGTH + this.IV_LENGTH
      );
      const tag = buffer.slice(
        this.SALT_LENGTH + this.IV_LENGTH,
        this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH
      );
      const encrypted = buffer.slice(
        this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH
      );

      const key = crypto.pbkdf2Sync(
        secretKey,
        salt,
        this.ITERATIONS,
        this.KEY_LENGTH,
        'sha512'
      );

      const decipher = crypto.createDecipheriv(
        this.ENCRYPTION_ALGORITHM,
        key,
        iv
      );
      
      decipher.setAuthTag(tag);

      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]).toString('utf8');
    } catch (error) {
      throw new CustomError('Decryption failed', 500);
    }
  }
}