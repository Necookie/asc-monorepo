import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { TagChip } from './tag-chip';
import { SupporterBadge } from './supporter-badge';
import { RoleChip } from './role-chip';

export interface MemberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  slug: string;
  avatar?: string | null;
  displayName: string;
  username: string;
  isSupporter?: boolean;
  tags?: { id: string; name: string }[];
  primaryRole?: { id: string; name: string; color?: string | null };
  featured?: boolean;
}

export function MemberCard({
  slug,
  avatar,
  displayName,
  username,
  isSupporter = false,
  tags = [],
  primaryRole,
  featured = false,
  className,
  ...props
}: MemberCardProps) {
  return (
    <Link
      href={`/${slug}`}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div
        className={cn(
          'member-ticket relative flex h-full flex-col items-start overflow-hidden rounded-2xl border border-border bg-surface-indigo p-5 text-left transition-[transform,background-color,border-color,box-shadow] duration-200 sm:p-6',
          'group-hover:bg-surface-elevated group-hover:border-border-strong',
          featured && 'member-ticket--featured',
          className
        )}
        {...props}
      >
        {featured && <span className="member-ticket__index" aria-hidden="true">01</span>}
        <span className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-muted" aria-hidden="true">ASC / Member</span>
        {/* Supporter Pin */}
        {isSupporter && (
          <div className="absolute top-4 right-4">
            <SupporterBadge size="sm" />
          </div>
        )}

        {/* Avatar */}
        <div className="mb-4">
          <Avatar
            src={avatar}
            alt={displayName}
            size={featured ? 96 : 64}
            className="border-2 border-border-strong"
          />
        </div>

        {/* Names */}
        <div className="w-full space-y-0.5">
          <h3 className={cn('truncate font-[var(--font-display)] font-bold text-ink', featured ? 'text-2xl' : 'text-lg')}>
            {displayName}
          </h3>
          <p className="truncate text-sm font-medium text-ink-secondary">
            @{username}
          </p>
        </div>

        {/* Primary Role (if any) */}
        {primaryRole && (
          <div className="mt-4">
            <RoleChip name={primaryRole.name} color={primaryRole.color} />
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-auto flex max-h-16 flex-wrap gap-1.5 overflow-hidden pt-5">
            {tags.slice(0, 3).map((tag) => (
              <TagChip key={tag.id} name={tag.name} />
            ))}
            {tags.length > 3 && (
              <span className="self-center text-sm font-semibold text-muted">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
