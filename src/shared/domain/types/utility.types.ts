/**
 * Utility Types
 *
 * Common utility types used across the application.
 * These types provide type-level abstractions for common patterns.
 */

/**
 * Nullable utility type - represents a value that can be null
 * Use this instead of `T | null` for consistency
 *
 * Example:
 * - Nullable<string> instead of string | null
 * - Nullable<number> instead of number | null
 */
export type Nullable<T> = T | null;
