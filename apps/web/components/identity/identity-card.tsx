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
  avatarFrame?: 'none' | 'pixel' | 'neon' | 'crest';
  showRoles?: boolean;
  showMembershipDate?: boolean;
}

const MEMBERSHIP_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});

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
  avatarFrame = 'none',
  showRoles = true,
  showMembershipDate = true,
  className,
  ...props
}: IdentityCardProps) {
  const isFormerMember = membershipStatus === 'LEFT';
  const formattedDate = joinedAt
    ? MEMBERSHIP_DATE_FORMATTER.format(new Date(joinedAt))
    : null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-surface-indigo border border-border transition-colors duration-200',
        className
      )}
      {...props}
    >
      {/* Top Identity Banner */}
      <div
        className="h-28 w-full relative transition-all"
        style={{
          backgroundColor: accentColor,
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        {/* Synced with ASC Tag */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-canvas text-ink-secondary border border-border">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-soft" />
            Synced with ASC
          </span>
        </div>
      </div>

      {/* Avatar Container with Overlap */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex justify-between items-end -mt-14 mb-4">
          <span className="profile-avatar-frame" data-frame={avatarFrame}>
            <Avatar
            src={avatar}
            alt={displayName}
            size={96}
            className="border-4 border-surface-indigo"
            />
          </span>
          {isSupporter && <SupporterBadge className="mb-2" />}
          {isFormerMember && (
            <span className="mb-2 inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-[#23272a] text-muted border border-[#9498bd]/30">
              <UserX className="w-3.5 h-3.5" />
              Former Member
            </span>
          )}
        </div>

        {/* Names & Handle */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-ink tracking-tight font-[var(--font-display)] flex items-center gap-2">
            <span>{displayName}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-secondary">
            <span className="font-semibold text-primary-soft">@{username}</span>
            {nickname && nickname !== displayName && (
              <span className="text-muted">({nickname})</span>
            )}
          </div>
        </div>

        {/* Roles Section */}
        {showRoles && roles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
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
          <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs font-medium text-muted">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Member since {formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
