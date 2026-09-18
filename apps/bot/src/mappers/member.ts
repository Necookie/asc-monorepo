import { GuildMember, User, Role, PermissionFlagsBits } from 'discord.js';

export interface SyncMemberData {
  externalUserId: string;
  username: string;
  displayName: string;
  nickname: string | null;
  avatar: string | null;
  roles: string[]; // external Discord role IDs
  joinedAt: Date;
  isBot: boolean;
}

export interface SyncUserData {
  externalUserId: string;
  username: string;
  displayName: string;
  avatar: string | null;
}

export function mapGuildMemberToSyncData(member: GuildMember): SyncMemberData {
  const user = member.user;
  // Use guild-specific avatar if present, fallback to global user avatar
  const avatar = member.avatarURL({ size: 512 }) || user.displayAvatarURL({ size: 512 });

  // Filter out the @everyone role which matches guild.id
  const roles = member.roles.cache
    .filter((role) => role.id !== member.guild.id)
    .map((role) => role.id);

  return {
    externalUserId: member.id,
    username: user.username,
    displayName: user.globalName || user.username,
    nickname: member.nickname,
    avatar,
    roles,
    joinedAt: member.joinedAt || new Date(),
    isBot: user.bot,
  };
}

export function mapUserToSyncData(user: User): SyncUserData {
  return {
    externalUserId: user.id,
    username: user.username,
    displayName: user.globalName || user.username,
    avatar: user.displayAvatarURL({ size: 512 }),
  };
}
