import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import type { IEncryptionService } from '@/server/application/services/encryption.service.interface';
import { EncryptionError } from 'shared/domain/errors/provider-config.errors';

/**
 * AES-256-GCM Encryption Service
 *
 * Provides authenticated encryption using AES-256-GCM algorithm.
 * Each encryption uses a random 12-byte IV for maximum security.
 *
 * Encrypted format: aes-256-gcm:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 *
 * Why AES-256-GCM?
 * - Authenticated encryption (provides both confidentiality AND integrity)
 * - NIST approved, industry standard
 * - Hardware-accelerated on modern CPUs (fast)
 * - Prevents tampering (auth tag validation)
 */
export class AesEncryptionService implements IEncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // 12 bytes (96 bits) for GCM
  private static readonly AUTH_TAG_LENGTH = 16; // 16 bytes (128 bits)

  constructor(private readonly encryptionKey: Buffer) {
    // Validate key length (must be 32 bytes for AES-256)
    if (encryptionKey.length !== 32) {
      throw new Error(
        `Invalid encryption key length: ${encryptionKey.length} bytes. ` +
          `AES-256 requires exactly 32 bytes (64 hex characters)`
      );
    }
  }

  /**
   * Encrypt plaintext using AES-256-GCM
   *
   * @param plaintext - String to encrypt
   * @returns Encrypted string with format: aes-256-gcm:iv:authTag:ciphertext (all hex)
   */
  encrypt(plaintext: string): string {
    try {
      // Generate random IV (initialization vector) for this encryption
      const iv = randomBytes(AesEncryptionService.IV_LENGTH);

      // Create cipher
      const cipher = createCipheriv(AesEncryptionService.ALGORITHM, this.encryptionKey, iv);

      // Encrypt the plaintext
      const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

      // Get the authentication tag (GCM provides this for integrity verification)
      const authTag = cipher.getAuthTag();

      // Return self-describing format: algorithm:iv:authTag:ciphertext (all hex-encoded)
      return [
        AesEncryptionService.ALGORITHM,
        iv.toString('hex'),
        authTag.toString('hex'),
        encrypted.toString('hex'),
      ].join(':');
    } catch (error) {
      throw new EncryptionError(
        `Failed to encrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrypt ciphertext using AES-256-GCM
   *
   * @param ciphertext - Encrypted string in format: aes-256-gcm:iv:authTag:ciphertext
   * @returns Decrypted plaintext string
   * @throws {EncryptionError} If format is invalid, auth tag verification fails, or decryption fails
   */
  decrypt(ciphertext: string): string {
    try {
      // Parse the encrypted format
      const parts = ciphertext.split(':');

      if (parts.length !== 4) {
        throw new EncryptionError(
          `Invalid encrypted data format. Expected 4 parts, got ${parts.length}`
        );
      }

      const [algorithm, ivHex, authTagHex, encryptedHex] = parts;

      // Validate algorithm
      if (algorithm !== AesEncryptionService.ALGORITHM) {
        throw new EncryptionError(
          `Unsupported encryption algorithm: ${algorithm}. Expected: ${AesEncryptionService.ALGORITHM}`
        );
      }

      // Convert hex strings back to buffers
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      // Validate buffer lengths
      if (iv.length !== AesEncryptionService.IV_LENGTH) {
        throw new EncryptionError(
          `Invalid IV length: ${iv.length} bytes. Expected: ${AesEncryptionService.IV_LENGTH} bytes`
        );
      }

      if (authTag.length !== AesEncryptionService.AUTH_TAG_LENGTH) {
        throw new EncryptionError(
          `Invalid auth tag length: ${authTag.length} bytes. Expected: ${AesEncryptionService.AUTH_TAG_LENGTH} bytes`
        );
      }

      // Create decipher
      const decipher = createDecipheriv(AesEncryptionService.ALGORITHM, this.encryptionKey, iv);

      // Set the auth tag for verification
      decipher.setAuthTag(authTag);

      // Decrypt and verify
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      // Wrap all errors in EncryptionError for consistent error handling
      if (error instanceof EncryptionError) {
        throw error;
      }

      throw new EncryptionError(
        `Failed to decrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
