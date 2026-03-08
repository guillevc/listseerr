/**
 * Seerr Schemas
 *
 * Zod schemas for structural validation, typed against domain types.
 * Used by tRPC routers and frontend forms.
 */

import { z } from 'zod';
import type {
  SeerrUrlPrimitive,
  SeerrExternalUrlPrimitive,
  SeerrApiKeyPrimitive,
  SeerrUserIdPrimitive,
  SeerrConfigPrimitive,
} from '../../domain/types/seerr.types';
import { createHttpUrlSchema, createApiKeySchema, createPositiveIntSchema } from './common.schema';

/**
 * Seerr URL schema.
 * Validates: non-empty, valid URL, HTTP/HTTPS protocol, removes trailing slash.
 */
export const seerrUrlSchema: z.ZodType<SeerrUrlPrimitive> = createHttpUrlSchema({
  stripTrailingSlash: true,
});

/**
 * Seerr External URL schema (optional).
 * User-facing URL for browser links when internal URL differs.
 * Uses same validation as seerrUrlSchema.
 */
export const seerrExternalUrlSchema: z.ZodType<SeerrExternalUrlPrimitive | undefined> =
  createHttpUrlSchema({ stripTrailingSlash: true }).optional();

/**
 * Seerr API key schema.
 * Validates: non-empty string, trimmed.
 */
export const seerrApiKeySchema: z.ZodType<SeerrApiKeyPrimitive> = createApiKeySchema('API key');

/**
 * Seerr User ID schema.
 * Validates: positive integer.
 */
export const seerrUserIdSchema: z.ZodType<SeerrUserIdPrimitive> =
  createPositiveIntSchema('User ID');

/**
 * Combined Seerr config schema for forms.
 * Output type matches SeerrConfigPrimitive.
 */
export const seerrConfigSchema: z.ZodType<SeerrConfigPrimitive> = z.object({
  url: seerrUrlSchema,
  externalUrl: seerrExternalUrlSchema,
  apiKey: seerrApiKeySchema,
  userIdSeerr: seerrUserIdSchema,
});

/**
 * Schema for testing connection (doesn't require user ID).
 */
export const seerrTestConnectionSchema = z.object({
  url: seerrUrlSchema,
  apiKey: seerrApiKeySchema,
});

export type SeerrTestConnectionInput = z.infer<typeof seerrTestConnectionSchema>;
