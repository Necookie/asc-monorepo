CREATE TABLE `staff_access` (
	`user_id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`granted_by` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`granted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "staff_access_role_check" CHECK("staff_access"."role" in ('ADMIN', 'MODERATOR'))
);
--> statement-breakpoint
ALTER TABLE `profiles` ADD `is_moderated` integer DEFAULT false NOT NULL;
--> statement-breakpoint
-- Preserve the most recent historical hide/restore decision without changing member privacy.
UPDATE `profiles` SET `is_moderated` = COALESCE((
  SELECT CASE WHEN `action_type` = 'HIDE_PROFILE' THEN 1 ELSE 0 END
  FROM `moderation_actions`
  WHERE `target_user_id` = `profiles`.`user_id`
    AND `action_type` IN ('HIDE_PROFILE', 'UNHIDE_PROFILE')
  ORDER BY `created_at` DESC, rowid DESC
  LIMIT 1
), 0);
