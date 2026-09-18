import { Metadata } from 'next';
import Link from 'next/link';
import { requireAdminMember } from '@/lib/auth/session';
import { getAdminMembers } from '@/lib/queries/admin';
import { Avatar } from '@/components/ui/avatar';
import { RoleChip } from '@/components/identity/role-chip';
import { SupporterBadge } from '@/components/identity/supporter-badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, Search, ExternalLink, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Member Management',
  description: 'Inspect community member status, snowflake identities, and role assignments.',
};

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdminMember();
  const { q } = await searchParams;
  const members = await getAdminMembers(q);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-[var(--font-display)]">
            Member Management
          </h1>
          <p className="text-sm text-[#8b92d6] mt-1">
            View canonical Discord Snowflake identities, active statuses, and assigned roles.
          </p>
        </div>

        {/* Search Input */}
        <form method="GET" className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8b92d6] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            name="q"
            defaultValue={q || ''}
            placeholder="Search by name, handle, or snowflake..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0e1245] border border-[rgba(88,101,242,0.25)] text-xs text-white placeholder:text-[#525996] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
          />
        </form>
      </div>

      {/* Members Table */}
      <Card className="bg-[#0e1245]/80 border-[rgba(88,101,242,0.2)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141943] text-[#8b92d6] uppercase tracking-wider text-[10px] border-b border-[rgba(88,101,242,0.15)]">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Discord Snowflake</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Roles</th>
                <th className="py-3 px-4">Tenure</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(88,101,242,0.1)]">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-[#141943]/50 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <Avatar
                      src={member.avatar}
                      alt={member.displayName}
                      size={32}
                      fallbackText={member.displayName.slice(0, 2).toUpperCase()}
                    />
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {member.displayName}
                        {member.roles.some((r) => r.isSupporter) && <SupporterBadge />}
                      </div>
                      <div className="text-[11px] text-[#8b92d6]">@{member.username}</div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-xs text-[#c7c9e5]">
                    {member.externalUserId}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        member.membershipStatus === 'ACTIVE'
                          ? 'bg-[#35ed7e]/15 text-[#84f7b2] border border-[#35ed7e]/30'
                          : member.membershipStatus === 'LEFT'
                          ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
                          : 'bg-[#ed4245]/15 text-[#ff8f91] border border-[#ed4245]/30'
                      }`}
                    >
                      {member.membershipStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {member.roles.slice(0, 3).map((r) => (
                        <RoleChip
                          key={r.id}
                          name={r.name}
                          color={r.color}
                          isAdmin={r.isAdmin}
                        />
                      ))}
                      {member.roles.length === 0 && (
                        <span className="text-[#525996] italic">No roles</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-[#8b92d6]">
                    {new Date(member.firstJoinedAt).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/${member.primarySlug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-[#5865f2] hover:text-[#7983f5] font-semibold"
                    >
                      View
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#8b92d6]">
                    No members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
