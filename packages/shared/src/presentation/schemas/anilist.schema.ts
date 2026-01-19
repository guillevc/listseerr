/**
 * AniList Schemas
 *
 * Zod schemas for structural validation of AniList-related data.
 * Used by tRPC routers and frontend forms.
 */

import { z } from 'zod';
import {
  AnilistStatusValues,
  AnilistStatusDisplayNames,
  type AnilistStatus,
} from '../../domain/types/anilist.types';

// Re-export domain types for consumers
export { AnilistStatusValues, AnilistStatusDisplayNames, type AnilistStatus };

/**
 * Lowercase alias for display names (maintains backward compatibility).
 */
export const anilistStatusDisplayNames = AnilistStatusDisplayNames;

/**
 * AniList username schema.
 * Validates: 2-20 characters (AniList username constraints).
 */
export const anilistUsernameSchema = z
  .string()
  .trim()
  .min(2, 'AniList username must be at least 2 characters')
  .max(20, 'AniList username cannot exceed 20 characters');

/**
 * AniList status schema.
 */
export const anilistStatusSchema = z.enum([
  AnilistStatusValues.CURRENT,
  AnilistStatusValues.PLANNING,
  AnilistStatusValues.COMPLETED,
  AnilistStatusValues.DROPPED,
  AnilistStatusValues.PAUSED,
  AnilistStatusValues.REPEATING,
] as const);
