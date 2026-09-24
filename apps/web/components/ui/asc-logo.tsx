import * as React from 'react';
import Link from 'next/link';

export interface AscMarkProps {
  size?: number;
  className?: string;
}

export function AscMark({ size = 36, className = '' }: AscMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={`shrink-0 text-ink ${className}`}
      aria-hidden="true"
    >
      <path
        d="M9.5 52 28.5 13.5c1.4-2.9 5.6-2.9 7 0L54.5 52"
        stroke="currentColor"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 40.5c7.5-4.4 17.5-4.4 25 0"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle cx="19.5" cy="40.5" r="3.6" fill="currentColor" />
      <circle cx="44.5" cy="40.5" r="3.6" fill="currentColor" />
    </svg>
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
