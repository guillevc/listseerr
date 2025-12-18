import { SessionTokenVO } from '@/server/domain/value-objects/session-token.vo';
import { getSessionExpiryDate, isSessionExpired } from 'shared/domain/logic/auth.logic';

/**
 * Session Entity - Domain Model for Authentication Sessions
 *
 * This entity follows DDD principles:
 * - Private state (encapsulation)
 * - Value Objects for domain concepts (SessionToken)
 * - Business logic for session expiry
 */
export class Session {
  private readonly _id: number;
  private readonly _userId: number;
  private readonly _token: SessionTokenVO;
  private readonly _expiresAt: Date;
  private readonly _createdAt: Date;

  constructor(params: {
    id: number;
    userId: number;
    token: SessionTokenVO;
    expiresAt: Date;
    createdAt: Date;
  }) {
    this._id = params.id;
    this._userId = params.userId;
    this._token = params.token;
    this._expiresAt = params.expiresAt;
    this._createdAt = params.createdAt;
  }

  /**
   * Factory for creating new session entities.
   * Uses id: 0 to indicate unpersisted entity.
   * Generates a new secure token automatically.
   *
   * @param userId - The ID of the user this session belongs to
   * @param rememberMe - If true, session expires in 100 years; if false, 24 hours
   */
  static create(params: { userId: number; rememberMe: boolean }): Session {
    return new Session({
      id: 0, // Unpersisted entity
      userId: params.userId,
      token: SessionTokenVO.generate(),
      expiresAt: getSessionExpiryDate(params.rememberMe),
      createdAt: new Date(),
    });
  }

  // Getters
  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get token(): SessionTokenVO {
    return this._token;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Business logic methods

  /**
   * Check if the session has expired
   */
  isExpired(): boolean {
    return isSessionExpired(this._expiresAt);
  }

  /**
   * Check if the session is valid (not expired)
   */
  isValid(): boolean {
    return !this.isExpired();
  }
}
