import Link from 'next/link';
import { getCommunityOverview } from '@/lib/queries/community';

export const dynamic = 'force-dynamic';
import { Button } from '@/components/ui/button';
import { MemberCard } from '@/components/identity/member-card';
import {
  Users,
  Sparkles,
  ShieldCheck,
  Palette,
  ArrowRight,
  Heart,
  Globe,
} from 'lucide-react';

export default async function HomePage() {
  const overview = await getCommunityOverview();

  return (
    <div className="relative overflow-hidden space-y-24 sm:space-y-32 pb-24">
      {/* 1. Atmospheric Hero Section */}
      <section className="relative pt-20 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(88,101,242,0.15)] border border-[rgba(88,101,242,0.3)] text-[#c7c9e5] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-[#ec48bd]" />
            <span>Community-First Digital Identity</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white font-[var(--font-display)] uppercase leading-[1.02]">
            YOUR COMMUNITY. <br />
            <span className="bg-gradient-to-r from-[#5865f2] via-[#ec48bd] to-[#35ed7e] bg-clip-text text-transparent">
              YOUR PROFILE.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#c7c9e5] max-w-2xl mx-auto leading-relaxed">
            ASC automatically bridges your community presence into an expressive, verified digital identity. Express who you are, discover fellow members, and celebrate community tenure.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/members">
              <Button variant="primary" size="lg" className="gap-2.5">
                <Users className="w-5 h-5" />
                Explore Members
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="gap-2">
                Customize Profile
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Real Community Statistics */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 rounded-3xl bg-[#1e2353]/60 border border-[rgba(88,101,242,0.2)] backdrop-blur-md text-center">
          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-black text-white font-[var(--font-display)]">
              {overview.totalMembers}
            </div>
            <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#9498bd]">
              Community Members
            </div>
          </div>
          <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-[rgba(88,101,242,0.2)] py-4 sm:py-0">
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-[#5865f2] to-[#ec48bd] bg-clip-text text-transparent font-[var(--font-display)]">
              {overview.totalSupporters}
            </div>
            <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#9498bd]">
              Supporters & Boosters
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-black text-[#35ed7e] font-[var(--font-display)]">
              100%
            </div>
            <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#9498bd]">
              Synchronized Identity
            </div>
          </div>
        </div>
      </section>

      {/* 3. Community Showcase Grid */}
      {overview.recentMembers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[rgba(88,101,242,0.15)] pb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-[var(--font-display)]">
                MEET THE COMMUNITY
              </h2>
              <p className="text-sm text-[#c7c9e5] mt-1">
                Recent profiles synchronized from the community.
              </p>
            </div>
            <Link href="/members">
              <Button variant="ghost" size="sm" className="gap-2">
                View All {overview.totalMembers} Members →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {overview.recentMembers.map((member) => (
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

      {/* 4. Core Product Feature Bands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-[var(--font-display)]">
            BUILT FOR COMMUNITY IDENTITY
          </h2>
          <p className="text-sm sm:text-base text-[#c7c9e5]">
            No manual registration needed. If you are in the community, you already have a profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-[#1e2353]/70 border border-[rgba(88,101,242,0.2)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(88,101,242,0.18)] flex items-center justify-center text-[#5865f2]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-[var(--font-display)]">
              Synchronized Identity
            </h3>
            <p className="text-sm text-[#c7c9e5] leading-relaxed">
              Your avatar, username, roles, and supporter tier are authoritatively synchronized in real-time from the community.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-[#1e2353]/70 border border-[rgba(88,101,242,0.2)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(236,72,189,0.18)] flex items-center justify-center text-[#ec48bd]">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-[var(--font-display)]">
              Expressive Customization
            </h3>
            <p className="text-sm text-[#c7c9e5] leading-relaxed">
              Authenticate via OAuth to claim your profile. Personalize your biography, curate tags, add links, and select accents.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-[#1e2353]/70 border border-[rgba(88,101,242,0.2)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(53,237,126,0.18)] flex items-center justify-center text-[#35ed7e]">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-[var(--font-display)]">
              Dynamic Routing & Slugs
            </h3>
            <p className="text-sm text-[#c7c9e5] leading-relaxed">
              Every member receives a clean vanity URL like asc.necookie.dev/necookie with automatic 308 alias redirects on username changes.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Supporter CTA Band */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#1e2353] via-[#292f68] to-[#1e2353] border border-[rgba(236,72,189,0.3)] asc-glow-supporter text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5865f2] to-[#ec48bd] flex items-center justify-center text-white mx-auto shadow-lg">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-[var(--font-display)] uppercase">
              SUPPORT THE COMMUNITY
            </h3>
            <p className="text-sm text-[#c7c9e5] leading-relaxed">
              Boosters and community supporters unlock custom profile titles, custom background imagery, expanded tags, and verified supporter badges.
            </p>
          </div>
          <div>
            <Link href="/dashboard">
              <Button variant="green" size="lg" className="shadow-lg">
                Claim Your Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
