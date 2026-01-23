/**
 * DTO Utility Types
 *
 * Shared utilities for transforming DTOs.
 */

/**
 * Recursively converts Date properties to string for serialized DTOs.
 * Used to represent how data appears after JSON serialization over the wire.
 */
export type Serialized<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
      ? string | null
      : T[K] extends object
        ? Serialized<T[K]>
        : T[K];
};
