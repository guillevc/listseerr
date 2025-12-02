import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { mediaLists } from '../../db/schema';
import { eq } from 'drizzle-orm';

const listInputSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  provider: z.enum(['trakt', 'letterboxd', 'mdblist', 'imdb', 'tmdb']),
  enabled: z.boolean().default(true),
  maxItems: z.number().positive().optional(),
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
      return updatedList;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
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

      // Toggle enabled
      const [updatedList] = await ctx.db
        .update(mediaLists)
        .set({
          enabled: !list.enabled,
          updatedAt: new Date(),
        })
        .where(eq(mediaLists.id, input.id))
        .returning();

      return updatedList;
    }),
});
