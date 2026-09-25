export type ThemeType = 'canvas' | 'indigo' | 'onyx';
export type ProfileLayout = 'classic' | 'split';
export type SupporterLayout = 'arcade' | 'showcase';
export type ProfileTypography = 'balanced' | 'bold' | 'playful';
export type AvatarFrame = 'none' | 'pixel' | 'neon' | 'crest';
export type CoverTreatment = 'solid' | 'artwork' | 'pattern';
export type ProfileMotion = 'off' | 'subtle' | 'lively';

export interface AppearanceSettings {
  theme: ThemeType;
  accentColor: string;
  backgroundUrl: string | null;
  layout: ProfileLayout;
  supporterLayout: SupporterLayout | null;
  typography: ProfileTypography;
  avatarFrame: AvatarFrame;
  coverTreatment: CoverTreatment;
  coverPosition: number;
  motion: ProfileMotion;
}

export interface Profile extends AppearanceSettings {
  id: string;
  userId: string;
  bio: string | null;
  customTitle: string | null;
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
