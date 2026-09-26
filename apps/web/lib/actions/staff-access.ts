'use server';

import { setStaffAccess } from './staff-access-service';
import type { StaffAccessInput } from '@asc/validation';

export async function setStaffAccessAction(input: StaffAccessInput) {
  return setStaffAccess(input);
}
