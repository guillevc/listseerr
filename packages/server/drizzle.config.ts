import type { Config } from 'drizzle-kit';
import { env } from './src/env';

export default {
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: env.DATABASE_PATH,
  },
} satisfies Config;
