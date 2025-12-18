/**
 * Presentation Schemas
 *
 * Zod schemas for structural validation at the presentation edge.
 * All schemas are typed against domain types (Contract-Driven pattern).
 *
 * Usage:
 * - tRPC routers: import schemas for input validation
 * - Frontend forms: import schemas for safeParse() validation
 */

export * from './provider.schema';
export * from './jellyseerr.schema';
export * from './list.schema';
export * from './trakt.schema';
export * from './mdblist.schema';
