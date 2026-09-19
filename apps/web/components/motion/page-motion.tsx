'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { m, useReducedMotion } from 'motion/react';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function PageMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isApplication = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  return (
    <m.div
      initial={reduceMotion ? false : { opacity: 0, y: isApplication ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: isApplication ? 0.18 : 0.38,
        ease: EASE_OUT_EXPO,
      }}
      className="min-h-full"
    >
      {children}
    </m.div>
  );
}
