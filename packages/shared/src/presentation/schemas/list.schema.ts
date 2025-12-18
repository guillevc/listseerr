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
 * Validates: valid URL, removes query params.
 */
export const listUrlSchema: z.ZodType<ListUrlPrimitive> = z
  .url({ message: 'Must be a valid URL' })
  .transform((url) => url.split('?')[0]);

/**
 * Max items schema.
 * Validates: positive integer between 1 and 50.
 */
export const maxItemsSchema: z.ZodType<MaxItemsPrimitive> = z
  .number()
  .int('Must be a whole number')
  .min(1, 'Must be at least 1')
  .max(50, 'Maximum is 50')
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
 * Update list schema (partial).
 * Output type matches UpdateListPrimitive.
 */
export const updateListSchema = createListSchema.partial() satisfies z.ZodType<UpdateListPrimitive>;
