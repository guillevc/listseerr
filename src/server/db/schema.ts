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
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  url: text('url').notNull(),
  apiKey: text('api_key').notNull(),
  userIdJellyseerr: integer('user_id_jellyseerr').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Provider configurations (Trakt, MDBList)
export const providerConfigs = sqliteTable('provider_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider', { enum: ['trakt', 'mdblist'] }).notNull(),
  clientId: text('client_id'),
  apiKey: text('api_key'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// General settings
export const generalSettings = sqliteTable('general_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  timezone: text('timezone').notNull().default('UTC'),
  automaticProcessingEnabled: integer('automatic_processing_enabled', { mode: 'boolean' }).notNull().default(false),
  automaticProcessingSchedule: text('automatic_processing_schedule'), // cron expression for global processing
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Media lists
export const mediaLists = sqliteTable('media_lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  provider: text('provider', { enum: ['trakt', 'mdblist'] }).notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  maxItems: integer('max_items'),
  processingSchedule: text('processing_schedule'), // DEPRECATED: Per-list schedules not used, use global automatic processing instead
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Execution history
export const executionHistory = sqliteTable('execution_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').notNull().references(() => mediaLists.id, { onDelete: 'cascade' }),
  batchId: text('batch_id'), // Groups executions from the same batch operation (e.g., "Process All")
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  status: text('status', { enum: ['running', 'success', 'error'] }).notNull(),
  triggerType: text('trigger_type', { enum: ['manual', 'scheduled'] }).notNull().default('manual'),
  itemsFound: integer('items_found'),
  itemsRequested: integer('items_requested'),
  itemsFailed: integer('items_failed'),
  errorMessage: text('error_message'),
});

// Global cache for requested items across all lists
// Once an item is requested by ANY list, it won't be requested again by other lists
// listId tracks which list first requested the item (for reference only)
export const listItemsCache = sqliteTable('list_items_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').notNull().references(() => mediaLists.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  year: integer('year'),
  tmdbId: integer('tmdb_id').unique(), // Unique constraint enforces global cache
  mediaType: text('media_type', { enum: ['movie', 'tv'] }).notNull(),
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  jellyseerrConfigs: many(jellyseerrConfigs),
  providerConfigs: many(providerConfigs),
  generalSettings: one(generalSettings),
  mediaLists: many(mediaLists),
}));

export const jellyseerrConfigsRelations = relations(jellyseerrConfigs, ({ one }) => ({
  user: one(users, {
    fields: [jellyseerrConfigs.userId],
    references: [users.id],
  }),
}));

export const providerConfigsRelations = relations(providerConfigs, ({ one }) => ({
  user: one(users, {
    fields: [providerConfigs.userId],
    references: [users.id],
  }),
}));

export const generalSettingsRelations = relations(generalSettings, ({ one }) => ({
  user: one(users, {
    fields: [generalSettings.userId],
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

export type ProviderConfig = typeof providerConfigs.$inferSelect;
export type NewProviderConfig = typeof providerConfigs.$inferInsert;

export type GeneralSettings = typeof generalSettings.$inferSelect;
export type NewGeneralSettings = typeof generalSettings.$inferInsert;

export type MediaList = typeof mediaLists.$inferSelect;
export type NewMediaList = typeof mediaLists.$inferInsert;

export type ExecutionHistory = typeof executionHistory.$inferSelect;
export type NewExecutionHistory = typeof executionHistory.$inferInsert;

export type ListItemCache = typeof listItemsCache.$inferSelect;
export type NewListItemCache = typeof listItemsCache.$inferInsert;
