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
import {
  createHttpUrlSchema,
  createNonEmptyStringSchema,
  createBoundedIntSchema,
} from './common.schema';

/**
 * List name schema.
 * Validates: non-empty string, trimmed.
 */
export const listNameSchema: z.ZodType<ListNamePrimitive> = createNonEmptyStringSchema('Name');

/**
 * List URL schema.
 * Validates: valid HTTP/HTTPS URL, removes query params.
 */
export const listUrlSchema: z.ZodType<ListUrlPrimitive> = createHttpUrlSchema({
  stripQueryParams: true,
});

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
