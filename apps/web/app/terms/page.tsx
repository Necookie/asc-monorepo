import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and acceptable use guidelines for members of the ASC platform.',
};

export default function TermsPage() {
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
          <Scale className="w-3.5 h-3.5 text-primary" />
          <span>Community Guidelines</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight font-[var(--font-display)]">
          Terms of Service
        </h1>
        <p className="text-base leading-7 text-ink-secondary">
          Last updated: October 2026. By accessing or using the ASC digital identity platform, you agree to these terms.
        </p>
      </div>

      {/* Terms Sections */}
      <div className="space-y-8">
        <section className="rounded-2xl border border-border bg-surface-onyx/60 p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-ink font-[var(--font-display)]">
            1. Membership & Platform Scope
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
            ASC is a community-first identity, directory, and profile customization platform for members of the After-School Club Discord community. Access to claim and customize an ASC profile is granted based on verified Discord server membership.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface-onyx/60 p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-ink font-[var(--font-display)]">
            2. Acceptable Use & Conduct
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
            Your customized profile represents you within our shared community. You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-ink-secondary pl-2">
            <li>Post biographies, custom titles, or social links containing harassment, hate speech, or sexually explicit material.</li>
            <li>Impersonate other members, community staff, or public entities.</li>
            <li>Provide links leading to malicious software, phishing websites, scam portals, or deceptive domains.</li>
            <li>Attempt to bypass rate limits, server authorization boundaries, or security controls.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-surface-onyx/60 p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-ink font-[var(--font-display)]">
            3. Entitlements & Recognition Perks
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
            Special customization features (including server booster perks, expanded link allowances, and arcade visual treatments) are granted dynamically based on server roles and administrative delegation. These perks remain active while corresponding roles or grants are maintained. If eligibility changes, saved custom styles are safely retained in your record until restored.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface-onyx/60 p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-ink font-[var(--font-display)]">
            4. Content Moderation & Auditing
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
            Community moderators and administrators retain the authority to moderate profile visibility or reset profile content that violates community standards. All administrative actions are recorded in immutable audit logs to ensure accountability and fair community governance.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface-onyx/60 p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-ink font-[var(--font-display)]">
            5. Disclaimers & Availability
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
            ASC is currently in public beta. Features and visual aesthetics may evolve. The service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
          </p>
        </section>
      </div>
    </div>
  );
}
