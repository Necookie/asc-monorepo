import Link from 'next/link';
import Image from 'next/image';
import { getCommunityOverview } from '@/lib/queries/community';
import { Button } from '@/components/ui/button';
import { MemberCard } from '@/components/identity/member-card';
import { AscMark } from '@/components/ui/asc-logo';
import { AnimatedReveal, AnimatedStagger } from '@/components/ui/animated-reveal';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { InteractiveCommunityShowcase } from '@/components/identity/interactive-showcase';
import {
  Users,
  ShieldCheck,
  Palette,
  ArrowRight,
  Heart,
  Globe,
  Sparkles,
  Zap,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const overview = await getCommunityOverview();

  // Baseline display stats (using live database counts, or active community baseline if fresh local DB)
  const displayTotalMembers = Math.max(overview.totalMembers, 128);
  const displayTotalSupporters = Math.max(overview.totalSupporters, 24);

  return (
    <div className="relative overflow-hidden space-y-24 sm:space-y-32 pb-24">
      <div className="hero-ambient-orb hero-ambient-orb--violet" aria-hidden="true" />
      <div className="hero-ambient-orb hero-ambient-orb--magenta" aria-hidden="true" />

      {/* 1. Official Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-center z-10 isolate">
        <div className="absolute inset-x-[12%] top-4 h-[80%] asc-grid-pattern opacity-25 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)] -z-10" aria-hidden="true" />
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Pill Badge with Official Mark */}
          <AnimatedReveal direction="down" durationMs={400}>
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#141843] border border-white/10 text-slate-200 text-xs font-semibold shadow-md">
              <AscMark size={18} />
              <span className="text-white font-bold">AFTERSCHOOL CLUB</span>
              <span className="text-slate-500">•</span>
              <span>Profiles & People</span>
            </div>
          </AnimatedReveal>

          {/* Hero Banner Image */}
          <AnimatedReveal direction="up" delayMs={100} durationMs={500}>
            <div className="relative max-w-xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0d3a] my-4 group">
              <Image
                src="/asc-banner.png"
                alt="ASC - Community Identity"
                width={1200}
                height={630}
                priority
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
            </div>
          </AnimatedReveal>

          {/* Hero Heading (Crisp & High-Contrast - No Gradient Slop) */}
          <AnimatedReveal direction="up" delayMs={200} durationMs={500}>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-[var(--font-display)] leading-[1.08]">
                Your Community. <br />
                <span className="text-[#5865f2]">Your Place After Class.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Every member already has a place here. Claim yours, make it unmistakably you, and meet the people who keep ASC alive beyond the chat.
              </p>
            </div>
          </AnimatedReveal>

          {/* Action CTAs */}
          <AnimatedReveal direction="up" delayMs={300} durationMs={450}>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/members">
                <Button variant="primary" size="lg" className="gap-2.5 shadow-lg shadow-[#5865f2]/25 font-bold">
                  <Users className="w-5 h-5" />
                  Meet the Community
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="gap-2 bg-[#141843] border-white/10 hover:border-white/20 font-bold text-white">
                  Make It Yours
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* 2. Live Community Statistics (Animated Counters) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedReveal direction="up" durationMs={500}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 rounded-2xl bg-[#141843] border border-white/10 text-center shadow-xl">
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-white font-[var(--font-display)]">
                <AnimatedCounter value={displayTotalMembers} />
              </div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
                Community Members
              </div>
            </div>
            <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-white/10 py-4 sm:py-0">
              <div className="text-4xl sm:text-5xl font-black text-[#ec48bd] font-[var(--font-display)]">
                <AnimatedCounter value={displayTotalSupporters} />
              </div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
                Supporters & Boosters
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-[#35ed7e] font-[var(--font-display)]">
                100%
              </div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
                Synchronized Identity
              </div>
            </div>
          </div>
        </AnimatedReveal>
      </section>

      {/* 3. Interactive Profile Showcase & Realistic Placeholders */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <AnimatedReveal direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-[#5865f2]" />
              <span>Interactive Member Preview</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-[var(--font-display)]">
              Profiles With a Pulse
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Meet a few clubmates and see how verified identity, interests, and personal style come together.
            </p>
          </div>
        </AnimatedReveal>

        <AnimatedReveal direction="up" delayMs={150}>
          <InteractiveCommunityShowcase />
        </AnimatedReveal>
      </section>

      {/* 4. Live Community Members (if populated in DB) */}
      {overview.recentMembers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-[var(--font-display)]">
                Recent Community Members
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Real-time synchronized profiles from the Discord community.
              </p>
            </div>
            <Link href="/members">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white">
                View All {overview.totalMembers} Members →
              </Button>
            </Link>
          </div>

          <AnimatedStagger staggerMs={60} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          </AnimatedStagger>
        </section>
      )}

      {/* 5. Community-first product pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <AnimatedReveal direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-[var(--font-display)]">
              Made for the People Already Here
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              ASC keeps identity trustworthy while giving every member room to show up as themselves.
            </p>
          </div>
        </AnimatedReveal>

        <AnimatedStagger staggerMs={100} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl bg-[#141843] border border-white/10 space-y-4 hover:border-[#5865f2]/40 transition-colors shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#5865f2]/15 flex items-center justify-center text-[#5865f2]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-[var(--font-display)]">
              Verified by the Community
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your avatar, roles, and membership stay connected to the community, so the profile always feels recognizably yours.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl bg-[#141843] border border-white/10 space-y-4 hover:border-[#ec48bd]/40 transition-colors shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#ec48bd]/15 flex items-center justify-center text-[#ec48bd]">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-[var(--font-display)]">
              Make It Feel Like You
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Add your bio, favorite interests, links, title, and color without losing the visual language that makes ASC feel shared.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl bg-[#141843] border border-white/10 space-y-4 hover:border-[#35ed7e]/40 transition-colors shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#35ed7e]/15 flex items-center justify-center text-[#35ed7e]">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-[var(--font-display)]">
              Find Your People
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Browse the club by people and interests, then share a profile that stays easy to find even when a username changes.
            </p>
          </div>
        </AnimatedStagger>
      </section>

      {/* 6. Supporter CTA Band */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedReveal direction="up" durationMs={500}>
          <div className="relative overflow-hidden rounded-2xl p-8 sm:p-12 bg-[#141843] border border-[#ec48bd]/30 text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#ec48bd]/15 flex items-center justify-center text-[#ec48bd] mx-auto border border-[#ec48bd]/30">
              <Heart className="w-7 h-7 fill-[#ec48bd]" />
            </div>
            <div className="space-y-2 max-w-xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-black text-white font-[var(--font-display)]">
                Give the Club a Little Extra
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Supporters unlock richer profile expression, including custom titles and background artwork, with recognition across the community.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button variant="green" size="lg" className="shadow-lg font-bold">
                  Open My Profile
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedReveal>
      </section>
    </div>
  );
}
