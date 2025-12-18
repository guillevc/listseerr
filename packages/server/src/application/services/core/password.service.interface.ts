/**
 * Password Service Interface (Port)
 *
 * Defines the contract for password hashing and verification.
 * Infrastructure layer provides concrete implementation (Adapter).
 *
 * This keeps the Application layer pure - it knows WHAT needs to be hashed,
 * but not HOW the hashing is performed.
 */
export interface IPasswordService {
  /**
   * Hash a password
   * @param password - The plaintext password to hash
   * @returns Promise<string> - The hashed password
   */
  hash(password: string): Promise<string>;

  /**
   * Verify a password against a hash
   * @param password - The plaintext password to verify
   * @param hash - The hash to verify against
   * @returns Promise<boolean> - true if password matches hash, false otherwise
   */
  verify(password: string, hash: string): Promise<boolean>;
}
