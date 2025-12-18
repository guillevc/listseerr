/**
 * Provider Schemas
 *
 * Zod schemas for structural validation, typed against domain types.
 * Used by tRPC routers and frontend forms.
 */

import { z } from 'zod';
import { ProviderValues, type ProviderType } from '../../domain/types/provider.types';

/**
 * Base provider enum schema.
 * Validates that the value is one of the allowed providers.
 */
export const providerSchema: z.ZodType<ProviderType> = z.enum([
  ProviderValues.TRAKT,
  ProviderValues.MDBLIST,
  ProviderValues.TRAKT_CHART,
  ProviderValues.STEVENLU,
] as const);
