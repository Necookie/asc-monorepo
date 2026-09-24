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
}

export function MemberCard({
  slug,
  avatar,
  displayName,
  username,
  isSupporter = false,
  tags = [],
  primaryRole,
  className,
  ...props
}: MemberCardProps) {
  return (
    <Link
      href={`/${slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
    >
      <div
        className={cn(
          'relative flex h-full flex-col items-center rounded-xl border border-border bg-surface-indigo p-6 text-center transition-colors duration-200',
          'group-hover:bg-surface-elevated group-hover:border-border-strong',
          className
        )}
        {...props}
      >
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
            size={64}
            className="border-2 border-border-strong"
          />
        </div>

        {/* Names */}
        <div className="space-y-0.5 w-full">
          <h3 className="font-semibold text-lg text-ink truncate px-2 font-[var(--font-display)]">
            {displayName}
          </h3>
          <p className="text-sm font-medium text-primary-soft truncate px-2">
            @{username}
          </p>
        </div>

        {/* Primary Role (if any) */}
        {primaryRole && (
          <div className="mt-3">
            <RoleChip name={primaryRole.name} color={primaryRole.color} />
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5 overflow-hidden max-h-14">
            {tags.slice(0, 3).map((tag) => (
              <TagChip key={tag.id} name={tag.name} />
            ))}
            {tags.length > 3 && (
              <span className="text-[11px] font-semibold text-muted self-center">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
