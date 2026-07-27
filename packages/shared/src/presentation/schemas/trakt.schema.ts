/**
 * Trakt Schemas
 *
 * Zod schemas for structural validation, typed against domain types.
 * Used by tRPC routers and frontend forms.
 */

import { z } from 'zod';
import type { TraktClientIdPrimitive, TraktConfigPrimitive } from '../../domain/types/trakt.types';

/**
 * Trakt Client ID schema.
 * Validates: alphanumeric string (with underscores/hyphens), at least 20 characters.
 * Accepts both legacy 64-char hex IDs and newer shorter alphanumeric IDs.
 */
export const traktClientIdSchema: z.ZodType<TraktClientIdPrimitive> = z
  .string()
  .min(1, 'Client ID is required')
  .transform((id) => id.trim())
  .refine((id) => /^[0-9a-zA-Z_-]{20,}$/.test(id), {
    message:
      'Trakt Client ID must be at least 20 alphanumeric characters. Get your Client ID from https://trakt.tv/oauth/applications',
  });

/**
 * Trakt config schema.
 * Output type matches TraktConfigPrimitive.
 */
export const traktConfigSchema: z.ZodType<TraktConfigPrimitive> = z.object({
  clientId: traktClientIdSchema,
});
