export interface CommunityRole {
  id: string;
  externalRoleId: string; // Discord Role Snowflake
  name: string;
  color: string;
  position: number;
  isSupporter: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  createdAt: Date;
  updatedAt: Date;
}
