import * as React from 'react';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import { requireAuthenticatedMember } from '@/lib/auth/session';
import { Avatar } from '@/components/ui/avatar';
import { RoleChip } from '@/components/identity/role-chip';
import { SupporterBadge } from '@/components/identity/supporter-badge';
import {
  User,
  Palette,
  Tag as TagIcon,
  Link as LinkIcon,
  Shield,
  ExternalLink,
  ShieldAlert,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireAuthenticatedMember();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#0a0d3a]">
      {/* Desktop Sidebar (lg+) */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-[rgba(88,101,242,0.15)] bg-[#0e1245]/80 backdrop-blur-md p-6 justify-between shrink-0">
        <div className="space-y-6">
          {/* Member Card in Sidebar */}
          <div className="p-4 rounded-2xl bg-[#141943] border border-[rgba(88,101,242,0.2)] space-y-3">
            <div className="flex items-center gap-3">
              <Avatar
                src={member.user.avatar}
                alt={member.user.displayName}
                size={40}
                fallbackText={member.user.displayName.slice(0, 2).toUpperCase()}
              />
              <div className="truncate">
                <div className="text-sm font-bold text-white truncate">
                  {member.user.displayName}
                </div>
                <div className="text-xs text-[#8b92d6] truncate">
                  @{member.user.username}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 items-center pt-1 border-t border-[rgba(88,101,242,0.15)]">
              {member.isSupporter && <SupporterBadge />}
              {member.roles.slice(0, 2).map((role) => (
                <RoleChip
                  key={role.id}
                  name={role.name}
                  color={role.color}
                  isAdmin={role.isAdmin}
                />
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-semibold">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors"
            >
              <User className="w-4 h-4 text-[#5865f2]" />
              Bio & Custom Title
            </Link>
            <Link
              href="/dashboard/appearance"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors"
            >
              <Palette className="w-4 h-4 text-[#ec48bd]" />
              Theme & Appearance
            </Link>
            <Link
              href="/dashboard/tags"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors"
            >
              <TagIcon className="w-4 h-4 text-[#35ed7e]" />
              Community Tags
            </Link>
            <Link
              href="/dashboard/links"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors"
            >
              <LinkIcon className="w-4 h-4 text-[#06b6d4]" />
              Outbound Links
            </Link>
            <Link
              href="/dashboard/privacy"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors"
            >
              <Shield className="w-4 h-4 text-[#f59e0b]" />
              Privacy Controls
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-2 pt-6 border-t border-[rgba(88,101,242,0.15)] text-xs font-semibold">
          {member.isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#ff8f91] hover:bg-[#ed4245]/15 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              Administration Portal
            </Link>
          )}

          {member.primarySlug && (
            <Link
              href={`/${member.primarySlug}`}
              target="_blank"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#8b92d6] hover:text-white hover:bg-[#1e2353]/60 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Profile
            </Link>
          )}

          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#8b92d6] hover:text-white hover:bg-[#1e2353]/60 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Mobile Sub-Header & Navigation Tabs (lg:hidden) */}
      <div className="lg:hidden border-b border-[rgba(88,101,242,0.15)] bg-[#0e1245]/90 backdrop-blur-md sticky top-16 z-30 px-4 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 truncate">
            <Avatar
              src={member.user.avatar}
              alt={member.user.displayName}
              size={32}
              fallbackText={member.user.displayName.slice(0, 2).toUpperCase()}
            />
            <span className="text-xs font-bold text-white truncate">
              {member.user.displayName}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {member.primarySlug && (
              <Link
                href={`/${member.primarySlug}`}
                target="_blank"
                className="text-[11px] font-semibold text-[#8b92d6] hover:text-white px-2 py-1 rounded-md bg-[#141943] border border-[rgba(88,101,242,0.2)]"
              >
                Profile
              </Link>
            )}
            {member.isAdmin && (
              <Link
                href="/admin"
                className="text-[11px] font-semibold text-[#ec48bd] px-2 py-1 rounded-md bg-[#ec48bd]/10 border border-[#ec48bd]/25"
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        <nav className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto scrollbar-none py-1">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors shrink-0"
          >
            Bio
          </Link>
          <Link
            href="/dashboard/appearance"
            className="px-3 py-1.5 rounded-lg text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors shrink-0"
          >
            Appearance
          </Link>
          <Link
            href="/dashboard/tags"
            className="px-3 py-1.5 rounded-lg text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors shrink-0"
          >
            Tags
          </Link>
          <Link
            href="/dashboard/links"
            className="px-3 py-1.5 rounded-lg text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors shrink-0"
          >
            Links
          </Link>
          <Link
            href="/dashboard/privacy"
            className="px-3 py-1.5 rounded-lg text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/80 transition-colors shrink-0"
          >
            Privacy
          </Link>
        </nav>
      </div>

      {/* Main Page Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
