import type { IPasswordService } from '@/server/application/services/core/password.service.interface';

/**
 * Bun Password Service
 *
 * Uses Bun's built-in password hashing with bcrypt algorithm.
 * Provides secure password hashing without external dependencies.
 *
 * Why bcrypt?
 * - Industry standard for password hashing
 * - Built-in salt generation and storage
 * - Configurable cost factor (default: 10)
 * - Resistant to rainbow table attacks
 */
export class BunPasswordService implements IPasswordService {
  /**
   * Hash a password using bcrypt
   *
   * @param password - The plaintext password to hash
   * @returns Promise<string> - The hashed password (includes salt and algorithm info)
   */
  async hash(password: string): Promise<string> {
    return await Bun.password.hash(password, {
      algorithm: 'bcrypt',
      cost: 10, // Work factor (higher = more secure but slower)
    });
  }

  /**
   * Verify a password against a hash
   *
   * @param password - The plaintext password to verify
   * @param hash - The hash to verify against
   * @returns Promise<boolean> - true if password matches hash, false otherwise
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
  }
}
