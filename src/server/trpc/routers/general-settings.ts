import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { generalSettings } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { createLogger } from '../../lib/logger';
import { scheduler } from '../../lib/scheduler';

const logger = createLogger('general-settings');

const settingsInputSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
});

export const generalSettingsRouter = router({
  get: publicProcedure.query(async ({ ctx }) => {
    // Get settings for default user (ID 1)
    const [settings] = await ctx.db
      .select()
      .from(generalSettings)
      .where(eq(generalSettings.userId, 1))
      .limit(1);

    return settings || null;
  }),

  set: publicProcedure
    .input(settingsInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if settings exist for user
      const [existingSettings] = await ctx.db
        .select()
        .from(generalSettings)
        .where(eq(generalSettings.userId, 1))
        .limit(1);

      const oldTimezone = existingSettings?.timezone;
      const newTimezone = input.timezone;

      let result;

      if (existingSettings) {
        // Update existing settings
        const [updated] = await ctx.db
          .update(generalSettings)
          .set({
            timezone: input.timezone,
            updatedAt: new Date(),
          })
          .where(eq(generalSettings.id, existingSettings.id))
          .returning();

        result = updated;
      } else {
        // Create new settings
        const [created] = await ctx.db
          .insert(generalSettings)
          .values({
            userId: 1,
            timezone: input.timezone,
          })
          .returning();

        result = created;
      }

      // Log the timezone change
      logger.info(
        {
          oldTimezone: oldTimezone || 'none',
          newTimezone,
          userId: 1,
        },
        '⏰ Timezone changed - reloading scheduler with new timezone'
      );

      // Reload scheduler to apply new timezone to all cron jobs
      try {
        await scheduler.loadScheduledLists();
        logger.info('✅ Scheduler reloaded successfully with new timezone');
      } catch (error) {
        logger.error(
          {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          '❌ Failed to reload scheduler after timezone change'
        );
      }

      return result;
    }),
});
