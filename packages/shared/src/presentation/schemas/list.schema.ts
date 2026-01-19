/**
 * List Schemas
 *
 * Zod schemas for structural validation, typed against domain types.
 * Used by tRPC routers and frontend forms.
 */

import { z } from 'zod';
import type {
  ListNamePrimitive,
  ListUrlPrimitive,
  MaxItemsPrimitive,
  CreateListPrimitive,
  UpdateListPrimitive,
} from '../../domain/types/list.types';
import { ProviderValues, type ProviderType } from '../../domain/types/provider.types';
import { matchesProviderUrl, getProviderDisplayName } from '../../domain/logic/provider.logic';
import { providerSchema } from './provider.schema';
import { createNonEmptyStringSchema, createBoundedIntSchema } from './common.schema';

/**
 * List name schema.
 * Validates: non-empty string, trimmed.
 */
export const listNameSchema: z.ZodType<ListNamePrimitive> = createNonEmptyStringSchema('Name');

/**
 * List URL schema.
 * Basic string validation - provider-specific validation happens at parent schema level.
 */
export const listUrlSchema: z.ZodType<ListUrlPrimitive> = z.string().min(1, 'URL is required');

/**
 * Normalizes HTTP URLs by stripping query parameters.
 */
function normalizeUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.split('?')[0];
  }
  return url;
}

/**
 * Validates that a URL matches the expected format for a provider.
 * Extracted to reduce duplication between createListSchema and updateListSchema.
 */
function validateUrlProviderMatch(
  url: string | undefined,
  provider: ProviderType | undefined,
  ctx: z.RefinementCtx
): void {
  // Skip validation if either url or provider is missing
  if (!url || !provider) return;

  // StevenLu has a fixed URL, skip validation
  if (provider === ProviderValues.STEVENLU) return;

  if (!matchesProviderUrl(provider, url)) {
    ctx.addIssue({
      code: 'custom',
      message: `URL does not match expected format for ${getProviderDisplayName(provider)}`,
      path: ['url'],
    });
  }
}

/**
 * Max items schema.
 * Validates: positive integer between 1 and 50.
 */
export const maxItemsSchema: z.ZodType<MaxItemsPrimitive> = createBoundedIntSchema({
  min: 1,
  max: 50,
  default: 20,
  minMessage: 'Max items must be at least 1',
  maxMessage: 'Max items cannot exceed 50',
});

/**
 * Create list schema.
 * Output type matches CreateListPrimitive.
 * Uses superRefine for cross-field validation (URL must match provider format).
 */
export const createListSchema = z
  .object({
    name: listNameSchema,
    url: listUrlSchema,
    displayUrl: z.string().optional(),
    provider: providerSchema.default('trakt'),
    enabled: z.boolean().default(true),
    maxItems: maxItemsSchema,
  })
  .superRefine((data, ctx) => {
    validateUrlProviderMatch(data.url, data.provider, ctx);
  })
  .transform((data) => ({
    ...data,
    url: normalizeUrl(data.url),
  })) satisfies z.ZodType<CreateListPrimitive>;

/**
 * Update list schema (partial, no defaults).
 * Output type matches UpdateListPrimitive.
 * Note: Defined separately to avoid inheriting .default() values from createListSchema.
 * Cross-field validation only applies when both url and provider are provided.
 */
export const updateListSchema = z
  .object({
    name: listNameSchema.optional(),
    url: listUrlSchema.optional(),
    displayUrl: z.string().optional(),
    provider: providerSchema.optional(),
    enabled: z.boolean().optional(),
    maxItems: z.number().int().min(1).max(50).optional(),
  })
  .superRefine((data, ctx) => {
    // Only validate URL-provider match when both are provided
    validateUrlProviderMatch(data.url, data.provider, ctx);
  })
  .transform((data) => ({
    ...data,
    url: data.url ? normalizeUrl(data.url) : data.url,
  })) satisfies z.ZodType<UpdateListPrimitive>;
