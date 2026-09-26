import * as React from 'react';
import type { Metadata } from 'next';
import { requireOwnerMember } from '@/lib/auth/session';
import { getStaffAccessMembers } from '@/lib/actions/staff-access-service';
import { StaffPermissionsPanel } from '@/components/admin/staff-permissions-panel';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Staff permissions' };

export default async function StaffPermissionsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  await requireOwnerMember();
  const search = (await searchParams).search?.slice(0, 100) ?? '';
  const members = await getStaffAccessMembers(search);
  return <div className="space-y-8">
    <header><p className="text-xs font-bold uppercase tracking-widest text-muted">Owner controls</p><h1 className="mt-2 text-3xl font-extrabold text-ink font-[var(--font-display)]">Staff permissions</h1><p className="mt-3 max-w-2xl text-ink-secondary">Choose who can help run ASC. Only owners verified through Clerk can grant or revoke website access.</p></header>
    <form method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1"><label htmlFor="staff-search" className="mb-2 block text-sm font-semibold text-ink">Find a member</label><input id="staff-search" name="search" type="search" defaultValue={search} maxLength={100} placeholder="Name, username, or Discord ID" className="min-h-11 w-full rounded-xl border border-border bg-canvas px-3 text-ink" /></div>
      <Button type="submit">Search members</Button>
    </form>
    <StaffPermissionsPanel key={search} members={members} />
  </div>;
}
