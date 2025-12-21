import { z } from 'zod';
import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetAllMediaListsCommand,
  GetMediaListByIdCommand,
  CreateMediaListCommand,
  UpdateMediaListCommand,
  DeleteMediaListCommand,
  ToggleListEnabledCommand,
  EnableAllListsCommand,
} from 'shared/application/dtos';
import type {
  GetAllMediaListsResponse,
  GetMediaListByIdResponse,
  CreateMediaListResponse,
  UpdateMediaListResponse,
  DeleteMediaListResponse,
  ToggleListEnabledResponse,
  EnableAllListsResponse,
} from 'shared/application/dtos';
import { createListSchema, updateListSchema } from 'shared/presentation/schemas';

export interface ListsRouterDeps {
  getAllMediaListsUseCase: IUseCase<GetAllMediaListsCommand, GetAllMediaListsResponse>;
  getMediaListByIdUseCase: IUseCase<GetMediaListByIdCommand, GetMediaListByIdResponse>;
  createMediaListUseCase: IUseCase<CreateMediaListCommand, CreateMediaListResponse>;
  updateMediaListUseCase: IUseCase<UpdateMediaListCommand, UpdateMediaListResponse>;
  deleteMediaListUseCase: IUseCase<DeleteMediaListCommand, DeleteMediaListResponse>;
  toggleListEnabledUseCase: IUseCase<ToggleListEnabledCommand, ToggleListEnabledResponse>;
  enableAllListsUseCase: IUseCase<EnableAllListsCommand, EnableAllListsResponse>;
}

/**
 * Lists Router - Thin presentation layer for media list management
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas
 * 2. Delegates to use cases via injected dependencies
 * 3. Returns Response DTOs directly (tRPC handles serialization)
 * 4. Contains ZERO business logic
 *
 * All business logic lives in the use cases (application layer).
 */
export function createListsRouter(deps: ListsRouterDeps) {
  return router({
    getAll: publicProcedure.query(async ({ ctx }) => {
      return await deps.getAllMediaListsUseCase.execute({ userId: ctx.userId });
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
      return await deps.getMediaListByIdUseCase.execute({
        id: input.id,
        userId: ctx.userId,
      });
    }),

    create: publicProcedure.input(createListSchema).mutation(async ({ input, ctx }) => {
      return await deps.createMediaListUseCase.execute({
        ...input,
        userId: ctx.userId,
      });
    }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          data: updateListSchema,
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await deps.updateMediaListUseCase.execute({
          id: input.id,
          userId: ctx.userId,
          data: input.data,
        });
      }),

    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      return await deps.deleteMediaListUseCase.execute({
        id: input.id,
        userId: ctx.userId,
      });
    }),

    toggleEnabled: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await deps.toggleListEnabledUseCase.execute({
          id: input.id,
          userId: ctx.userId,
        });
      }),

    enableAll: publicProcedure.mutation(async ({ ctx }) => {
      return await deps.enableAllListsUseCase.execute({ userId: ctx.userId });
    }),
  });
}
