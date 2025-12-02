import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { jellyseerrConfigs } from '../../db/schema';
import { eq } from 'drizzle-orm';

const configInputSchema = z.object({
  url: z.string().url(),
  apiKey: z.string().min(1),
  userIdJellyseerr: z.number().positive(),
});

export const configRouter = router({
  get: publicProcedure.query(async ({ ctx }) => {
    // Get config for default user (ID 1)
    const [config] = await ctx.db
      .select()
      .from(jellyseerrConfigs)
      .where(eq(jellyseerrConfigs.userId, 1))
      .limit(1);
    return config || null;
  }),

  set: publicProcedure
    .input(configInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if config exists for user
      const [existingConfig] = await ctx.db
        .select()
        .from(jellyseerrConfigs)
        .where(eq(jellyseerrConfigs.userId, 1))
        .limit(1);

      if (existingConfig) {
        // Update existing config
        const [updatedConfig] = await ctx.db
          .update(jellyseerrConfigs)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(jellyseerrConfigs.id, existingConfig.id))
          .returning();
        return updatedConfig;
      } else {
        // Create new config
        const [newConfig] = await ctx.db
          .insert(jellyseerrConfigs)
          .values({
            ...input,
            userId: 1, // Default user
          })
          .returning();
        return newConfig;
      }
    }),

  test: publicProcedure
    .input(configInputSchema)
    .mutation(async ({ input }) => {
      try {
        // Test connection to Jellyseerr
        const response = await fetch(`${input.url}/api/v1/status`, {
          headers: {
            'X-Api-Key': input.apiKey,
          },
        });

        if (!response.ok) {
          return {
            success: false,
            message: `Failed to connect: ${response.statusText}`,
          };
        }

        return {
          success: true,
          message: 'Connection successful',
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }),

  delete: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .delete(jellyseerrConfigs)
      .where(eq(jellyseerrConfigs.userId, 1));
    return { success: true };
  }),
});
