import { unlinkSync, existsSync } from 'fs';
import { $ } from 'bun';
import { env } from '@/env';

const DB_PATH = env.DATABASE_PATH;
const DB_FILES = [DB_PATH, `${DB_PATH}-shm`, `${DB_PATH}-wal`];

console.log('🗑️  Resetting database...\n');

// Delete database files
for (const file of DB_FILES) {
  if (existsSync(file)) {
    unlinkSync(file);
    console.log(`✓ Deleted ${file}`);
  }
}

console.log('\n📝 Running migrations...\n');

// Run migrations
try {
  await $`bun run db:migrate`;
  console.log('\n✅ Database reset complete!');
} catch (error) {
  console.error('\n❌ Failed to run migrations:', error);
  process.exit(1);
}
