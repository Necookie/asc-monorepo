'use client';

import * as React from 'react';
import { m, useReducedMotion } from 'motion/react';

type MagneticProps = { children: React.ReactNode; className?: string; strength?: number };

export function Magnetic({ children, className = '', strength = 0.16 }: MagneticProps) {
  const reduceMotion = useReducedMotion();
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  return (
    <m.div
      className={className}
      animate={reduceMotion ? undefined : offset}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      onPointerMove={(event) => {
        if (reduceMotion || event.pointerType === 'touch') return;
        const rect = event.currentTarget.getBoundingClientRect();
        setOffset({
          x: (event.clientX - rect.left - rect.width / 2) * strength,
          y: (event.clientY - rect.top - rect.height / 2) * strength,
        });
      }}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {children}
    </m.div>
  );
}
