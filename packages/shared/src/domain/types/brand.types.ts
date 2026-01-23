/**
 * Branded Types for Type-Safe IDs
 *
 * Branded types prevent accidental misuse of IDs across different entity types.
 */

declare const brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brand]: B };

// Branded ID types
export type MediaListId = Brand<number, 'MediaListId'>;
export type UserId = Brand<number, 'UserId'>;
export type ExecutionHistoryId = Brand<number, 'ExecutionHistoryId'>;
export type SessionId = Brand<number, 'SessionId'>;
