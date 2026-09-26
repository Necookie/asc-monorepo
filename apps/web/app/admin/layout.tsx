import * as React from 'react';
import Link from 'next/link';
import { requireModeratorMember } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  Users,
  Tag as TagIcon,
  Settings,
  FileText,
  LayoutDashboard,
  Shield,
  Activity,
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
    <div className="arcade-app-shell min-h-[calc(100vh-4rem)] bg-surface-black text-ink">
      {/* Top Admin Header Bar */}
      <div className="border-b border-border bg-surface-onyx sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-2 py-2.5 md:h-14 md:py-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#ec48bd]/15 text-[#ec48bd] border border-[#ec48bd]/30">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <span className="font-semibold text-sm text-ink">
                ASC Administration
              </span>
            </div>
            <div className="md:hidden">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs text-muted">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Exit
                </Button>
              </Link>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 text-xs font-semibold overflow-x-auto scrollbar-none py-1">
            {admin.isAdmin && <><Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0"
            >
              Overview
            </Link>
            <Link
              href="/admin/members"
              className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0"
            >
              Members
            </Link>
            </>}
            <Link
              href="/admin/profiles"
              className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0"
            >
              Moderation
            </Link>
            {admin.isAdmin && <><Link
              href="/admin/tags"
              className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0"
            >
              Tags
            </Link>
            <Link
              href="/admin/settings"
              className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0"
            >
              Settings
            </Link>
            <Link
              href="/admin/audit"
              className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0"
            >
              Audit Log
            </Link>
            <Link href="/admin/perks" className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0">Customization perks</Link>
            </>}
            {admin.isOwner && <Link href="/dashboard/permissions" className="px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-indigo/80 transition-colors shrink-0">Staff permissions</Link>}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="text-xs text-muted">
              Logged in as <span className="text-ink font-bold">@{admin.user.username}</span>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-muted">
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
