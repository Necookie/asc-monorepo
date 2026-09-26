import * as React from 'react';
import type { Metadata } from 'next';
import { requireAdminMember } from '@/lib/auth/session';
import { getPerksMembers } from '@/lib/actions/perks-service';
import { MemberPerksPanel } from '@/components/admin/member-perks-panel';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Customization perks' };
export default async function AdminPerksPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  await requireAdminMember();
  const search = (await searchParams).search?.slice(0, 100) ?? '';
  const members = await getPerksMembers(search);
  return <div className="space-y-8"><header><h1 className="text-3xl font-extrabold text-ink font-[var(--font-display)]">Customization perks</h1><p className="mt-3 max-w-2xl text-ink-secondary">Give members extra room to personalize their profiles. Every grant and revocation is recorded.</p></header>
    <form method="get" className="flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-end"><div className="flex-1"><label htmlFor="perk-search" className="mb-2 block text-sm font-semibold text-ink">Find a member</label><input id="perk-search" type="search" name="search" defaultValue={search} maxLength={100} placeholder="Name, username, or Discord ID" className="min-h-11 w-full rounded-xl border border-border bg-canvas px-3 text-ink" /></div><Button type="submit">Search members</Button></form>
    <MemberPerksPanel key={search} members={members} />
  </div>;
}
