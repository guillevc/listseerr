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
import { providerSchema } from './provider.schema';

/**
 * List name schema.
 * Validates: non-empty string, trimmed.
 */
export const listNameSchema: z.ZodType<ListNamePrimitive> = z
  .string()
  .min(1, 'Name is required')
  .transform((name) => name.trim())
  .refine((name) => name.length > 0, { message: 'Name cannot be empty' });

/**
 * List URL schema.
 * Validates: valid HTTP/HTTPS URL, removes query params.
 */
export const listUrlSchema: z.ZodType<ListUrlPrimitive> = z
  .url({ message: 'Please enter a valid URL' })
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must use HTTP or HTTPS protocol' }
  )
  .transform((url) => url.split('?')[0]);

/**
 * Max items schema.
 * Validates: positive integer between 1 and 50.
 */
export const maxItemsSchema: z.ZodType<MaxItemsPrimitive> = z
  .number()
  .int({ message: 'Max items must be a whole number' })
  .min(1, { message: 'Max items must be at least 1' })
  .max(50, { message: 'Max items cannot exceed 50' })
  .default(20);

/**
 * Create list schema.
 * Output type matches CreateListPrimitive.
 */
export const createListSchema = z.object({
  name: listNameSchema,
  url: listUrlSchema,
  displayUrl: z.string().optional(),
  provider: providerSchema.default('trakt'),
  enabled: z.boolean().default(true),
  maxItems: maxItemsSchema,
}) satisfies z.ZodType<CreateListPrimitive>;

/**
 * Update list schema (partial, no defaults).
 * Output type matches UpdateListPrimitive.
 * Note: Defined separately to avoid inheriting .default() values from createListSchema.
 */
export const updateListSchema = z.object({
  name: listNameSchema.optional(),
  url: listUrlSchema.optional(),
  displayUrl: z.string().optional(),
  provider: providerSchema.optional(),
  enabled: z.boolean().optional(),
  maxItems: z.number().int().min(1).max(50).optional(),
}) satisfies z.ZodType<UpdateListPrimitive>;
