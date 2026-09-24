'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';

const LINES = [
  'Glad you found us.',
  'Your people are here.',
  'Make this corner yours.',
] as const;

export function CommunityMascot() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [showBubble, setShowBubble] = React.useState(false);
  const [waving, setWaving] = React.useState(false);
  const [lineIndex, setLineIndex] = React.useState(0);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!showBubble) return;
    const timer = window.setTimeout(() => setShowBubble(false), 4200);
    return () => window.clearTimeout(timer);
  }, [showBubble, lineIndex]);

  React.useEffect(() => {
    if (!waving) return;
    const timer = window.setTimeout(() => setWaving(false), 700);
    return () => window.clearTimeout(timer);
  }, [waving]);

  const hiddenRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/not-a-member');

  if (!mounted || hiddenRoute) return null;

  return (
    <div className="community-mascot-layer">
      <AnimatePresence>
        {showBubble && (
          <m.div
            className="community-mascot-bubble"
            role="status"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
          >
            {LINES[lineIndex]}
          </m.div>
        )}
      </AnimatePresence>

      <m.div
        className="community-mascot-runner"
        initial={reduceMotion ? false : { x: 150, y: 42, rotate: 12 }}
        animate={{ x: 0, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 95, damping: 16, delay: 0.35 }}
      >
        <button
          type="button"
          className="community-mascot-btn"
          aria-label="Wave hello to the ASC mascot"
          onClick={() => {
            setLineIndex((current) => (current + 1) % LINES.length);
            setShowBubble(true);
            setWaving(true);
          }}
          onMouseEnter={() => setShowBubble(true)}
          onFocus={() => setShowBubble(true)}
        >
          <m.img
            src="/mascot/cat-front-cutout.png"
            alt=""
            width={1177}
            height={1337}
            draggable={false}
            className="community-mascot-sprite"
            animate={
              reduceMotion
                ? undefined
                : waving
                  ? { y: [0, -13, 1, 0], rotate: [0, -9, 7, -3, 0] }
                  : { y: [0, -4, 0], rotate: [0, -1, 0] }
            }
            transition={
              waving
                ? { duration: 0.7, ease: 'easeOut' }
                : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
            }
          />
        </button>
      </m.div>
    </div>
  );
}
