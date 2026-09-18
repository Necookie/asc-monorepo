import type { CommunityRole } from '@asc/types';

export function isAdminRole(role: CommunityRole): boolean {
  return role.isAdmin === true;
}

export function isModeratorRole(role: CommunityRole): boolean {
  return role.isModerator === true || role.isAdmin === true;
}

export function isSupporterRole(role: CommunityRole): boolean {
  return role.isSupporter === true;
}

export function hasAdminPermission(roles: CommunityRole[]): boolean {
  return roles.some((role) => isAdminRole(role));
}

export function hasModeratorPermission(roles: CommunityRole[]): boolean {
  return roles.some((role) => isModeratorRole(role));
}

export function hasSupporterStatus(roles: CommunityRole[]): boolean {
  return roles.some((role) => isSupporterRole(role));
}
