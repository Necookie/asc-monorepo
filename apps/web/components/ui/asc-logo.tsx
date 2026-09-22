import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface AscMarkProps {
  size?: number;
  className?: string;
  useImage?: boolean;
}

/**
 * AscMark - The iconic ASC connected-node "A" emblem.
 * Uses the official brand image with fallback / SVG option.
 */
export function AscMark({ size = 36, className = '', useImage = true }: AscMarkProps) {
  if (useImage) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src="/asc-mark.png"
          alt="ASC Mark"
          width={size}
          height={size}
          priority
          className="object-contain w-full h-full"
        />
      </div>
    );
  }

  // Vector SVG representation of the ASC connected-nodes emblem
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="ascGradient" x1="10" y1="20" x2="90" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00b0f4" />
          <stop offset="50%" stopColor="#5865f2" />
          <stop offset="100%" stopColor="#ec48bd" />
        </linearGradient>
        <filter id="ascGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#5865f2" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Main Arch 'A' */}
      <path
        d="M26 80 L50 20 L74 80"
        stroke="url(#ascGradient)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ascGlow)"
      />

      {/* Connected Nodes Bridge */}
      <path
        d="M26 72 Q 50 56 74 72"
        stroke="url(#ascGradient)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Three interconnected circular nodes */}
      <circle cx="26" cy="72" r="7" fill="#00b0f4" />
      <circle cx="50" cy="62" r="7.5" fill="#5865f2" />
      <circle cx="74" cy="72" r="7" fill="#ec48bd" />
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
  const pixelSizes = {
    sm: { mark: 28, text: 'text-xl' },
    md: { mark: 36, text: 'text-2xl' },
    lg: { mark: 48, text: 'text-3xl' },
  };

  const { mark, text } = pixelSizes[size];

  const content = (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      <AscMark size={mark} />
      {showText && (
        <span className={`font-semibold tracking-tight text-ink font-[var(--font-display)] ${text} transition-colors group-hover:text-ink-secondary`}>
          ASC
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865f2] rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}
