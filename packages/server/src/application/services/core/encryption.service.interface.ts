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
   * Decrypt if encrypted, otherwise return as-is
   * Handles null/empty values and unencrypted legacy data gracefully.
   * @param ciphertext - The string to decrypt (may be null, empty, or unencrypted)
   * @returns Decrypted string, or original value if not encrypted
   */
  decryptOrPassthrough(ciphertext: string | null): string;
}
