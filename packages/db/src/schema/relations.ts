import { relations } from 'drizzle-orm';
import { users } from './users';
import { profiles } from './profiles';
import { profileSlugs } from './profile_slugs';
import { membershipPeriods } from './membership_periods';
import { communityRoles } from './community_roles';
import { memberRoles } from './member_roles';
import { tags } from './tags';
import { memberTags } from './member_tags';
import { profileLinks } from './profile_links';
import { entitlements } from './entitlements';
import { moderationActions } from './moderation_actions';

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  slugs: many(profileSlugs),
  membershipPeriods: many(membershipPeriods),
  memberRoles: many(memberRoles),
  memberTags: many(memberTags),
  entitlements: many(entitlements),
  moderationActions: many(moderationActions),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  links: many(profileLinks),
}));

export const profileSlugsRelations = relations(profileSlugs, ({ one }) => ({
  user: one(users, {
    fields: [profileSlugs.userId],
    references: [users.id],
  }),
}));

export const membershipPeriodsRelations = relations(membershipPeriods, ({ one }) => ({
  user: one(users, {
    fields: [membershipPeriods.userId],
    references: [users.id],
  }),
}));

export const communityRolesRelations = relations(communityRoles, ({ many }) => ({
  memberRoles: many(memberRoles),
}));

export const memberRolesRelations = relations(memberRoles, ({ one }) => ({
  user: one(users, {
    fields: [memberRoles.userId],
    references: [users.id],
  }),
  role: one(communityRoles, {
    fields: [memberRoles.roleId],
    references: [communityRoles.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  memberTags: many(memberTags),
}));

export const memberTagsRelations = relations(memberTags, ({ one }) => ({
  user: one(users, {
    fields: [memberTags.userId],
    references: [users.id],
  }),
  tag: one(tags, {
    fields: [memberTags.tagId],
    references: [tags.id],
  }),
}));

export const profileLinksRelations = relations(profileLinks, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileLinks.profileId],
    references: [profiles.id],
  }),
}));

export const entitlementsRelations = relations(entitlements, ({ one }) => ({
  user: one(users, {
    fields: [entitlements.userId],
    references: [users.id],
  }),
}));

export const moderationActionsRelations = relations(moderationActions, ({ one }) => ({
  targetUser: one(users, {
    fields: [moderationActions.targetUserId],
    references: [users.id],
  }),
}));
