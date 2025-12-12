import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  client: {
    VITE_API_URL: z.string().default('http://localhost:3000')
  },
  runtimeEnv: import.meta.env,
  clientPrefix: 'VITE_',
  emptyStringAsUndefined: true,
});
