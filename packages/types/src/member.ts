export type MembershipStatus = 'ACTIVE' | 'LEFT' | 'BANNED';

export interface User {
  id: string;
  externalUserId: string; // Immutable Discord snowflake
  clerkUserId: string | null;
  username: string;
  displayName: string;
  nickname: string | null;
  avatar: string | null;
  membershipStatus: MembershipStatus;
  firstJoinedAt: Date;
  leftAt: Date | null;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipPeriod {
  id: string;
  userId: string;
  joinedAt: Date;
  leftAt: Date | null;
}

export interface MemberRole {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  isActive: boolean;
  createdAt: Date;
}

export interface MemberTag {
  id: string;
  userId: string;
  tagId: string;
  assignedAt: Date;
}
