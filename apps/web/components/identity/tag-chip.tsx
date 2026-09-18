import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TagChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
}

export function TagChip({ name, className, ...props }: TagChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-[rgba(88,101,242,0.18)] text-white border border-[rgba(88,101,242,0.35)] shadow-xs select-none transition-colors hover:bg-[rgba(88,101,242,0.28)]',
        className
      )}
      {...props}
    >
      {name}
    </span>
  );
}
