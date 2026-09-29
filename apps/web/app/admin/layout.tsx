import * as React from 'react';
import Link from 'next/link';
import { AppNavLink } from '@/components/layout/app-nav-link';
import { requireModeratorMember } from '@/lib/auth/session';
import {
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireModeratorMember();

  return (
    <div className="arcade-app-shell min-h-[calc(100vh-4rem)] bg-canvas text-ink">
      {/* Top Admin Header Bar */}
      <div className="border-b border-border bg-surface-onyx sticky top-16 z-40">
        <div className="max-w-7xl mx-auto flex flex-col gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex min-h-11 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#ec48bd]/15 text-[#ec48bd] border border-[#ec48bd]/30">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <span className="font-semibold text-sm text-ink">
                ASC Administration
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted sm:inline">
                Signed in as <strong className="text-ink">@{admin.user.username}</strong>
              </span>
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-border-strong px-3 text-sm font-semibold text-ink-secondary hover:bg-surface-indigo hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Dashboard
              </Link>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav aria-label="Administration sections" className="flex min-w-0 items-center gap-1 overflow-x-auto pb-1 text-sm font-semibold">
            {admin.isAdmin && <><AppNavLink
              href="/admin"
              className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0"
            >
              Overview
            </AppNavLink>
            <AppNavLink
              href="/admin/members"
              className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0"
            >
              Members
            </AppNavLink>
            </>}
            <AppNavLink
              href="/admin/profiles"
              className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0"
            >
              Moderation
            </AppNavLink>
            {admin.isAdmin && <><AppNavLink
              href="/admin/tags"
              className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0"
            >
              Tags
            </AppNavLink>
            <AppNavLink
              href="/admin/settings"
              className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0"
            >
              Settings
            </AppNavLink>
            <AppNavLink
              href="/admin/audit"
              className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0"
            >
              Audit Log
            </AppNavLink>
            <AppNavLink href="/admin/perks" className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0">Customization perks</AppNavLink>
            </>}
            {admin.isOwner && <AppNavLink href="/dashboard/permissions" className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0">Staff permissions</AppNavLink>}
          </nav>

        </div>
      </div>

      {/* Main Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}
