/**
 * MDBList Schemas
 *
 * Zod schemas for structural validation, typed against domain types.
 * Used by tRPC routers and frontend forms.
 */

import { z } from 'zod';
import type {
  MdblistApiKeyPrimitive,
  MdblistConfigPrimitive,
} from '../../domain/types/mdblist.types';

/**
 * MDBList API key schema.
 * Validates: 20-50 alphanumeric characters.
 */
export const mdblistApiKeySchema: z.ZodType<MdblistApiKeyPrimitive> = z
  .string()
  .min(1, 'API key is required')
  .transform((key) => key.trim())
  .refine((key) => /^[A-Za-z0-9-]{20,50}$/.test(key), {
    message:
      'MDBList API key must be 20-50 alphanumeric characters. Get your API key from https://mdblist.com/preferences/',
  });

/**
 * MDBList config schema.
 * Output type matches MdblistConfigPrimitive.
 */
export const mdblistConfigSchema: z.ZodType<MdblistConfigPrimitive> = z.object({
  apiKey: mdblistApiKeySchema,
});
