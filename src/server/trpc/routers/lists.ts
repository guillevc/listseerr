import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { mediaLists } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { scheduler } from '../../lib/scheduler';
import { createLogger } from '../../lib/logger';

const logger = createLogger('lists');

const listInputSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  provider: z.enum(['trakt', 'letterboxd', 'mdblist', 'imdb', 'tmdb']).default('trakt'),
  enabled: z.boolean().default(true),
  maxItems: z.number().positive().max(50).default(20),
  processingSchedule: z.string().optional(),
});

export const listsRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    // For now, get lists for the default user (ID 1)
    const lists = await ctx.db.select().from(mediaLists).where(eq(mediaLists.userId, 1));
    return lists;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [list] = await ctx.db
        .select()
        .from(mediaLists)
        .where(eq(mediaLists.id, input.id))
        .limit(1);
      return list || null;
    }),

  create: publicProcedure
    .input(listInputSchema)
    .mutation(async ({ ctx, input }) => {
      const [newList] = await ctx.db
        .insert(mediaLists)
        .values({
          ...input,
          userId: 1, // Default user
        })
        .returning();

      logger.info(
        {
          listId: newList.id,
          listName: newList.name,
          provider: newList.provider,
          url: newList.url,
          maxItems: newList.maxItems,
          enabled: newList.enabled,
          schedule: newList.processingSchedule || 'none',
        },
        '➕ List created'
      );

      // Reload scheduler if the list has a schedule
      if (newList.processingSchedule && newList.enabled) {
        await scheduler.loadScheduledLists();
        logger.info({ listId: newList.id }, 'Scheduler reloaded for new list');
      }

      return newList;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: listInputSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedList] = await ctx.db
        .update(mediaLists)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(mediaLists.id, input.id))
        .returning();

      logger.info(
        {
          listId: updatedList.id,
          listName: updatedList.name,
          changes: input.data,
        },
        '✏️ List updated'
      );

      // Reload scheduler if schedule-related fields were updated
      if (input.data.processingSchedule !== undefined || input.data.enabled !== undefined) {
        await scheduler.loadScheduledLists();
        logger.info({ listId: updatedList.id }, 'Scheduler reloaded for list update');
      }

      return updatedList;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Get list info before deleting
      const [list] = await ctx.db
        .select()
        .from(mediaLists)
        .where(eq(mediaLists.id, input.id))
        .limit(1);

      if (list) {
        logger.info(
          {
            listId: list.id,
            listName: list.name,
            provider: list.provider,
          },
          '🗑️ List deleted'
        );
      }

      // Unschedule the list first
      scheduler.unscheduleList(input.id);

      await ctx.db.delete(mediaLists).where(eq(mediaLists.id, input.id));
      return { success: true };
    }),

  toggleEnabled: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Get current state
      const [list] = await ctx.db
        .select()
        .from(mediaLists)
        .where(eq(mediaLists.id, input.id))
        .limit(1);

      if (!list) {
        throw new Error('List not found');
      }

      const newEnabledState = !list.enabled;

      // Toggle enabled
      const [updatedList] = await ctx.db
        .update(mediaLists)
        .set({
          enabled: newEnabledState,
          updatedAt: new Date(),
        })
        .where(eq(mediaLists.id, input.id))
        .returning();

      logger.info(
        {
          listId: list.id,
          listName: list.name,
          oldState: list.enabled ? 'enabled' : 'disabled',
          newState: newEnabledState ? 'enabled' : 'disabled',
        },
        newEnabledState ? '✅ List enabled' : '⏸️ List disabled'
      );

      // Reload scheduler if list has a schedule
      if (list.processingSchedule) {
        await scheduler.loadScheduledLists();
        logger.info({ listId: list.id }, 'Scheduler reloaded for enabled state change');
      }

      return updatedList;
    }),
});
