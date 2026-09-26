import * as React from 'react';
import Link from 'next/link';
import { AscSymbol } from './asc-symbol';

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
  className?: string;
}

export function AscLogo({ size = 'md', href, showText = true, className = '' }: AscLogoProps) {
  const sizes = {
    sm: { mark: 26, text: 'text-xl' },
    md: { mark: 34, text: 'text-2xl' },
    lg: { mark: 46, text: 'text-3xl' },
  };
  const { mark, text } = sizes[size];

  const content = (
    <span className={`inline-flex select-none items-center gap-2.5 ${className}`}>
      <AscMark size={mark} />
      {showText ? (
        <span className={`font-[var(--font-display)] font-extrabold text-ink ${text}`}>ASC</span>
      ) : (
        <span className="sr-only">ASC</span>
      )}
    </span>
  );

  return href ? (
    <Link href={href} aria-label="ASC home" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      {content}
    </Link>
  ) : content;
}
