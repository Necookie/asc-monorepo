import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RoleChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  name: string;
  color?: string | null;
  isAdmin?: boolean;
}

export function RoleChip({ name, color, isAdmin, className, ...props }: RoleChipProps) {
  const dotColor = color && color !== '#000000' ? color : '#5865f2';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-[#23272a] text-[#ffffff] border border-[rgba(255,255,255,0.08)] shadow-sm select-none',
        isAdmin && 'border-[rgba(236,72,189,0.4)]',
        className
      )}
      {...props}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
        aria-hidden="true"
      />
      <span className="truncate max-w-[140px]">{name}</span>
    </span>
  );
}
