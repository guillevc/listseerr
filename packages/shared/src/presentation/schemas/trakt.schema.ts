/**
 * Trakt Schemas
 *
 * Zod schemas for structural validation, typed against domain types.
 * Used by tRPC routers and frontend forms.
 */

import { z } from 'zod';
import {
  TraktChartTypeValues,
  TraktMediaTypeValues,
  type TraktClientIdPrimitive,
  type TraktChartType,
  type TraktMediaType,
  type TraktConfigPrimitive,
} from '../../domain/types/trakt.types';

/**
 * Trakt Client ID schema.
 * Validates: 64 hexadecimal characters (lowercase).
 */
export const traktClientIdSchema: z.ZodType<TraktClientIdPrimitive> = z
  .string()
  .min(1, 'Client ID is required')
  .transform((id) => id.trim())
  .refine((id) => /^[0-9a-f]{64}$/.test(id), {
    message:
      'Trakt Client ID must be exactly 64 hexadecimal characters (0-9, a-f). Get your Client ID from https://trakt.tv/oauth/applications',
  });

/**
 * Trakt chart type schema.
 */
export const traktChartTypeSchema: z.ZodType<TraktChartType> = z.enum([
  TraktChartTypeValues.TRENDING,
  TraktChartTypeValues.POPULAR,
  TraktChartTypeValues.FAVORITED,
  TraktChartTypeValues.PLAYED,
  TraktChartTypeValues.WATCHED,
  TraktChartTypeValues.COLLECTED,
  TraktChartTypeValues.ANTICIPATED,
] as const);

/**
 * Trakt media type schema.
 */
export const traktMediaTypeSchema: z.ZodType<TraktMediaType> = z.enum([
  TraktMediaTypeValues.MOVIES,
  TraktMediaTypeValues.SHOWS,
] as const);

/**
 * Trakt config schema.
 * Output type matches TraktConfigPrimitive.
 */
export const traktConfigSchema: z.ZodType<TraktConfigPrimitive> = z.object({
  clientId: traktClientIdSchema,
});
