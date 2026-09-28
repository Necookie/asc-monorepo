import * as React from 'react';
import Link from 'next/link';
import { AscSymbol } from './asc-symbol';
import { BetaBadge } from './beta-badge';

export interface AscMarkProps {
  size?: number;
  className?: string;
}

export function AscMark({ size = 36, className = '' }: AscMarkProps) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 text-ink ${className}`}
      aria-hidden="true"
    >
      <AscSymbol />
    </span>
  );
}

export interface AscLogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  showText?: boolean;
  showBeta?: boolean;
  className?: string;
}

export function AscLogo({
  size = 'md',
  href,
  showText = true,
  showBeta = true,
  className = '',
}: AscLogoProps) {
  const sizes = {
    sm: { mark: 26, text: 'text-xl', betaSize: 'xs' as const },
    md: { mark: 34, text: 'text-2xl', betaSize: 'xs' as const },
    lg: { mark: 46, text: 'text-3xl', betaSize: 'sm' as const },
  };
  const { mark, text, betaSize } = sizes[size];

  const content = (
    <span className={`inline-flex select-none items-center gap-2 sm:gap-2.5 ${className}`}>
      <AscMark size={mark} />
      {showText ? (
        <span className={`font-[var(--font-display)] font-extrabold text-ink ${text}`}>ASC</span>
      ) : (
        <span className="sr-only">ASC</span>
      )}
      {showBeta && <BetaBadge size={betaSize} />}
    </span>
  );

  return href ? (
    <Link href={href} aria-label="ASC home" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      {content}
    </Link>
  ) : content;
}
