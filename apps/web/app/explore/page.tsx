import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { db, tags as tagsTable } from '@asc/db';
import { getMembersDirectory } from '@/lib/queries/members';
import { MemberCard } from '@/components/identity/member-card';
import { TagChip } from '@/components/identity/tag-chip';
import { Compass, Sparkles, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explore Community',
  description: 'Explore community members, roles, and interests in ASC.',
};

export default async function ExplorePage() {
  const [members, allTags] = await Promise.all([
    getMembersDirectory(),
    db.query.tags.findMany({ limit: 20 }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="asc-anime-ink asc-anime-ink--compact space-y-4 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(236,72,189,0.15)] border border-[rgba(236,72,189,0.3)] text-[#ec48bd] text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Discover ASC</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight font-[var(--font-display)] uppercase">
          EXPLORE COMMUNITY
        </h1>
        <p className="text-sm sm:text-base text-ink-secondary">
          Find members who share your passions, skills, and interests across ASC.
        </p>
      </div>

      {/* Popular Tags Section */}
      {allTags.length > 0 && (
        <div className="p-6 rounded-2xl bg-surface-indigo/80 border border-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-ink uppercase tracking-wider font-[var(--font-display)]">
            <Tag className="w-4 h-4 text-primary" />
            <span>Community Interests</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Link key={tag.id} href={`/members?q=${encodeURIComponent(tag.name)}`}>
                <TagChip name={tag.name} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Members Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2 font-bold text-xl text-ink font-[var(--font-display)]">
            <Sparkles className="w-5 h-5 text-[#ec48bd]" />
            <span>Community Profiles</span>
          </div>
          <Link
            href="/members"
            className="text-sm font-semibold text-primary-soft hover:text-ink transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.slice(0, 8).map((member) => (
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
      </div>
    </div>
  );
}
