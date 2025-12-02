import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

// Database path - defaults to data/listseerr.db for Docker compatibility
const DB_PATH = process.env.DATABASE_PATH || './data/listseerr.db';

// Create data directory if it doesn't exist
import { mkdirSync } from 'fs';
import { dirname } from 'path';

try {
  mkdirSync(dirname(DB_PATH), { recursive: true });
} catch (error) {
  // Directory might already exist
}

// Initialize SQLite database
const sqlite = new Database(DB_PATH, { create: true });

// Enable WAL mode for better concurrency
sqlite.exec('PRAGMA journal_mode = WAL;');

// Initialize Drizzle ORM
export const db = drizzle(sqlite, { schema });

// Export the raw SQLite instance if needed
export { sqlite };

// Helper function to close the database connection
export function closeDatabase() {
  sqlite.close();
}
