'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type AvatarSize = 24 | 32 | 40 | 48 | 64 | 96 | 128;

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  fallbackText?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  24: 'w-6 h-6 text-[10px]',
  32: 'w-8 h-8 text-xs',
  40: 'w-10 h-10 text-sm',
  48: 'w-12 h-12 text-base',
  64: 'w-16 h-16 text-xl',
  96: 'w-24 h-24 text-3xl',
  128: 'w-32 h-32 text-4xl',
};

export function Avatar({
  src,
  alt,
  size = 48,
  fallbackText,
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const fallback = (fallbackText || alt || '?').slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border-strong bg-surface-indigo select-none font-bold text-ink',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}
