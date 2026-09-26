'use server';
import { setMemberPerks } from './perks-service';
import type { AdminPerksInput } from '@asc/validation';

export async function setMemberPerksAction(input: AdminPerksInput) { return setMemberPerks(input); }
