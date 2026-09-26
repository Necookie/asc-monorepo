'use server';

import * as service from './admin-service';
export type { AdminActionResponse } from './admin-service';

// Role verification and database access cannot be supplied by a browser request.
export async function adminModerateProfileAction(input: Parameters<typeof service.adminModerateProfileAction>[0]) {
  return service.adminModerateProfileAction(input);
}

export async function adminManageTagAction(input: Parameters<typeof service.adminManageTagAction>[0]) {
  return service.adminManageTagAction(input);
}

export async function adminUpdateSiteSettingsAction(input: Parameters<typeof service.adminUpdateSiteSettingsAction>[0]) {
  return service.adminUpdateSiteSettingsAction(input);
}
