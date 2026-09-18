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
        'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full text-white shadow-xs select-none',
        'bg-gradient-to-r from-[#5865f2] via-[#a855f7] to-[#ec48bd]',
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3.5 py-1 text-xs',
        className
      )}
      {...props}
    >
      <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span>Supporter</span>
    </span>
  );
}
