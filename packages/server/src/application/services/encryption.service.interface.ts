/**
 * Encryption Service Interface (Port)
 *
 * Defines the contract for encrypting and decrypting sensitive data.
 * Infrastructure layer provides concrete implementation (Adapter).
 *
 * This keeps the Application layer pure - it knows WHAT needs to be encrypted,
 * but not HOW the encryption is performed.
 */
export interface IEncryptionService {
  /**
   * Encrypt plaintext string
   * @param plaintext - The string to encrypt
   * @returns Encrypted string with format: algorithm:iv:authTag:ciphertext
   */
  encrypt(plaintext: string): string;

  /**
   * Decrypt ciphertext string
   * @param ciphertext - The encrypted string to decrypt
   * @returns Decrypted plaintext string
   * @throws {EncryptionError} If decryption fails (invalid format, wrong key, corrupted data)
   */
  decrypt(ciphertext: string): string;
}
