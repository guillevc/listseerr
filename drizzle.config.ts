import type { Config } from 'drizzle-kit';
import { env } from './packages/server/src/env';

export default {
  schema: './packages/server/src/db/schema.ts',
  out: './packages/server/src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: env.DATABASE_PATH,
  },
} satisfies Config;
