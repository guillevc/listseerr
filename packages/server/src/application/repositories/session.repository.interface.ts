import type { Session } from '@/server/domain/entities/session.entity';

/**
 * Session Repository Interface (Port)
 *
 * Following DDD Repository Pattern:
 * - Repositories work exclusively with domain entities, never DTOs
 * - save() method handles both create and update
 * - Query methods return entities
 *
 * This interface defines the contract that infrastructure adapters must implement.
 */
export interface ISessionRepository {
  // Query operations
  /**
   * Find a session by its token
   * Returns null if session doesn't exist or is expired
   */
  findByToken(token: string): Promise<Session | null>;

  // Command operations
  /**
   * Save (create or update) a Session entity
   * Repository implementation determines if this is insert or update
   * based on whether the entity already exists in the database
   */
  save(entity: Session): Promise<Session>;

  /**
   * Delete a session by its token
   */
  deleteByToken(token: string): Promise<void>;

  /**
   * Delete all expired sessions
   * Used for cleanup operations
   */
  deleteExpired(): Promise<void>;

  /**
   * Delete all sessions for a user
   * Used when user is deleted or password is changed
   */
  deleteByUserId(userId: number): Promise<void>;
}
