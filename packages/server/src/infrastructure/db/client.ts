import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { Database } from 'bun:sqlite';
import { drizzle, type BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';
import { env } from '@/server/env';

export type DbClient = BunSQLiteDatabase<typeof schema>;

const DB_PATH = resolve(env.DATABASE_PATH);

try {
  mkdirSync(dirname(DB_PATH), { recursive: true });
} catch {
  // Directory might already exist
}

// Initialize SQLite database
const sqlite = new Database(DB_PATH, {
  create: true,
  strict: true, // Enable strict mode for better type checking
  safeIntegers: false, // Keep as numbers (change to true if you need BigInt support)
});

// Enable WAL mode for better concurrency
sqlite.run('PRAGMA journal_mode = WAL;');

// Initialize Drizzle ORM
export const db = drizzle(sqlite, { schema });

// Export the raw SQLite instance if needed
export { sqlite };

// Helper function to close the database connection
export function closeDatabase() {
  sqlite.close();
}
