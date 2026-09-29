import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { getMembersDirectory } from '@/lib/queries/members';
import { MemberWall } from '@/components/identity/member-wall';
import { EmptyState } from '@/components/ui/states';
import { Button } from '@/components/ui/button';
import { Users, Search, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community Members',
  description: 'Discover and connect with members of the ASC community.',
};

interface MembersPageProps {
  searchParams: Promise<{
    q?: string;
    filter?: string;
  }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const { q = '', filter = 'all' } = await searchParams;
  const search = q.trim().slice(0, 100);
  const isSupportersOnly = filter === 'supporters';

  const members = await getMembersDirectory({
    search,
    filter: isSupportersOnly ? 'supporters' : 'all',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="asc-anime-ink asc-anime-ink--compact space-y-4 max-w-3xl">
        <div className="arcade-kicker inline-flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span>ASC Directory</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight font-[var(--font-display)]">
          Meet the club.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-ink-secondary">
          Every face has a story. Search the people, interests, and roles that make ASC feel alive.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex w-full flex-col items-stretch justify-between gap-5 border-y border-border py-5 lg:flex-row lg:items-end">
        {/* Search Form */}
        <form method="GET" action="/members" role="search" className="w-full space-y-2 lg:max-w-2xl lg:flex-1">
          <label htmlFor="member-search" className="block text-sm font-semibold text-ink">Find a member</label>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                id="member-search"
                type="search"
                name="q"
                maxLength={100}
                defaultValue={search}
                placeholder="Name, username, or interest"
                className="min-h-11 w-full rounded-xl border border-border bg-surface-indigo py-2.5 pl-11 pr-4 text-base text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button type="submit">Search</Button>
          </div>
          {isSupportersOnly && <input type="hidden" name="filter" value="supporters" />}
        </form>

        {/* Filter Pills */}
        <nav aria-label="Member filters" className="flex shrink-0 items-center gap-2">
          <Link
            href={`/members?filter=all${search ? `&q=${encodeURIComponent(search)}` : ''}`}
            aria-current={!isSupportersOnly ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              !isSupportersOnly
                ? 'bg-primary text-ink-dark shadow-sm'
                : 'bg-surface-indigo text-ink-secondary hover:text-ink border border-border'
            }`}
          >
            All Members
          </Link>
          <Link
            href={`/members?filter=supporters${search ? `&q=${encodeURIComponent(search)}` : ''}`}
            aria-current={isSupportersOnly ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              isSupportersOnly
                ? 'bg-[#ec48bd] text-[#111111] shadow-sm'
                : 'bg-surface-indigo text-ink-secondary hover:text-ink border border-border'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Supporters
          </Link>
        </nav>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-secondary" role="status">
        <p>Showing {members.length} {isSupportersOnly ? 'supporter' : 'member'}{members.length === 1 ? '' : 's'}{search ? ` matching “${search}”` : ''}.</p>
        {(search || isSupportersOnly) && <Link href="/members" className="font-semibold text-ink underline underline-offset-4 hover:no-underline">Reset results</Link>}
      </div>

      {/* Members Wall */}
      {members.length > 0 ? (
        <MemberWall members={members} />
      ) : (
        <EmptyState
          title="No members found"
          description={
            search
              ? `No members found matching "${search}". Try another search term.`
              : 'No community members match the selected filter.'
          }
        />
      )}
    </div>
  );
}
