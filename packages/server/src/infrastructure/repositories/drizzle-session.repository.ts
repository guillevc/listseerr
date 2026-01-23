import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, lt } from 'drizzle-orm';
import * as schema from '@/server/infrastructure/db/schema';
import { sessions } from '@/server/infrastructure/db/schema';
import { Session } from '@/server/domain/entities/session.entity';
import type { ISessionRepository } from '@/server/application/repositories/session.repository.interface';
import { SessionTokenVO } from '@/server/domain/value-objects/session-token.vo';

export class DrizzleSessionRepository implements ISessionRepository {
  constructor(private readonly db: BunSQLiteDatabase<typeof schema>) {}

  async findByToken(token: string): Promise<Session | null> {
    const [row] = await this.db.select().from(sessions).where(eq(sessions.token, token)).limit(1);

    return row ? this.toDomain(row) : null;
  }

  /**
   * Save (create or update) a Session entity
   * Determines operation based on whether entity exists in database
   */
  async save(entity: Session): Promise<Session> {
    const entityExists = await this.exists(entity.id);

    if (entityExists) {
      // Update existing entity (unlikely for sessions, but supported)
      const [row] = await this.db
        .update(sessions)
        .set({
          userId: entity.userId,
          token: entity.token.getValue(),
          expiresAt: entity.expiresAt,
        })
        .where(eq(sessions.id, entity.id))
        .returning();

      if (!row) {
        throw new Error(`Failed to update session with id ${entity.id}`);
      }
      return this.toDomain(row);
    } else {
      // Insert new entity
      const [row] = await this.db
        .insert(sessions)
        .values({
          userId: entity.userId,
          token: entity.token.getValue(),
          expiresAt: entity.expiresAt,
        })
        .returning();

      if (!row) {
        throw new Error(`Failed to insert session for user ${entity.userId}`);
      }
      return this.toDomain(row);
    }
  }

  async deleteByToken(token: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.token, token));
  }

  async deleteExpired(): Promise<void> {
    await this.db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }

  /**
   * Check if session exists by ID
   * New entities have id: 0, so they don't exist yet
   */
  private async exists(id: number): Promise<boolean> {
    if (id === 0) return false; // New entity shortcut

    const [row] = await this.db
      .select({ id: sessions.id })
      .from(sessions)
      .where(eq(sessions.id, id))
      .limit(1);

    return !!row;
  }

  /**
   * Convert Drizzle row to Session domain entity
   */
  private toDomain(row: typeof sessions.$inferSelect): Session {
    return new Session({
      id: row.id,
      userId: row.userId,
      token: SessionTokenVO.fromPersistence(row.token),
      expiresAt: row.expiresAt,
      createdAt: row.createdAt || new Date(),
    });
  }
}
