import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table (future-proofing for multi-user support)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash'), // Nullable for migration compatibility
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Sessions table for authentication
export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Jellyseerr configuration
export const jellyseerrConfigs = sqliteTable('jellyseerr_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  url: text('url').notNull(),
  externalUrl: text('external_url'), // User-facing URL for browser links (optional, falls back to url)
  apiKey: text('api_key').notNull(),
  userIdJellyseerr: integer('user_id_jellyseerr').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Provider configurations (Trakt, MDBList)
export const providerConfigs = sqliteTable('provider_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider', { enum: ['trakt', 'mdblist', 'traktChart', 'stevenlu'] }).notNull(),
  clientId: text('client_id'),
  apiKey: text('api_key'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// General settings
export const generalSettings = sqliteTable('general_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  timezone: text('timezone').notNull().default('UTC'),
  automaticProcessingEnabled: integer('automatic_processing_enabled', { mode: 'boolean' })
    .notNull()
    .default(false),
  automaticProcessingSchedule: text('automatic_processing_schedule'), // cron expression for global processing
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Media lists
export const mediaLists = sqliteTable('media_lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(), // API URL used internally for fetching
  displayUrl: text('display_url'), // User-facing URL shown in UI (optional, falls back to url if not set)
  provider: text('provider', { enum: ['trakt', 'mdblist', 'traktChart', 'stevenlu'] }).notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  maxItems: integer('max_items'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Execution history
export const executionHistory = sqliteTable('execution_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id')
    .notNull()
    .references(() => mediaLists.id, { onDelete: 'cascade' }),
  batchId: text('batch_id'), // Groups executions from the same batch operation (e.g., "Process All")
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  status: text('status', { enum: ['running', 'success', 'error'] }).notNull(),
  triggerType: text('trigger_type', { enum: ['manual', 'scheduled'] })
    .notNull()
    .default('manual'),
  itemsFound: integer('items_found'),
  itemsRequested: integer('items_requested'),
  itemsFailed: integer('items_failed'),
  itemsSkippedAvailable: integer('items_skipped_available'),
  itemsSkippedPreviouslyRequested: integer('items_skipped_previously_requested'),
  errorMessage: text('error_message'),
});

// Provider cache for external data (e.g., StevenLu JSON)
// Stores cached responses from providers with timestamps for cache invalidation
export const providerCache = sqliteTable('provider_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  provider: text('provider', { enum: ['stevenlu'] })
    .notNull()
    .unique(),
  data: text('data').notNull(), // JSON string of the cached response
  cachedAt: integer('cached_at', { mode: 'timestamp' }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  jellyseerrConfigs: many(jellyseerrConfigs),
  providerConfigs: many(providerConfigs),
  generalSettings: one(generalSettings),
  mediaLists: many(mediaLists),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
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
}));

export const executionHistoryRelations = relations(executionHistory, ({ one }) => ({
  list: one(mediaLists, {
    fields: [executionHistory.listId],
    references: [mediaLists.id],
  }),
}));

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

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

export type ProviderCache = typeof providerCache.$inferSelect;
export type NewProviderCache = typeof providerCache.$inferInsert;
