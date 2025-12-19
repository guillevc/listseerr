import { UsernameVO } from '@/server/domain/value-objects/username.vo';

/**
 * User Entity - Domain Model with Rich Behavior
 *
 * This entity follows DDD principles:
 * - Private state (encapsulation)
 * - Value Objects for domain concepts (Username)
 * - passwordHash is stored as string (not a VO) because PasswordVO is transient
 *
 * Note: PasswordVO is used only for validation before hashing.
 * The User entity stores the hashed password directly.
 */
export class User {
  private readonly _id: number;
  private _username: UsernameVO;
  private _passwordHash: string;
  private readonly _createdAt: Date;

  constructor(params: { id: number; username: UsernameVO; passwordHash: string; createdAt: Date }) {
    this._id = params.id;
    this._username = params.username;
    this._passwordHash = params.passwordHash;
    this._createdAt = params.createdAt;
  }

  /**
   * Factory for creating new user entities.
   * Uses id: 0 to indicate unpersisted entity.
   */
  static create(params: { username: UsernameVO; passwordHash: string }): User {
    return new User({
      id: 0, // Unpersisted entity
      username: params.username,
      passwordHash: params.passwordHash,
      createdAt: new Date(),
    });
  }

  // Getters
  get id(): number {
    return this._id;
  }

  get username(): UsernameVO {
    return this._username;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Mutation methods

  /**
   * Change the username
   */
  changeUsername(newUsername: UsernameVO): void {
    this._username = newUsername;
  }

  /**
   * Change the password hash
   */
  changePasswordHash(newPasswordHash: string): void {
    this._passwordHash = newPasswordHash;
  }
}
