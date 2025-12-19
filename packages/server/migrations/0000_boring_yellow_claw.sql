CREATE TABLE `execution_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`list_id` integer NOT NULL,
	`batch_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`status` text NOT NULL,
	`trigger_type` text DEFAULT 'manual' NOT NULL,
	`items_found` integer DEFAULT 0 NOT NULL,
	`items_requested` integer DEFAULT 0 NOT NULL,
	`items_failed` integer DEFAULT 0 NOT NULL,
	`items_skipped_available` integer DEFAULT 0 NOT NULL,
	`items_skipped_previously_requested` integer DEFAULT 0 NOT NULL,
	`error_message` text,
	FOREIGN KEY (`list_id`) REFERENCES `media_lists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `execution_history_list_id_idx` ON `execution_history` (`list_id`);--> statement-breakpoint
CREATE INDEX `execution_history_started_at_idx` ON `execution_history` (`started_at`);--> statement-breakpoint
CREATE INDEX `execution_history_batch_id_idx` ON `execution_history` (`batch_id`);--> statement-breakpoint
CREATE TABLE `general_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`automatic_processing_enabled` integer DEFAULT false NOT NULL,
	`automatic_processing_schedule` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `general_settings_user_id_unique` ON `general_settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `jellyseerr_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`url` text NOT NULL,
	`external_url` text,
	`api_key` text NOT NULL,
	`user_id_jellyseerr` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jellyseerr_configs_user_id_unique` ON `jellyseerr_configs` (`user_id`);--> statement-breakpoint
CREATE TABLE `media_lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`display_url` text,
	`provider` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`max_items` integer DEFAULT 50 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `media_lists_user_id_idx` ON `media_lists` (`user_id`);--> statement-breakpoint
CREATE TABLE `provider_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text NOT NULL,
	`data` text NOT NULL,
	`cached_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_cache_provider_unique` ON `provider_cache` (`provider`);--> statement-breakpoint
CREATE TABLE `provider_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`provider` text NOT NULL,
	`client_id` text,
	`api_key` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `provider_configs_user_id_idx` ON `provider_configs` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `provider_configs_user_provider_unique` ON `provider_configs` (`user_id`,`provider`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);