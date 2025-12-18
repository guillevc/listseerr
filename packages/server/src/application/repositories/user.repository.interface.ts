import type { User } from '@/server/domain/entities/user.entity';

/**
 * User Repository Interface (Port)
 *
 * Following DDD Repository Pattern:
 * - Repositories work exclusively with domain entities, never DTOs
 * - save() method handles both create and update
 * - Query methods return entities
 *
 * This interface defines the contract that infrastructure adapters must implement.
 */
export interface IUserRepository {
  // Query operations
  findById(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;

  // Command operations
  /**
   * Save (create or update) a User entity
   * Repository implementation determines if this is insert or update
   * based on whether the entity already exists in the database
   */
  save(entity: User): Promise<User>;

  // Utility operations
  /**
   * Count total number of users
   * Used to check if setup is needed (count === 0)
   */
  count(): Promise<number>;
}
