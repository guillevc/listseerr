/**
 * Jellyseerr Schemas
 *
 * Zod schemas for structural validation, typed against domain types.
 * Used by tRPC routers and frontend forms.
 */

import { z } from 'zod';
import type {
  JellyseerrUrlPrimitive,
  JellyseerrExternalUrlPrimitive,
  JellyseerrApiKeyPrimitive,
  JellyseerrUserIdPrimitive,
  JellyseerrConfigPrimitive,
} from '../../domain/types/jellyseerr.types';

/**
 * Jellyseerr URL schema.
 * Validates: non-empty, valid URL, HTTP/HTTPS protocol, removes trailing slash.
 */
export const jellyseerrUrlSchema: z.ZodType<JellyseerrUrlPrimitive> = z
  .url({ message: 'Must be a valid URL' })
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid HTTP/HTTPS URL' }
  )
  .transform((url) => url.replace(/\/$/, ''));

/**
 * Jellyseerr External URL schema (optional).
 * User-facing URL for browser links when internal URL differs.
 * Uses same validation as jellyseerrUrlSchema.
 */
export const jellyseerrExternalUrlSchema: z.ZodType<JellyseerrExternalUrlPrimitive | undefined> = z
  .url({ message: 'Must be a valid URL' })
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid HTTP/HTTPS URL' }
  )
  .transform((url) => url.replace(/\/$/, ''))
  .optional();

/**
 * Jellyseerr API key schema.
 * Validates: non-empty string, trimmed.
 */
export const jellyseerrApiKeySchema: z.ZodType<JellyseerrApiKeyPrimitive> = z
  .string()
  .min(1, 'API key is required')
  .transform((key) => key.trim());

/**
 * Jellyseerr User ID schema.
 * Validates: positive integer.
 */
export const jellyseerrUserIdSchema: z.ZodType<JellyseerrUserIdPrimitive> = z
  .number()
  .int('User ID must be an integer')
  .positive('User ID must be positive');

/**
 * Combined Jellyseerr config schema for forms.
 * Output type matches JellyseerrConfigPrimitive.
 */
export const jellyseerrConfigSchema: z.ZodType<JellyseerrConfigPrimitive> = z.object({
  url: jellyseerrUrlSchema,
  externalUrl: jellyseerrExternalUrlSchema,
  apiKey: jellyseerrApiKeySchema,
  userIdJellyseerr: jellyseerrUserIdSchema,
});

/**
 * Schema for testing connection (doesn't require user ID).
 */
export const jellyseerrTestConnectionSchema = z.object({
  url: jellyseerrUrlSchema,
  apiKey: jellyseerrApiKeySchema,
});

export type JellyseerrTestConnectionInput = z.infer<typeof jellyseerrTestConnectionSchema>;
