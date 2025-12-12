import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';
import { env } from '@/server/env';
import { resolve, join } from 'path';

// Use absolute path based on project root (3 levels up from this file)
const projectRoot = resolve(import.meta.dir, '../../..');
const DB_PATH = join(projectRoot, env.DATABASE_PATH.replace(/^\.\//, ''));

// Create data directory if it doesn't exist
import { mkdirSync } from 'fs';
import { dirname } from 'path';

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
