import { Metadata } from 'next';
import Link from 'next/link';
import { requireModeratorMember } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getAdminOverview } from '@/lib/queries/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserCheck,
  UserX,
  Tag as TagIcon,
  ShieldAlert,
  FileText,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Overview',
  description: 'Community metrics, health status, and quick administrative actions.',
};

export default async function AdminOverviewPage() {
  const member = await requireModeratorMember();
  if (!member.isAdmin) redirect('/admin/profiles');
  const { stats, recentAudit } = await getAdminOverview();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-[var(--font-display)]">
            Community Administration
          </h1>
          <p className="text-sm text-muted mt-1">
            System overview, community membership statistics, and audit activity.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#35ed7e]/15 border border-[#35ed7e]/30 text-[#84f7b2] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#35ed7e] animate-pulse" />
          System Healthy & Synchronized
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface-onyx/80 border-border p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Total Members</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-ink font-[var(--font-display)]">
            {stats.totalMembers.toLocaleString()}
          </div>
          <div className="text-sm text-muted mt-1">
            {stats.activeMembers} active · {stats.leftMembers} left
          </div>
        </Card>

        <Card className="bg-surface-onyx/80 border-border p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Active Profiles</span>
            <UserCheck className="w-4 h-4 text-[#35ed7e]" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-ink font-[var(--font-display)]">
            {stats.activeMembers.toLocaleString()}
          </div>
          <div className="text-sm text-muted mt-1">
            Synchronized from Discord
          </div>
        </Card>

        <Card className="bg-surface-onyx/80 border-border p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Community Tags</span>
            <TagIcon className="w-4 h-4 text-[#ec48bd]" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-ink font-[var(--font-display)]">
            {stats.totalTags.toLocaleString()}
          </div>
          <div className="text-sm text-muted mt-1">
            Admin-curated skill badges
          </div>
        </Card>

        <Card className="bg-surface-onyx/80 border-border p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Audit Entries</span>
            <FileText className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-ink font-[var(--font-display)]">
            {stats.totalAuditLogs.toLocaleString()}
          </div>
          <div className="text-sm text-muted mt-1">
            {stats.totalModerationActions} moderation actions
          </div>
        </Card>
      </div>

      {/* Quick Action Bands */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/members" className="group">
          <Card className="bg-surface-indigo/60 border-border hover:border-primary p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink group-hover:text-primary transition-colors">
                Manage Members
              </span>
              <ArrowRight className="w-4 h-4 text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-muted mt-1">
              Inspect member status, roles, and snowflakes.
            </p>
          </Card>
        </Link>

        <Link href="/admin/profiles" className="group">
          <Card className="bg-surface-indigo/60 border-border hover:border-[#ec48bd] p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink group-hover:text-[#ec48bd] transition-colors">
                Profile Moderation
              </span>
              <ArrowRight className="w-4 h-4 text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-muted mt-1">
              One-click hide or reset unsafe user content.
            </p>
          </Card>
        </Link>

        <Link href="/admin/tags" className="group">
          <Card className="bg-surface-indigo/60 border-border hover:border-[#35ed7e] p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink group-hover:text-[#35ed7e] transition-colors">
                Tag Management
              </span>
              <ArrowRight className="w-4 h-4 text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-muted mt-1">
              Create, edit, or deactivate community tags.
            </p>
          </Card>
        </Link>

        <Link href="/admin/settings" className="group">
          <Card className="bg-surface-indigo/60 border-border hover:border-[#f59e0b] p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink group-hover:text-[#f59e0b] transition-colors">
                Site Settings
              </span>
              <ArrowRight className="w-4 h-4 text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-muted mt-1">
              Maintenance mode and announcement banner.
            </p>
          </Card>
        </Link>
      </div>

      {/* Recent Audit Log Activity */}
      <Card className="bg-surface-onyx/80 border-border p-6">
        <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-ink">Recent Audit Activity</CardTitle>
            <CardDescription className="text-xs text-muted">
              Tamper-evident logs of administrative actions and moderation events.
            </CardDescription>
          </div>
          <Link href="/admin/audit">
            <Button variant="outline" size="sm" className="text-xs text-muted">
              View All Logs
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <div className="space-y-2">
            {recentAudit.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-indigo border border-border text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded font-mono text-sm font-bold bg-primary/20 text-muted border border-primary/30">
                    {log.action}
                  </span>
                  <span className="text-ink font-medium">
                    Target: <span className="font-mono text-muted">{log.targetType}:{log.targetId.slice(0, 8)}...</span>
                  </span>
                </div>
                <div className="text-xs text-muted">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}

            {recentAudit.length === 0 && (
              <div className="p-8 text-center text-xs text-muted">
                No audit log entries recorded yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
