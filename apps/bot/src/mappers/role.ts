import { Role, PermissionFlagsBits } from 'discord.js';

export interface SyncRoleData {
  externalRoleId: string;
  name: string;
  color: string;
  position: number;
  isSupporter: boolean;
  isAdmin: boolean;
  isModerator: boolean;
}

export function mapDiscordRoleToSyncData(role: Role): SyncRoleData {
  const isSupporter =
    Boolean(role.tags?.premiumSubscriberRole) ||
    role.name.toLowerCase().includes('supporter') ||
    role.name.toLowerCase().includes('booster') ||
    role.name.toLowerCase().includes('patron');

  const isAdmin = role.permissions.has(PermissionFlagsBits.Administrator);

  const isModerator =
    isAdmin ||
    role.permissions.has(PermissionFlagsBits.ManageGuild) ||
    role.permissions.has(PermissionFlagsBits.ManageMessages) ||
    role.permissions.has(PermissionFlagsBits.ModerateMembers) ||
    role.permissions.has(PermissionFlagsBits.BanMembers) ||
    role.permissions.has(PermissionFlagsBits.KickMembers);

  return {
    externalRoleId: role.id,
    name: role.name,
    color: role.hexColor,
    position: role.position,
    isSupporter,
    isAdmin,
    isModerator,
  };
}
