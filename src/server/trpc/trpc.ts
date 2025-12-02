import { initTRPC } from '@trpc/server';
import { db } from '../db';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

// Create context for each request
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    db,
    req: opts.req,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
