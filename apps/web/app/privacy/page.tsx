import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how ASC handles member identity, synchronized data, and profile privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="asc-anime-ink asc-anime-ink--compact space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-secondary hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="arcade-kicker inline-flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>ASC Trust & Safety</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight font-[var(--font-display)]">
          Privacy Policy
        </h1>
        <p className="text-base leading-7 text-ink-secondary">
          Last updated: October 2026. ASC is built around transparency, member autonomy, and server-side privacy enforcement.
        </p>
      </div>

      {/* Policy Sections */}
      <div className="space-y-8">
        <section className="rounded-2xl border border-border bg-surface-onyx/60 p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-ink font-[var(--font-display)]">
            1. Identity & Synchronization
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
            ASC does not require manual account registration. Profiles originate automatically from membership in our Discord community. The immutable Discord Snowflake ID serves as your canonical identity anchor. We synchronize your Discord username, display name, avatar, and server roles to provide an immediate digital presence.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface-onyx/60 p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-ink font-[var(--font-display)]">
            2. Authentication & Verification
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
            When you sign in to customize your profile, we authenticate your session through Clerk OAuth. Clerk links directly to your verified Discord account. We strictly verify that your authenticated provider ID matches your ASC member identity before allowing any profile modifications.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface-onyx/60 p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-ink font-[var(--font-display)]">
            3. Member Privacy Controls
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
            You maintain granular control over your profile visibility through the dashboard:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-ink-secondary pl-2">
            <li><strong className="text-ink">Directory Visibility:</strong> You can hide your profile from the public directory, member wall, and search queries.</li>
            <li><strong className="text-ink">Role Display:</strong> You may choose whether your community badges and booster status appear on your public page.</li>
            <li><strong className="text-ink">Interests & Tags:</strong> You control whether approved community interest tags are publicly displayed.</li>
            <li><strong className="text-ink">Server-Side Stripping:</strong> Hidden attributes are never delivered to browsers—they are completely stripped on the server before serialization.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-surface-onyx/60 p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-ink font-[var(--font-display)]">
            4. Departure & Data Retention
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
            If you leave the community Discord server, your status transitions to <code className="rounded bg-surface-indigo px-1.5 py-0.5 text-xs text-primary font-mono">LEFT</code>. Your customized profile, links, and history are preserved so that your identity is restored seamlessly if you ever rejoin. If you wish to permanently clear your customized biography or links, you may do so at any time in the profile editor.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface-onyx/60 p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-ink font-[var(--font-display)]">
            5. External Links & Media
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
            ASC does not host or store uploaded user media files. Background artwork and social links point to external URLs. All external links are strictly validated against malicious URI schemes (such as <code className="text-xs font-mono text-muted">javascript:</code> and <code className="text-xs font-mono text-muted">data:</code>) to protect visitor safety.
          </p>
        </section>
      </div>
    </div>
  );
}
