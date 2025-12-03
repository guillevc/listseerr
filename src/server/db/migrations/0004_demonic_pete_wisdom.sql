ALTER TABLE `general_settings` ADD `automatic_processing_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `general_settings` ADD `automatic_processing_schedule` text;