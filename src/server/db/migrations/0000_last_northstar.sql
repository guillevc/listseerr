CREATE TABLE `execution_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`list_id` integer NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`status` text NOT NULL,
	`items_found` integer,
	`items_requested` integer,
	`error_message` text,
	FOREIGN KEY (`list_id`) REFERENCES `media_lists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jellyseerr_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`url` text NOT NULL,
	`api_key` text NOT NULL,
	`user_id_jellyseerr` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `list_items_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`list_id` integer NOT NULL,
	`title` text NOT NULL,
	`year` integer,
	`tmdb_id` integer,
	`imdb_id` text,
	`media_type` text NOT NULL,
	`fetched_at` integer,
	FOREIGN KEY (`list_id`) REFERENCES `media_lists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `media_lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`provider` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`max_items` integer,
	`processing_schedule` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);