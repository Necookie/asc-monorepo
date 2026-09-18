CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`external_user_id` text NOT NULL,
	`clerk_user_id` text,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`nickname` text,
	`avatar` text,
	`membership_status` text DEFAULT 'ACTIVE' NOT NULL,
	`first_joined_at` integer NOT NULL,
	`left_at` integer,
	`last_synced_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_external_user_id_unique` ON `users` (`external_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_user_id_unique` ON `users` (`clerk_user_id`);--> statement-breakpoint
CREATE INDEX `idx_users_external_user_id` ON `users` (`external_user_id`);--> statement-breakpoint
CREATE INDEX `idx_users_clerk_user_id` ON `users` (`clerk_user_id`);--> statement-breakpoint
CREATE INDEX `idx_users_username` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`bio` text,
	`custom_title` text,
	`accent_color` text DEFAULT '#5865f2' NOT NULL,
	`theme` text DEFAULT 'canvas' NOT NULL,
	`background_url` text,
	`is_private` integer DEFAULT false NOT NULL,
	`show_roles` integer DEFAULT true NOT NULL,
	`show_membership_date` integer DEFAULT true NOT NULL,
	`show_tags` integer DEFAULT true NOT NULL,
	`show_links` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_id_unique` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_profiles_user_id` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `profile_slugs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`slug` text NOT NULL,
	`is_primary` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`released_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_slugs_slug_unique` ON `profile_slugs` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_profile_slugs_slug` ON `profile_slugs` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_profile_slugs_user_id` ON `profile_slugs` (`user_id`);--> statement-breakpoint
CREATE TABLE `membership_periods` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`joined_at` integer NOT NULL,
	`left_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_membership_periods_user_id` ON `membership_periods` (`user_id`);--> statement-breakpoint
CREATE TABLE `community_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`external_role_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#5865f2' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`is_supporter` integer DEFAULT false NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`is_moderator` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `community_roles_external_role_id_unique` ON `community_roles` (`external_role_id`);--> statement-breakpoint
CREATE INDEX `idx_community_roles_external_id` ON `community_roles` (`external_role_id`);--> statement-breakpoint
CREATE TABLE `member_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`assigned_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `community_roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_member_roles_unique` ON `member_roles` (`user_id`,`role_id`);--> statement-breakpoint
CREATE INDEX `idx_member_roles_user_id` ON `member_roles` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_member_roles_role_id` ON `member_roles` (`role_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#5865f2' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_tags_slug` ON `tags` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_tags_is_active` ON `tags` (`is_active`);--> statement-breakpoint
CREATE TABLE `member_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`assigned_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_member_tags_unique` ON `member_tags` (`user_id`,`tag_id`);--> statement-breakpoint
CREATE INDEX `idx_member_tags_user_id` ON `member_tags` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_member_tags_tag_id` ON `member_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `profile_links` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`label` text NOT NULL,
	`url` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_profile_links_profile_id` ON `profile_links` (`profile_id`);--> statement-breakpoint
CREATE TABLE `entitlements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`source` text NOT NULL,
	`granted_at` integer NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_entitlements_user_id` ON `entitlements` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_entitlements_key` ON `entitlements` (`key`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `moderation_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`target_user_id` text NOT NULL,
	`actor_user_id` text NOT NULL,
	`action_type` text NOT NULL,
	`reason` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_moderation_actions_target` ON `moderation_actions` (`target_user_id`);--> statement-breakpoint
CREATE INDEX `idx_moderation_actions_actor` ON `moderation_actions` (`actor_user_id`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_actor` ON `audit_logs` (`actor_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_action` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_created_at` ON `audit_logs` (`created_at`);