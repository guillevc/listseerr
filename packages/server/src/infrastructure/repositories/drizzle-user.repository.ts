import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, count } from 'drizzle-orm';
import * as schema from '@/server/infrastructure/db/schema';
import { users } from '@/server/infrastructure/db/schema';
import { User } from '@/server/domain/entities/user.entity';
import type { IUserRepository } from '@/server/application/repositories/user.repository.interface';
import { UsernameVO } from '@/server/domain/value-objects/username.vo';

export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: BunSQLiteDatabase<typeof schema>) {}

  async findById(id: number): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);

    return row ? this.toDomain(row) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.username, username)).limit(1);

    return row ? this.toDomain(row) : null;
  }

  /**
   * Save (create or update) a User entity
   * Determines operation based on whether entity exists in database
   */
  async save(entity: User): Promise<User> {
    const entityExists = await this.exists(entity.id);

    if (entityExists) {
      // Update existing entity
      const [row] = await this.db
        .update(users)
        .set({
          username: entity.username.getValue(),
          passwordHash: entity.passwordHash,
        })
        .where(eq(users.id, entity.id))
        .returning();

      if (!row) {
        throw new Error(`Failed to update user with id ${entity.id}`);
      }
      return this.toDomain(row);
    } else {
      // Insert new entity
      const [row] = await this.db
        .insert(users)
        .values({
          username: entity.username.getValue(),
          passwordHash: entity.passwordHash,
        })
        .returning();

      if (!row) {
        throw new Error(`Failed to insert user ${entity.username.getValue()}`);
      }
      return this.toDomain(row);
    }
  }

  async count(): Promise<number> {
    const [result] = await this.db.select({ count: count() }).from(users);
    return result?.count ?? 0;
  }

  /**
   * Check if user exists by ID
   * New entities have id: 0, so they don't exist yet
   */
  private async exists(id: number): Promise<boolean> {
    if (id === 0) return false; // New entity shortcut

    const [row] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return !!row;
  }

  /**
   * Convert Drizzle row to User domain entity
   */
  private toDomain(row: typeof users.$inferSelect): User {
    return new User({
      id: row.id,
      username: UsernameVO.fromPersistence(row.username),
      passwordHash: row.passwordHash,
      createdAt: row.createdAt || new Date(),
    });
  }
}
