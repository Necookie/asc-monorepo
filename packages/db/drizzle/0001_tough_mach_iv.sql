ALTER TABLE `profiles` ADD `layout` text DEFAULT 'classic' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `supporter_layout` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `typography` text DEFAULT 'balanced' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `avatar_frame` text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `cover_treatment` text DEFAULT 'solid' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `cover_position` integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `motion` text DEFAULT 'subtle' NOT NULL;