export type ThemeType = 'canvas' | 'indigo' | 'onyx';

export interface Profile {
  id: string;
  userId: string;
  bio: string | null;
  customTitle: string | null;
  accentColor: string;
  theme: ThemeType;
  backgroundUrl: string | null;
  isPrivate: boolean;
  showRoles: boolean;
  showMembershipDate: boolean;
  showTags: boolean;
  showLinks: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileSlug {
  id: string;
  userId: string;
  slug: string;
  isPrimary: boolean;
  createdAt: Date;
  releasedAt: Date | null;
}

export interface ProfileLink {
  id: string;
  profileId: string;
  label: string;
  url: string;
  displayOrder: number;
  createdAt: Date;
}
