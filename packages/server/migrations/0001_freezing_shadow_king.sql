PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_general_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`automatic_processing_enabled` integer DEFAULT true NOT NULL,
	`automatic_processing_schedule` text DEFAULT '0 4 * * *',
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_general_settings`("id", "user_id", "automatic_processing_enabled", "automatic_processing_schedule", "created_at", "updated_at") SELECT "id", "user_id", "automatic_processing_enabled", "automatic_processing_schedule", "created_at", "updated_at" FROM `general_settings`;--> statement-breakpoint
DROP TABLE `general_settings`;--> statement-breakpoint
ALTER TABLE `__new_general_settings` RENAME TO `general_settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `general_settings_user_id_unique` ON `general_settings` (`user_id`);