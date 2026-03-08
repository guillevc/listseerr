ALTER TABLE `jellyseerr_configs` RENAME TO `seerr_configs`;--> statement-breakpoint
ALTER TABLE `seerr_configs` RENAME COLUMN `user_id_jellyseerr` TO `user_id_seerr`;--> statement-breakpoint
DROP INDEX IF EXISTS `jellyseerr_configs_user_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `seerr_configs_user_id_unique` ON `seerr_configs` (`user_id`);
