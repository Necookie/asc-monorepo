import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TagChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
}

export function TagChip({ name, className, ...props }: TagChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-surface-onyx text-ink-secondary border border-border select-none transition-colors hover:border-border-strong hover:text-ink',
        className
      )}
      {...props}
    >
      {name}
    </span>
  );
}
