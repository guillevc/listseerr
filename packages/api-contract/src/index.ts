/**
 * tRPC API Contract
 *
 * This package contains only the type definitions for the tRPC API router.
 * It serves as the contract between the server (which implements the API)
 * and the client (which consumes it).
 *
 * This maintains clean architecture by:
 * - Keeping server implementation details in the server package
 * - Exposing only type contracts to the client
 * - Preventing the client from directly depending on server internals
 */

export type { AppRouter } from 'server/trpc';
