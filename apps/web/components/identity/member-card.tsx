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
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865f2] rounded-2xl"
    >
      <div
        className={cn(
          'relative flex flex-col items-center text-center p-6 rounded-2xl bg-[#141843] border border-white/10 transition-all duration-300',
          'group-hover:-translate-y-1.5 group-hover:bg-[#1a2055] group-hover:border-[#5865f2]/50 group-hover:shadow-[0_12px_30px_-5px_rgba(0,0,0,0.5),0_0_20px_-5px_rgba(88,101,242,0.3)]',
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
        <div className="mb-4 transition-transform duration-300 group-hover:scale-105">
          <Avatar
            src={avatar}
            alt={displayName}
            size={64}
            className="border-2 border-[rgba(88,101,242,0.4)] shadow-md"
          />
        </div>

        {/* Names */}
        <div className="space-y-0.5 w-full">
          <h3 className="font-bold text-lg text-white truncate px-2 font-[var(--font-display)]">
            {displayName}
          </h3>
          <p className="text-xs font-semibold text-[#5865f2] truncate px-2">
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
              <span className="text-[11px] font-semibold text-[#9498bd] self-center">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
