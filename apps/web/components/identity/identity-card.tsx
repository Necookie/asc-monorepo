import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { RoleChip } from './role-chip';
import { SupporterBadge } from './supporter-badge';
import { Calendar, ShieldCheck, UserX } from 'lucide-react';

export interface IdentityCardRole {
  id: string;
  name: string;
  color?: string | null;
  isAdmin?: boolean;
}

export interface IdentityCardProps extends React.HTMLAttributes<HTMLDivElement> {
  avatar?: string | null;
  displayName: string;
  username: string;
  nickname?: string | null;
  roles?: IdentityCardRole[];
  isSupporter?: boolean;
  joinedAt?: Date | string | null;
  membershipStatus?: 'ACTIVE' | 'LEFT' | 'BANNED';
  accentColor?: string;
  showRoles?: boolean;
  showMembershipDate?: boolean;
}

export function IdentityCard({
  avatar,
  displayName,
  username,
  nickname,
  roles = [],
  isSupporter = false,
  joinedAt,
  membershipStatus = 'ACTIVE',
  accentColor = '#5865f2',
  showRoles = true,
  showMembershipDate = true,
  className,
  ...props
}: IdentityCardProps) {
  const isFormerMember = membershipStatus === 'LEFT';
  const formattedDate = joinedAt
    ? new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(
        new Date(joinedAt)
      )
    : null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-[#1e2353]/95 backdrop-blur-xl border border-[rgba(88,101,242,0.25)] shadow-xl transition-all duration-300',
        className
      )}
      {...props}
    >
      {/* Top Identity Banner */}
      <div
        className="h-28 w-full relative transition-all"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, #1e2353 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        {/* Synced with ASC Tag */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-full bg-[#0a0d3a]/80 text-[#c7c9e5] border border-[rgba(88,101,242,0.3)] backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5865f2]" />
            Synced with ASC
          </span>
        </div>
      </div>

      {/* Avatar Container with Overlap */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex justify-between items-end -mt-14 mb-4">
          <Avatar
            src={avatar}
            alt={displayName}
            size={96}
            className="border-4 border-[#1e2353] shadow-lg"
          />
          {isSupporter && <SupporterBadge className="mb-2" />}
          {isFormerMember && (
            <span className="mb-2 inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-[#23272a] text-[#9498bd] border border-[#9498bd]/30">
              <UserX className="w-3.5 h-3.5" />
              Former Member
            </span>
          )}
        </div>

        {/* Names & Handle */}
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight font-[var(--font-display)] flex items-center gap-2">
            <span>{displayName}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#c7c9e5]">
            <span className="font-semibold text-[#5865f2]">@{username}</span>
            {nickname && nickname !== displayName && (
              <span className="text-[#9498bd]">({nickname})</span>
            )}
          </div>
        </div>

        {/* Roles Section */}
        {showRoles && roles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[rgba(88,101,242,0.15)]">
            <div className="flex flex-wrap gap-1.5">
              {roles.map((role) => (
                <RoleChip
                  key={role.id}
                  name={role.name}
                  color={role.color}
                  isAdmin={role.isAdmin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Membership Tenure */}
        {showMembershipDate && formattedDate && (
          <div className="mt-4 pt-3 border-t border-[rgba(88,101,242,0.12)] flex items-center gap-2 text-xs font-medium text-[#9498bd]">
            <Calendar className="w-3.5 h-3.5 text-[#5865f2]" />
            <span>Member since {formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
