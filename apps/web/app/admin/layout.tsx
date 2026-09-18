import * as React from 'react';
import Link from 'next/link';
import { requireAdminMember } from '@/lib/auth/session';
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
  const admin = await requireAdminMember();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#070926] text-white">
      {/* Top Admin Header Bar */}
      <div className="border-b border-[rgba(236,72,189,0.2)] bg-[#0b0e36]/90 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#ec48bd]/15 text-[#ec48bd] border border-[#ec48bd]/30">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <span className="font-extrabold text-sm tracking-wider uppercase text-white font-[var(--font-display)]">
                ASC Administration
              </span>
            </div>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/admin/members"
                className="px-3 py-1.5 rounded-lg text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors"
              >
                Members
              </Link>
              <Link
                href="/admin/profiles"
                className="px-3 py-1.5 rounded-lg text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors"
              >
                Moderation
              </Link>
              <Link
                href="/admin/tags"
                className="px-3 py-1.5 rounded-lg text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors"
              >
                Tags
              </Link>
              <Link
                href="/admin/settings"
                className="px-3 py-1.5 rounded-lg text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors"
              >
                Settings
              </Link>
              <Link
                href="/admin/audit"
                className="px-3 py-1.5 rounded-lg text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors"
              >
                Audit Log
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-[#8b92d6] hidden sm:block">
              Logged in as <span className="text-white font-bold">@{admin.user.username}</span>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-[#8b92d6]">
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
