'use client';

import * as React from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';

const ASC_EASE = [0.16, 1, 0.3, 1] as const;

export function AscMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: 0.22, ease: ASC_EASE }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
