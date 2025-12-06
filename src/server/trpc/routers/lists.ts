import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { mediaLists, executionHistory } from '../../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { scheduler } from '../../lib/scheduler';
import { createLogger } from '../../lib/logger';
import { convertDisplayUrlToApiUrl as convertTraktListUrl } from '../../services/trakt/url-parser';
import { convertDisplayUrlToApiUrl as convertTraktChartUrl } from '../../services/trakt/chart-client';

const logger = createLogger('lists');

const listInputSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  displayUrl: z.string().optional(),
  provider: z.enum(['trakt', 'mdblist', 'traktChart', 'stevenlu']).default('trakt'),
  enabled: z.boolean().default(true),
  maxItems: z.number().positive().max(50).default(20),
  processingSchedule: z.string().optional(),
});

/**
 * Convert a user-provided URL to API and display URLs based on provider
 */
function processUrlForProvider(url: string, provider: 'trakt' | 'mdblist' | 'traktChart' | 'stevenlu', providedDisplayUrl?: string): {
  apiUrl: string;
  displayUrl: string;
} {
  // Remove query params from URL
  const cleanUrl = url.split('?')[0];

  if (provider === 'traktChart') {
    // For Trakt charts, convert display URL to API URL
    try {
      const apiUrl = convertTraktChartUrl(cleanUrl);
      return { apiUrl, displayUrl: cleanUrl };
    } catch {
      // If conversion fails, assume it's already an API URL
      return { apiUrl: cleanUrl, displayUrl: cleanUrl };
    }
  } else if (provider === 'trakt') {
    // For Trakt lists, convert display URL to API URL
    try {
      const apiUrl = convertTraktListUrl(cleanUrl);
      return { apiUrl, displayUrl: cleanUrl };
    } catch {
      // If conversion fails, assume it's already an API URL
      return { apiUrl: cleanUrl, displayUrl: cleanUrl };
    }
  } else if (provider === 'stevenlu') {
    // For StevenLu, URL is the API endpoint and displayUrl is provided separately
    return { apiUrl: cleanUrl, displayUrl: providedDisplayUrl || cleanUrl };
  } else {
    // For MDBList, URL is used as-is (no separate API endpoint)
    return { apiUrl: cleanUrl, displayUrl: cleanUrl };
  }
}

export const listsRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    // Get lists for the default user (ID 1) with their last processed time
    const lists = await ctx.db.select().from(mediaLists).where(eq(mediaLists.userId, 1));

    // For each list, get the most recent successful processing time
    const listsWithLastProcessed = await Promise.all(
      lists.map(async (list) => {
        const [lastExecution] = await ctx.db
          .select({ completedAt: executionHistory.completedAt })
          .from(executionHistory)
          .where(
            and(
              eq(executionHistory.listId, list.id),
              eq(executionHistory.status, 'success')
            )
          )
          .orderBy(desc(executionHistory.completedAt))
          .limit(1);

        return {
          ...list,
          lastProcessed: lastExecution?.completedAt || null,
        };
      })
    );

    return listsWithLastProcessed;
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
      // Process URL based on provider
      const { apiUrl, displayUrl } = processUrlForProvider(input.url, input.provider, input.displayUrl);

      const [newList] = await ctx.db
        .insert(mediaLists)
        .values({
          ...input,
          url: apiUrl,
          displayUrl: displayUrl,
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
      // Process URL if URL or provider is being updated
      let cleanedData = input.data;

      if (input.data.url || input.data.provider) {
        // Get current list to get the provider if not being updated
        const [currentList] = await ctx.db
          .select()
          .from(mediaLists)
          .where(eq(mediaLists.id, input.id))
          .limit(1);

        if (!currentList) {
          throw new Error('List not found');
        }

        const provider = input.data.provider || currentList.provider;
        const url = input.data.url || currentList.url;

        const { apiUrl, displayUrl } = processUrlForProvider(url, provider, input.data.displayUrl);
        cleanedData = {
          ...input.data,
          url: apiUrl,
          displayUrl: displayUrl,
        };
      }

      const [updatedList] = await ctx.db
        .update(mediaLists)
        .set({
          ...cleanedData,
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

  enableAll: publicProcedure
    .mutation(async ({ ctx }) => {
      // Enable all lists
      await ctx.db
        .update(mediaLists)
        .set({
          enabled: true,
          updatedAt: new Date(),
        })
        .where(eq(mediaLists.userId, 1));

      logger.info('✅ All lists enabled');

      // Reload scheduler to pick up all enabled lists
      await scheduler.loadScheduledLists();

      return { success: true };
    }),
});
