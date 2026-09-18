import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Users, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Supporter/Community Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(88,101,242,0.15)] border border-[rgba(88,101,242,0.3)] text-[#c7c9e5] text-xs font-semibold uppercase tracking-wider mb-8">
          <Sparkles className="w-3.5 h-3.5 text-[#5865f2]" />
          <span>ASC Digital Identity</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white font-[var(--font-display)] max-w-4xl mx-auto uppercase leading-[1.05]">
          YOUR COMMUNITY. <br />
          <span className="bg-gradient-to-r from-[#5865f2] via-[#ec48bd] to-[#35ed7e] bg-clip-text text-transparent">
            YOUR PROFILE.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#c7c9e5] max-w-2xl mx-auto leading-relaxed">
          ASC automatically connects your community presence to a customized, expressive digital identity. Discover members, showcase achievements, and make your mark.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/members">
            <Button variant="primary" size="lg" className="gap-2">
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
    </div>
  );
}
