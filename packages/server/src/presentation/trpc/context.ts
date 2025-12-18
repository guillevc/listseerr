import { initTRPC, TRPCError } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { DomainError } from 'shared/domain/errors/domain.error';

/**
 * Create tRPC context for each request.
 * Database access is handled via DI containers, not context.
 */
export function createContext(opts: FetchCreateContextFnOptions) {
  // TODO: Extract from session when authentication is implemented
  // For now, default to userId: 1
  const userId = 1; // Future: opts.session?.user?.id ?? 1

  return {
    req: opts.req,
    userId,
  };
}

export type Context = {
  req: Request;
  userId: number;
};

// Initialize tRPC with error handling
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    // If the error is a DomainError, translate it to a BAD_REQUEST
    if (error.cause instanceof DomainError) {
      return {
        ...shape,
        data: {
          ...shape.data,
          code: 'BAD_REQUEST',
        },
        message: error.cause.message,
      };
    }

    return shape;
  },
});

// Granular error-to-code mapping for domain errors
type TRPCErrorCode = 'BAD_REQUEST' | 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT';
const errorCodeMap: Record<string, TRPCErrorCode> = {
  // Validation errors -> BAD_REQUEST
  InvalidProviderError: 'BAD_REQUEST',
  InvalidListNameError: 'BAD_REQUEST',
  InvalidListUrlError: 'BAD_REQUEST',
  InvalidMaxItemsError: 'BAD_REQUEST',
  InvalidJellyseerrUrlError: 'BAD_REQUEST',
  InvalidJellyseerrApiKeyError: 'BAD_REQUEST',
  InvalidJellyseerrUserIdError: 'BAD_REQUEST',
  InvalidTraktClientIdError: 'BAD_REQUEST',
  InvalidMdbListApiKeyError: 'BAD_REQUEST',
  InvalidTriggerTypeError: 'BAD_REQUEST',
  InvalidBatchIdError: 'BAD_REQUEST',
  InvalidMediaItemError: 'BAD_REQUEST',
  // Not found errors -> NOT_FOUND
  EntityNotFoundError: 'NOT_FOUND',
  MediaListNotFoundError: 'NOT_FOUND',
  ConfigNotFoundError: 'NOT_FOUND',
  // Business rule violations -> FORBIDDEN
  ProviderDisabledError: 'FORBIDDEN',
  // Conflict errors -> CONFLICT
  DuplicateListError: 'CONFLICT',
};

// Middleware to catch DomainErrors and wrap them in TRPCError
const domainErrorMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // If this is a DomainError, wrap it in a TRPCError with appropriate code
    if (error instanceof DomainError) {
      const code = errorCodeMap[error.name] ?? 'BAD_REQUEST';
      throw new TRPCError({
        code,
        message: error.message,
        cause: error,
      });
    }
    // Otherwise, re-throw as-is
    throw error;
  }
});

// Export reusable router and procedure helpers
export const router = t.router;
// Apply domain error middleware to all procedures
export const publicProcedure = t.procedure.use(domainErrorMiddleware);
