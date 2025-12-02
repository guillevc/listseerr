import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table (future-proofing for multi-user support)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Jellyseerr configuration
export const jellyseerrConfigs = sqliteTable('jellyseerr_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  apiKey: text('api_key').notNull(),
  userIdJellyseerr: integer('user_id_jellyseerr').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Media lists
export const mediaLists = sqliteTable('media_lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  provider: text('provider', { enum: ['trakt', 'letterboxd', 'mdblist', 'imdb', 'tmdb'] }).notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  maxItems: integer('max_items'),
  processingSchedule: text('processing_schedule'), // cron expression
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Execution history
export const executionHistory = sqliteTable('execution_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').notNull().references(() => mediaLists.id, { onDelete: 'cascade' }),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  status: text('status', { enum: ['running', 'success', 'error'] }).notNull(),
  itemsFound: integer('items_found'),
  itemsRequested: integer('items_requested'),
  errorMessage: text('error_message'),
});

// List items cache (optional, for performance)
export const listItemsCache = sqliteTable('list_items_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').notNull().references(() => mediaLists.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  year: integer('year'),
  tmdbId: integer('tmdb_id'),
  imdbId: text('imdb_id'),
  mediaType: text('media_type', { enum: ['movie', 'tv'] }).notNull(),
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  jellyseerrConfigs: many(jellyseerrConfigs),
  mediaLists: many(mediaLists),
}));

export const jellyseerrConfigsRelations = relations(jellyseerrConfigs, ({ one }) => ({
  user: one(users, {
    fields: [jellyseerrConfigs.userId],
    references: [users.id],
  }),
}));

export const mediaListsRelations = relations(mediaLists, ({ one, many }) => ({
  user: one(users, {
    fields: [mediaLists.userId],
    references: [users.id],
  }),
  executionHistory: many(executionHistory),
  listItems: many(listItemsCache),
}));

export const executionHistoryRelations = relations(executionHistory, ({ one }) => ({
  list: one(mediaLists, {
    fields: [executionHistory.listId],
    references: [mediaLists.id],
  }),
}));

export const listItemsCacheRelations = relations(listItemsCache, ({ one }) => ({
  list: one(mediaLists, {
    fields: [listItemsCache.listId],
    references: [mediaLists.id],
  }),
}));

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type JellyseerrConfig = typeof jellyseerrConfigs.$inferSelect;
export type NewJellyseerrConfig = typeof jellyseerrConfigs.$inferInsert;

export type MediaList = typeof mediaLists.$inferSelect;
export type NewMediaList = typeof mediaLists.$inferInsert;

export type ExecutionHistory = typeof executionHistory.$inferSelect;
export type NewExecutionHistory = typeof executionHistory.$inferInsert;

export type ListItemCache = typeof listItemsCache.$inferSelect;
export type NewListItemCache = typeof listItemsCache.$inferInsert;
