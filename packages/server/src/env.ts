import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    PORT: z.coerce.number().default(3000),
    DATABASE_PATH: z.string().default('./data/listseerr.db'),
    MIGRATIONS_FOLDER: z.string().default('./migrations'),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default('debug'),
    ENCRYPTION_KEY: z.string().min(1, 'ENCRYPTION_KEY is required for encrypting API keys'),
  },

  /**
   * What object holds the environment variables at runtime.
   * This is usually `process.env` in Node.js/Bun environments.
   */
  runtimeEnv: process.env,

  /**
   * Makes it so that empty strings are treated as undefined.
   * `PORT=''` becomes `undefined` instead of `''`.
   * Recommended for new projects.
   */
  emptyStringAsUndefined: true,
});
