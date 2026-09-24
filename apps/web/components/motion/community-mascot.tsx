'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';

const LINES = [
  'Glad you found us.',
  'Your people are here.',
  'Make this corner yours.',
] as const;

const STORAGE_KEY = 'asc-mascot-position:v1';
const DRAG_THRESHOLD = 5;

type Position = { x: number; y: number };
type Drag = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  lastX: number;
  lastY: number;
  moved: boolean;
};

function clamp(value: number, max: number) {
  return Math.min(Math.max(value, 0), max);
}

export function CommunityMascot() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const runnerRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<Drag | null>(null);
  const suppressClickRef = React.useRef(false);
  const [mounted, setMounted] = React.useState(false);
  const [position, setPosition] = React.useState<Position | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [showBubble, setShowBubble] = React.useState(false);
  const [waving, setWaving] = React.useState(false);
  const [lineIndex, setLineIndex] = React.useState(0);

  const bounds = React.useCallback(() => {
    const runner = runnerRef.current;
    return {
      x: Math.max(0, window.innerWidth - (runner?.offsetWidth ?? 0)),
      y: Math.max(0, window.innerHeight - (runner?.offsetHeight ?? 0)),
    };
  }, []);

  const savePosition = React.useCallback((next: Position) => {
    const max = bounds();
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ x: max.x ? next.x / max.x : 0, y: max.y ? next.y / max.y : 0 }),
      );
    } catch {
      // Storage may be disabled; dragging still works for this visit.
    }
  }, [bounds]);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!mounted || !runnerRef.current) return;
    const restorePosition = () => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        const ratios = JSON.parse(saved) as Position;
        if (!Number.isFinite(ratios.x) || !Number.isFinite(ratios.y)) return;
        const max = bounds();
        setPosition({ x: clamp(ratios.x * max.x, max.x), y: clamp(ratios.y * max.y, max.y) });
      } catch {
        // Ignore unavailable or malformed saved positions.
      }
    };
    restorePosition();
    window.addEventListener('resize', restorePosition);
    return () => window.removeEventListener('resize', restorePosition);
  }, [mounted, bounds, pathname]);

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

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0 || !runnerRef.current) return;
    const rect = runnerRef.current.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      lastX: rect.left,
      lastY: rect.top,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!drag.moved) {
      drag.moved = true;
      setDragging(true);
      setShowBubble(false);
    }
    const max = bounds();
    drag.lastX = clamp(drag.originX + dx, max.x);
    drag.lastY = clamp(drag.originY + dy, max.y);
    setPosition({ x: drag.lastX, y: drag.lastY });
  };

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.moved) {
      savePosition({ x: drag.lastX, y: drag.lastY });
      suppressClickRef.current = true;
    }
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const delta = event.shiftKey ? 40 : 16;
    const change: Record<string, Position> = {
      ArrowLeft: { x: -delta, y: 0 },
      ArrowRight: { x: delta, y: 0 },
      ArrowUp: { x: 0, y: -delta },
      ArrowDown: { x: 0, y: delta },
    };
    const direction = change[event.key];
    if (!direction || !runnerRef.current) return;
    event.preventDefault();
    const rect = runnerRef.current.getBoundingClientRect();
    const max = bounds();
    const next = {
      x: clamp(rect.left + direction.x, max.x),
      y: clamp(rect.top + direction.y, max.y),
    };
    setPosition(next);
    savePosition(next);
    setShowBubble(false);
  };

  const hiddenRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/not-a-member');

  if (!mounted || hiddenRoute) return null;

  return (
    <div className="community-mascot-layer">
      <div
        ref={runnerRef}
        className="community-mascot-runner"
        style={position ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : undefined}
      >
        <AnimatePresence>
          {showBubble && (
            <m.div
              className="community-mascot-bubble"
              data-side={position && position.x < 140 ? 'right' : 'left'}
              data-vertical={position && position.y < 120 ? 'below' : 'above'}
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
        <m.button
          type="button"
          className="community-mascot-btn"
          data-dragging={dragging}
          aria-label="ASC mascot. Drag to move, use arrow keys to reposition, or activate to wave."
          title="Drag to move or tap to wave"
          initial={reduceMotion ? false : { x: 150, y: 42, rotate: 12 }}
          animate={{ x: 0, y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 95, damping: 16, delay: 0.35 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onKeyDown={onKeyDown}
          onClick={() => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              return;
            }
            setLineIndex((current) => (current + 1) % LINES.length);
            setShowBubble(true);
            setWaving(true);
          }}
          onMouseEnter={() => { if (!dragRef.current) setShowBubble(true); }}
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
                : dragging
                  ? { y: 0, rotate: 0 }
                  : waving
                  ? { y: [0, -13, 1, 0], rotate: [0, -9, 7, -3, 0] }
                  : { y: [0, -4, 0], rotate: [0, -1, 0] }
            }
            transition={
              dragging
                ? { duration: 0.1 }
                : waving
                ? { duration: 0.7, ease: 'easeOut' }
                : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
            }
          />
        </m.button>
      </div>
    </div>
  );
}
