'use client';

import * as React from 'react';
import { useReducedMotion } from 'motion/react';

type SpotlightCardProps = React.HTMLAttributes<HTMLDivElement> & { spotlightColor?: string };

export function SpotlightCard({ children, className = '', spotlightColor = 'rgba(88, 101, 242, 0.18)', onPointerMove, style, ...props }: SpotlightCardProps) {
  const reduceMotion = useReducedMotion();
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
  };
  return (
    <div
      {...props}
      className={`spotlight-card ${className}`}
      style={{ ...style, '--spotlight-color': spotlightColor } as React.CSSProperties}
      onPointerMove={handlePointerMove}
    >
      {children}
    </div>
  );
}
