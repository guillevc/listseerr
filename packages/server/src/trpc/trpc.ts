import { initTRPC, TRPCError } from '@trpc/server';
import { db } from '../db';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { DomainError } from 'shared/domain/errors/domain.error';

// Create context for each request
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // TODO: Extract from session when authentication is implemented
  // For now, default to userId: 1
  const userId = 1; // Future: opts.session?.user?.id ?? 1

  return {
    db,
    req: opts.req,
    userId,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

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

// Middleware to catch DomainErrors and wrap them in TRPCError
const domainErrorMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // If this is a DomainError, wrap it in a TRPCError with BAD_REQUEST code
    if (error instanceof DomainError) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
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
