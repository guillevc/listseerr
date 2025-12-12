import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db, sqlite } from '../src/infrastructure/db/client';

console.log('Running migrations...');

try {
  migrate(db, { migrationsFolder: './src/server/db/migrations' });
  console.log('Migrations completed successfully!');

  // Create default user if none exists
  const result = sqlite.query('SELECT COUNT(*) as count FROM users').get() as { count: number };

  if (result.count === 0) {
    console.log('Creating default user...');
    sqlite.run('INSERT INTO users (username) VALUES (?)', ['default']);
    console.log('Default user created!');
  }

  sqlite.close();
  process.exit(0);
} catch (error) {
  console.error('Migration failed:', error);
  sqlite.close();
  process.exit(1);
}
