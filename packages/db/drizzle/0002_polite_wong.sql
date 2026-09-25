CREATE INDEX `idx_users_status_synced` ON `users` (`membership_status`,`last_synced_at`);--> statement-breakpoint
CREATE INDEX `idx_profile_slugs_user_primary` ON `profile_slugs` (`user_id`,`is_primary`);--> statement-breakpoint
CREATE INDEX `idx_community_roles_is_supporter` ON `community_roles` (`is_supporter`);