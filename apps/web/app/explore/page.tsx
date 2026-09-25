import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { db, tags as tagsTable } from '@asc/db';
import { getMembersDirectory } from '@/lib/queries/members';
import { MemberWall } from '@/components/identity/member-wall';
import { TagChip } from '@/components/identity/tag-chip';
import { Compass, Sparkles, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explore Community',
  description: 'Explore community members, roles, and interests in ASC.',
};

export default async function ExplorePage() {
  const [members, allTags] = await Promise.all([
    getMembersDirectory({ limit: 8 }),
    db.query.tags.findMany({ limit: 20 }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="asc-anime-ink asc-anime-ink--compact max-w-3xl space-y-4">
        <div className="arcade-kicker inline-flex items-center gap-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Discover ASC</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight font-[var(--font-display)]">
          Follow your curiosity.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-ink-secondary">
          Start with an interest, then find the people behind it.
        </p>
      </div>

      {/* Popular Tags Section */}
      {allTags.length > 0 && (
        <div className="space-y-4 border-y border-border py-6">
          <div className="flex items-center gap-2 text-base font-bold text-ink font-[var(--font-display)]">
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

        <MemberWall members={members.slice(0, 8)} />
      </div>
    </div>
  );
}
