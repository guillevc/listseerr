CREATE TABLE `provider_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text NOT NULL,
	`data` text NOT NULL,
	`cached_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_cache_provider_unique` ON `provider_cache` (`provider`);