import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { getMembersDirectory } from '@/lib/queries/members';
import { MemberWall } from '@/components/identity/member-wall';
import { EmptyState } from '@/components/ui/states';
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
  const isSupportersOnly = filter === 'supporters';

  const members = await getMembersDirectory({
    search: q,
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
      <div className="flex w-full flex-col items-stretch justify-between gap-4 border-y border-border py-5 sm:flex-row sm:items-center">
        {/* Search Form */}
        <form method="GET" action="/members" className="relative w-full sm:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <label htmlFor="member-search" className="sr-only">Search members</label>
          <input
            id="member-search"
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by username, display name, or tag..."
            className="w-full pl-11 pr-4 py-3 text-base rounded-xl bg-surface-indigo border border-border text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {filter && <input type="hidden" name="filter" value={filter} />}
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/members?filter=all${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={`inline-flex min-h-11 items-center rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              !isSupportersOnly
                ? 'bg-primary text-ink-dark shadow-sm'
                : 'bg-surface-indigo text-ink-secondary hover:text-ink border border-border'
            }`}
          >
            All Members
          </Link>
          <Link
            href={`/members?filter=supporters${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              isSupportersOnly
                ? 'bg-[#ec48bd] text-ink shadow-sm'
                : 'bg-surface-indigo text-ink-secondary hover:text-ink border border-border'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Supporters
          </Link>
        </div>
      </div>

      {/* Members Wall */}
      {members.length > 0 ? (
        <MemberWall members={members} />
      ) : (
        <EmptyState
          title="No members found"
          description={
            q
              ? `No members found matching "${q}". Try another search term.`
              : 'No community members match the selected filter.'
          }
        />
      )}
    </div>
  );
}
