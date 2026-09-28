import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BetaBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md';
  variant?: 'subtle' | 'pill' | 'outline';
}

export function BetaBadge({
  size = 'xs',
  variant = 'subtle',
  className,
  ...props
}: BetaBadgeProps) {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] tracking-wider leading-none gap-1',
    sm: 'px-2 py-0.5 text-xs tracking-wider leading-tight gap-1.5',
    md: 'px-2.5 py-1 text-xs tracking-wider leading-tight gap-1.5',
  };

  const variantClasses = {
    subtle:
      'border border-border bg-surface-indigo/90 text-ink-secondary hover:text-ink hover:border-border-strong',
    pill:
      'border border-primary-soft/30 bg-primary/10 text-primary-soft',
    outline:
      'border border-border-strong bg-transparent text-ink-secondary',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold uppercase select-none transition-colors align-middle',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      title="ASC is currently in Public Beta"
      {...props}
    >
      <span
        className={cn(
          'rounded-full bg-primary-soft/80 shrink-0',
          size === 'xs' ? 'h-1.5 w-1.5' : 'h-2 w-2'
        )}
        aria-hidden="true"
      />
      <span>Beta</span>
    </span>
  );
}
