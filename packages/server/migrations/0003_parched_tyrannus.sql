ALTER TABLE `execution_history` ADD `trigger_type` text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `execution_history` ADD `items_failed` integer;