import Link from 'next/link';
import { getCommunityOverview } from '@/lib/queries/community';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { MemberCard } from '@/components/identity/member-card';
import { SupporterBadge } from '@/components/identity/supporter-badge';
import { ArrowRight, CheckCircle2, Search, ShieldCheck, UserRound } from 'lucide-react';

export const dynamic = 'force-dynamic';

const STEPS = [
  {
    number: '01',
    title: 'You join the community',
    body: 'ASC creates a profile from your verified Discord identity. There is no separate registration form.',
  },
  {
    number: '02',
    title: 'You claim what is already yours',
    body: 'Sign in with Discord to connect your session to the matching member record, roles, and tenure.',
  },
  {
    number: '03',
    title: 'You make it personal',
    body: 'Add a bio, interests, links, and profile styling without losing the identity the community recognizes.',
  },
] as const;

export default async function HomePage() {
  const overview = await getCommunityOverview();
  const featuredMembers = overview.recentMembers.slice(0, 4);

  return (
    <div className="pb-24 sm:pb-32">
      <section className="asc-anime-ink border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-12 lg:items-center lg:gap-16 lg:px-8 lg:py-28">
          <div className="lg:col-span-6">
            <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-primary-soft">
              <span className="h-px w-8 bg-primary-soft/60" aria-hidden="true" />
              Profiles for the people already here
            </div>

            <h1 className="max-w-3xl font-[var(--font-display)] text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-ink sm:text-6xl lg:text-7xl">
              Meet the people who make ASC feel like home.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink-secondary sm:text-xl">
              Every member already has a public profile. Claim yours, share what you care about, and find familiar faces beyond the chat.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/members">
                <Button variant="primary" size="lg" className="w-full gap-2 sm:w-auto">
                  Browse members
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Claim my profile
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex max-w-xl items-start gap-3 border-t border-border pt-6 text-sm leading-6 text-muted">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-soft" />
              <p>Discord identity, community roles, and membership history stay verified and read-only.</p>
            </div>
          </div>

          <div className="lg:col-span-6 lg:pl-6">
            <div className="border-y border-border">
              <div className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-[var(--font-display)] text-lg font-semibold text-ink">Recently active</p>
                  <p className="mt-0.5 text-sm text-muted">Real profiles from the ASC community</p>
                </div>
                <Link href="/members" className="text-sm font-semibold text-primary-soft hover:text-ink">
                  View all
                </Link>
              </div>

              {featuredMembers.length > 0 ? (
                <div className="divide-y divide-border border-t border-border">
                  {featuredMembers.map((member) => (
                    <Link
                      key={member.id}
                      href={`/${member.slug}`}
                      className="group flex min-h-20 items-center gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Avatar src={member.avatar} alt={member.displayName} size={48} className="border-border-strong" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-semibold text-ink group-hover:text-primary-soft">
                            {member.displayName}
                          </span>
                          {member.isSupporter && <SupporterBadge size="sm" />}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                          <span>@{member.username}</span>
                          {member.primaryRole && <span>{member.primaryRole.name}</span>}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary-soft" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="border-t border-border py-10 text-sm text-muted">
                  Member profiles will appear here as the community syncs.
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <span><strong className="font-semibold text-ink">{overview.totalMembers}</strong> members</span>
              <span><strong className="font-semibold text-ink">{overview.totalSupporters}</strong> supporters</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green" /> Synced from Discord</span>
            </div>
          </div>
        </div>
      </section>

      {overview.recentMembers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold text-primary-soft">The member wall</p>
              <h2 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
                Start with a familiar face.
              </h2>
            </div>
            <Link href="/members" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-ink">
              Search the directory
              <Search className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overview.recentMembers.slice(0, 8).map((member) => (
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
        </section>
      )}

      <section className="border-y border-border bg-surface-onyx">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-12 lg:gap-16 lg:px-8">
          <div className="lg:col-span-5">
            <UserRound className="mb-6 h-8 w-8 text-primary-soft" />
            <h2 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
              Your profile begins with membership, not a form.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink-secondary">
              ASC keeps community identity trustworthy while leaving room for the details only you can add.
            </p>
          </div>

          <ol className="divide-y divide-border border-y border-border lg:col-span-7">
            {STEPS.map((step) => (
              <li key={step.number} className="grid gap-3 py-7 sm:grid-cols-[3rem_1fr] sm:gap-5">
                <span className="font-[var(--font-display)] text-sm font-semibold text-primary-soft">{step.number}</span>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="flex flex-col gap-8 border-t border-magenta/40 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#ff9bda]">Supporter profiles</p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-semibold tracking-[-0.025em] text-ink">
              More room for the details that feel like you.
            </h2>
            <p className="mt-3 text-base leading-7 text-ink-secondary">
              Supporters can add custom titles and background artwork while the verified identity layer stays intact.
            </p>
          </div>
          <Link href="/dashboard" className="shrink-0">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Open my profile
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
