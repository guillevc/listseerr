import { createTRPCReact, type CreateTRPCReact } from '@trpc/react-query';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from 'server/trpc';

export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>();

// Type helpers for inferring router input/output types
export type RouterOutputs = inferRouterOutputs<AppRouter>;
