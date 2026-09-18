import type { User } from './member';
import type { CommunityRole } from './roles';
import type { Profile } from './profile';

export interface AuthenticatedMember {
  user: User;
  profile: Profile;
  roles: CommunityRole[];
  isAdmin: boolean;
  isModerator: boolean;
  isSupporter: boolean;
  primarySlug: string | null;
}

export type IdentityResolutionResult =
  | { status: 'RESOLVED'; member: AuthenticatedMember }
  | { status: 'NOT_FOUND'; discordSnowflake: string; clerkUserId: string }
  | { status: 'UNLINKED_DISCORD'; clerkUserId: string };
