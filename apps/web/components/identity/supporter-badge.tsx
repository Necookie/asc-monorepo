import * as React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export interface SupporterBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md';
}

export function SupporterBadge({ size = 'md', className, ...props }: SupporterBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-[#ec48bd]/35 bg-[#ec48bd]/12 font-semibold text-[#ff9bda] select-none',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs',
        className
      )}
      {...props}
    >
      <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span>Supporter</span>
    </span>
  );
}
