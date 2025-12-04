import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { providerConfigs } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

const traktConfigInputSchema = z.object({
  clientId: z.string().optional(),
});

export const providerConfigRouter = router({
  getTraktConfig: publicProcedure.query(async ({ ctx }) => {
    // Get Trakt config for default user (ID 1)
    const [config] = await ctx.db
      .select()
      .from(providerConfigs)
      .where(
        and(
          eq(providerConfigs.userId, 1),
          eq(providerConfigs.provider, 'trakt')
        )
      )
      .limit(1);

    return config || null;
  }),

  setTraktConfig: publicProcedure
    .input(traktConfigInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if Trakt config exists for user
      const [existingConfig] = await ctx.db
        .select()
        .from(providerConfigs)
        .where(
          and(
            eq(providerConfigs.userId, 1),
            eq(providerConfigs.provider, 'trakt')
          )
        )
        .limit(1);

      if (existingConfig) {
        // Update existing config
        const [updatedConfig] = await ctx.db
          .update(providerConfigs)
          .set({
            clientId: input.clientId,
            updatedAt: new Date(),
          })
          .where(eq(providerConfigs.id, existingConfig.id))
          .returning();

        return updatedConfig;
      } else {
        // Create new config
        const [newConfig] = await ctx.db
          .insert(providerConfigs)
          .values({
            userId: 1,
            provider: 'trakt',
            clientId: input.clientId,
          })
          .returning();

        return newConfig;
      }
    }),

  deleteTraktConfig: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .delete(providerConfigs)
      .where(
        and(
          eq(providerConfigs.userId, 1),
          eq(providerConfigs.provider, 'trakt')
        )
      );

    return { success: true };
  }),

  // MDBList configuration
  getMdbListConfig: publicProcedure.query(async ({ ctx }) => {
    const [config] = await ctx.db
      .select()
      .from(providerConfigs)
      .where(
        and(
          eq(providerConfigs.userId, 1),
          eq(providerConfigs.provider, 'mdblist')
        )
      )
      .limit(1);

    return config || null;
  }),

  setMdbListConfig: publicProcedure
    .input(z.object({ apiKey: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const [existingConfig] = await ctx.db
        .select()
        .from(providerConfigs)
        .where(
          and(
            eq(providerConfigs.userId, 1),
            eq(providerConfigs.provider, 'mdblist')
          )
        )
        .limit(1);

      if (existingConfig) {
        const [updatedConfig] = await ctx.db
          .update(providerConfigs)
          .set({
            apiKey: input.apiKey || null,
            updatedAt: new Date(),
          })
          .where(eq(providerConfigs.id, existingConfig.id))
          .returning();

        return updatedConfig;
      } else {
        const [newConfig] = await ctx.db
          .insert(providerConfigs)
          .values({
            userId: 1,
            provider: 'mdblist',
            apiKey: input.apiKey || null,
          })
          .returning();

        return newConfig;
      }
    }),

  deleteMdbListConfig: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .delete(providerConfigs)
      .where(
        and(
          eq(providerConfigs.userId, 1),
          eq(providerConfigs.provider, 'mdblist')
        )
      );

    return { success: true };
  }),
});
