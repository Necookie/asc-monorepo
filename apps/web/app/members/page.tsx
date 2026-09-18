import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { getMembersDirectory } from '@/lib/queries/members';
import { MemberCard } from '@/components/identity/member-card';
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
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(88,101,242,0.15)] border border-[rgba(88,101,242,0.3)] text-[#c7c9e5] text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5 text-[#5865f2]" />
          <span>ASC Directory</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-[var(--font-display)] uppercase">
          COMMUNITY MEMBERS
        </h1>
        <p className="text-sm sm:text-base text-[#c7c9e5]">
          Explore verified profiles of members in the ASC digital community.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto w-full">
        {/* Search Form */}
        <form method="GET" action="/members" className="relative w-full sm:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9498bd]" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by username, display name, or tag..."
            className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-[#1e2353]/80 border border-[rgba(88,101,242,0.25)] text-white placeholder-[#9498bd] focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all"
          />
          {filter && <input type="hidden" name="filter" value={filter} />}
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/members?filter=all${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              !isSupportersOnly
                ? 'bg-[#5865f2] text-white shadow-sm'
                : 'bg-[#1e2353] text-[#c7c9e5] hover:text-white border border-[rgba(88,101,242,0.2)]'
            }`}
          >
            All Members
          </Link>
          <Link
            href={`/members?filter=supporters${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={`px-4 py-2 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-all ${
              isSupportersOnly
                ? 'bg-gradient-to-r from-[#5865f2] to-[#ec48bd] text-white shadow-sm'
                : 'bg-[#1e2353] text-[#c7c9e5] hover:text-white border border-[rgba(88,101,242,0.2)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Supporters
          </Link>
        </div>
      </div>

      {/* Members Grid */}
      {members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              slug={member.slug}
              avatar={member.avatar}
              displayName={member.displayName}
              username={member.username}
              isSupporter={member.isSupporter}
              primaryRole={member.primaryRole}
              tags={member.tags}
            />
          ))}
        </div>
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
