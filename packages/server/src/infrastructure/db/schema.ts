import { sqliteTable, text, integer, index, unique } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table (future-proofing for multi-user support)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Sessions table for authentication
export const sessions = sqliteTable(
  'sessions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)]
);

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
export const providerConfigs = sqliteTable(
  'provider_configs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider', {
      enum: ['trakt', 'mdblist', 'traktChart', 'stevenlu', 'anilist'],
    }).notNull(),
    clientId: text('client_id'),
    apiKey: text('api_key'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    unique('provider_configs_user_provider_unique').on(table.userId, table.provider),
    index('provider_configs_user_id_idx').on(table.userId),
  ]
);

// General settings
// Note: Timezone is configured via TZ environment variable, not stored in DB
export const generalSettings = sqliteTable('general_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  automaticProcessingEnabled: integer('automatic_processing_enabled', { mode: 'boolean' })
    .notNull()
    .default(true),
  automaticProcessingSchedule: text('automatic_processing_schedule').default('0 4 * * *'), // cron expression for global processing (daily at 4:00 AM)
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Media lists
export const mediaLists = sqliteTable(
  'media_lists',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    url: text('url').notNull(), // API URL used internally for fetching
    displayUrl: text('display_url'), // User-facing URL shown in UI (optional, falls back to url if not set)
    provider: text('provider', {
      enum: ['trakt', 'mdblist', 'traktChart', 'stevenlu', 'anilist'],
    }).notNull(),
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
    maxItems: integer('max_items').notNull().default(50),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('media_lists_user_id_idx').on(table.userId)]
);

// Execution history
export const executionHistory = sqliteTable(
  'execution_history',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    listId: integer('list_id')
      .notNull()
      .references(() => mediaLists.id, { onDelete: 'cascade' }),
    batchId: text('batch_id').notNull(), // Groups executions from the same batch operation
    startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    status: text('status', { enum: ['running', 'success', 'error'] }).notNull(),
    triggerType: text('trigger_type', { enum: ['manual', 'scheduled'] })
      .notNull()
      .default('manual'),
    itemsFound: integer('items_found').notNull().default(0),
    itemsRequested: integer('items_requested').notNull().default(0),
    itemsFailed: integer('items_failed').notNull().default(0),
    itemsSkippedAvailable: integer('items_skipped_available').notNull().default(0),
    itemsSkippedPreviouslyRequested: integer('items_skipped_previously_requested')
      .notNull()
      .default(0),
    errorMessage: text('error_message'),
  },
  (table) => [
    index('execution_history_list_id_idx').on(table.listId),
    index('execution_history_started_at_idx').on(table.startedAt),
    index('execution_history_batch_id_idx').on(table.batchId),
  ]
);

// Provider cache for external data (e.g., StevenLu JSON, anime-ids mapping)
// Stores cached responses from providers with timestamps for cache invalidation
export const providerCache = sqliteTable('provider_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  provider: text('provider', { enum: ['stevenlu', 'anime-ids'] })
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
