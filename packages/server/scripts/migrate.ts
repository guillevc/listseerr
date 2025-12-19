import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db, sqlite } from '../src/infrastructure/db/client';

console.log('Running migrations...');

try {
  migrate(db, { migrationsFolder: './packages/server/migrations' });
  console.log('Migrations completed successfully!');

  sqlite.close();
  process.exit(0);
} catch (error) {
  console.error('Migration failed:', error);
  sqlite.close();
  process.exit(1);
}
