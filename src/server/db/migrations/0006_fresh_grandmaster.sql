CREATE UNIQUE INDEX `jellyseerr_configs_user_id_unique` ON `jellyseerr_configs` (`user_id`);--> statement-breakpoint
ALTER TABLE `list_items_cache` DROP COLUMN `imdb_id`;