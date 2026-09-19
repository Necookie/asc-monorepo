'use client';

import * as React from 'react';
import { m, useReducedMotion, type Variants } from 'motion/react';

export interface AnimatedRevealProps {
  children: React.ReactNode;
  key?: React.Key;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  durationMs?: number;
  className?: string;
  triggerOnce?: boolean;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const offsets = {
  up: { x: 0, y: 20 },
  down: { x: 0, y: -20 },
  left: { x: 20, y: 0 },
  right: { x: -20, y: 0 },
  none: { x: 0, y: 0 },
} as const;

/**
 * A single, shared reveal language for expressive ASC surfaces.
 * Motion remains interruptible and uses transforms plus opacity only.
 */
export function AnimatedReveal({
  children,
  delayMs = 0,
  direction = 'up',
  durationMs = 450,
  className = '',
  triggerOnce = true,
}: AnimatedRevealProps) {
  const reduceMotion = useReducedMotion();
  const offset = offsets[direction];

  return (
    <m.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: triggerOnce, amount: 'some', margin: '0px 0px 80px 0px' }}
      transition={{
        duration: reduceMotion ? 0.01 : durationMs / 1000,
        delay: reduceMotion ? 0 : delayMs / 1000,
        ease: EASE_OUT_EXPO,
      }}
    >
      {children}
    </m.div>
  );
}

/**
 * Reveals related items as a group so their sequence feels intentional.
 */
export function AnimatedStagger({
  children,
  staggerMs = 80,
  className = '',
}: {
  children: React.ReactNode;
  staggerMs?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const items = React.Children.toArray(children);

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : staggerMs / 1000,
        delayChildren: reduceMotion ? 0 : 0.04,
      },
    },
  };

  const item: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0.01 : 0.42,
        ease: EASE_OUT_EXPO,
      },
    },
  };

  return (
    <m.div
      className={className}
      variants={container}
      initial={reduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 'some', margin: '0px 0px 80px 0px' }}
    >
      {items.map((child, index) => (
        <m.div key={index} variants={item}>
          {child}
        </m.div>
      ))}
    </m.div>
  );
}
