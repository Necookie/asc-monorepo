'use server';

import * as service from './profile-service';
export type { ActionResponse } from './profile-service';

// Browser requests may provide draft data only. Identity always comes from Clerk.
export async function updateProfileBioAction(input: Parameters<typeof service.updateProfileBioAction>[0]) {
  return service.updateProfileBioAction(input);
}

export async function updateProfileAppearanceAction(input: Parameters<typeof service.updateProfileAppearanceAction>[0]) {
  return service.updateProfileAppearanceAction(input);
}

export async function updateProfileLinksAction(input: Parameters<typeof service.updateProfileLinksAction>[0]) {
  return service.updateProfileLinksAction(input);
}

export async function updateProfilePrivacyAction(input: Parameters<typeof service.updateProfilePrivacyAction>[0]) {
  return service.updateProfilePrivacyAction(input);
}

export async function updateMemberTagsAction(input: Parameters<typeof service.updateMemberTagsAction>[0]) {
  return service.updateMemberTagsAction(input);
}
