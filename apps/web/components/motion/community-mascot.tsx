'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { m, useMotionValue } from 'motion/react';
import { MascotCharacter, type MascotMood } from './mascot-character';

const POSITION_KEY = 'asc-mascot-position:v1';
const PAUSE_KEY = 'asc-mascot-paused:v1';
const MESSAGES: Record<MascotMood, string> = {
  idle: 'A little company while you explore.',
  wave: 'Hey, ASC! Good to see you.',
  happy: 'Prrr. You made my day.',
  celebrate: 'A little cheer for you!',
  sleep: 'Recharging for the next adventure.',
  wake: 'Big stretch. Ready to explore!',
  held: 'Where are we going?',
  land: 'This looks like a good spot.',
};
type Point = { x: number; y: number };
type Drag = { id: number; start: Point; origin: Point; moved: boolean };
const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), Math.max(0, max));
// Keep the companion reachable beneath the sticky primary navigation.
const topInset = () => Math.max(12, (document.querySelector('header')?.getBoundingClientRect().bottom ?? 0) + 8);

export function CommunityMascot() {
  const pathname = usePathname();
  if (['/dashboard', '/admin', '/login', '/not-a-member'].some((route) => pathname?.startsWith(route))) return null;
  return <MascotCompanion pathname={pathname} />;
}

function MascotCompanion({ pathname }: { pathname: string }) {
  const [reduceMotion, setReduceMotion] = React.useState(true);
  const runnerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<Drag | null>(null);
  const suppressClickRef = React.useRef(false);
  const petRef = React.useRef({ x: 0, y: 0, distance: 0, time: 0 });
  const positionRef = React.useRef<Point>({ x: 0, y: 0 });
  const savedRatioRef = React.useRef<Point | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [ready, setReady] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [visible, setVisible] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [reaction, setReaction] = React.useState<{ mood: MascotMood; count: number }>({ mood: 'idle', count: 0 });
  const [panelPosition, setPanelPosition] = React.useState<Point>({ x: 12, y: 12 });
  const panelId = React.useId();
  const active = ready && visible && !paused && !reduceMotion;
  const mood = reaction.mood;

  const bounds = React.useCallback(() => ({
    x: Math.max(0, window.innerWidth - (runnerRef.current?.offsetWidth ?? 144)),
    y: Math.max(0, window.innerHeight - (runnerRef.current?.offsetHeight ?? 164)),
    top: topInset(),
  }), []);

  const placePanel = React.useCallback(() => {
    const pos = positionRef.current;
    const height = panelRef.current?.offsetHeight ?? 248;
    const width = panelRef.current?.offsetWidth ?? 232;
    const mascotHeight = runnerRef.current?.offsetHeight ?? 164;
    setPanelPosition({
      x: Math.max(12, clamp(pos.x - width + 70, window.innerWidth - width - 12)),
      y: Math.max(topInset(), clamp(pos.y >= height + topInset() + 8 ? pos.y - height - 8 : pos.y + mascotHeight + 8, window.innerHeight - height - 12)),
    });
  }, []);

  const move = React.useCallback((point: Point) => {
    const max = bounds();
    const next = { x: clamp(point.x, max.x), y: Math.max(Math.min(max.top, max.y), clamp(point.y, max.y)) };
    positionRef.current = next;
    x.set(next.x);
    y.set(next.y);
    return next;
  }, [bounds, x, y]);

  const savePosition = React.useCallback(() => {
    const max = bounds();
    const pos = positionRef.current;
    const ratios = { x: max.x ? pos.x / max.x : 0, y: max.y ? pos.y / max.y : 0 };
    savedRatioRef.current = ratios;
    try { localStorage.setItem(POSITION_KEY, JSON.stringify(ratios)); } catch { /* Optional preference. */ }
  }, [bounds]);

  const react = (next: MascotMood) => setReaction((current) => ({ mood: next, count: current.count + 1 }));
  const wakeOrReact = (next: MascotMood) => react(mood === 'sleep' ? 'wake' : next);

  React.useEffect(() => {
    // Listen directly: the installed Motion hook only reads the initial preference.
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(POSITION_KEY) ?? 'null') as Point | null;
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) savedRatioRef.current = saved;
      setPaused(localStorage.getItem(PAUSE_KEY) === 'true');
    } catch { /* Invalid or unavailable storage must not disable interactions. */ }
    const restore = () => {
      const max = bounds();
      const saved = savedRatioRef.current;
      const fallback = { x: max.x - 12, y: max.y - 12 };
      const candidate = saved ? { x: saved.x * max.x, y: saved.y * max.y } : fallback;
      const width = runnerRef.current?.offsetWidth ?? 144;
      const height = runnerRef.current?.offsetHeight ?? 164;
      const coversIntro = Array.from(document.querySelectorAll('main h1, main .arcade-kicker')).some((element) => {
        const rect = element.getBoundingClientRect();
        return candidate.x < rect.right + 12 && candidate.x + width > rect.left - 12 &&
          candidate.y < rect.bottom + 12 && candidate.y + height > rect.top - 12;
      });
      move(coversIntro ? fallback : candidate);
      if (coversIntro) savePosition();
      placePanel();
    };
    const visibility = () => setVisible(!document.hidden);
    restore();
    visibility();
    setReady(true);
    window.addEventListener('resize', restore);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('resize', restore);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [bounds, move, placePanel, pathname, savePosition]);

  React.useEffect(() => {
    if (!active || mood === 'sleep' || mood === 'held') return;
    const timer = window.setTimeout(() => {
      setReaction((current) => ({ mood: mood === 'idle' ? 'sleep' : 'idle', count: current.count + 1 }));
    }, mood === 'idle' ? 30000 : mood === 'land' ? 600 : mood === 'wake' ? 1100 : 2200);
    return () => window.clearTimeout(timer);
  }, [active, mood, reaction.count]);

  // Pointer tracking schedules at most one DOM write per frame, without React renders.
  React.useEffect(() => {
    const runner = runnerRef.current;
    if (!runner) return;
    if (!active || mood === 'sleep' || mood === 'held') {
      runner.style.setProperty('--mascot-look', '0deg');
      return;
    }
    let frame = 0;
    let point: Point = { x: 0, y: 0 };
    const track = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = runner.getBoundingClientRect();
        const dx = point.x - rect.left - rect.width / 2;
        const dy = point.y - rect.top - rect.height / 3;
        const near = Math.hypot(dx, dy) < 320;
        runner.style.setProperty('--mascot-look', `${near ? Math.max(-6, Math.min(6, dx / 42)) : 0}deg`);
        runner.style.setProperty('--mascot-look-y', `${near ? Math.max(-8, Math.min(8, dy / 30)) : 0}px`);
        runner.dataset.near = String(near);
      });
    };
    const reset = () => {
      runner.style.setProperty('--mascot-look', '0deg');
      runner.style.setProperty('--mascot-look-y', '0px');
      runner.dataset.near = 'false';
    };
    window.addEventListener('pointermove', track, { passive: true });
    document.addEventListener('pointerleave', reset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', track);
      document.removeEventListener('pointerleave', reset);
      reset();
    };
  }, [active, mood]);

  React.useEffect(() => {
    if (!open) return;
    placePanel();
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target) && !runnerRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open, placePanel]);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClickRef.current = false;
    dragRef.current = { id: event.pointerId, start: { x: event.clientX, y: event.clientY }, origin: positionRef.current, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) {
      const pet = petRef.current;
      const now = performance.now();
      const distance = now - pet.time < 180 ? pet.distance + Math.hypot(event.clientX - pet.x, event.clientY - pet.y) : 0;
      petRef.current = { x: event.clientX, y: event.clientY, distance, time: now };
      if (distance > 100 && mood !== 'happy') {
        petRef.current.distance = 0;
        react('happy');
      }
      return;
    }
    if (drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.start.x;
    const dy = event.clientY - drag.start.y;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    if (!drag.moved) {
      drag.moved = true;
      react('held');
      setOpen(false);
    }
    event.currentTarget.parentElement?.style.setProperty('--mascot-drag-lean', `${Math.max(-9, Math.min(9, dx / 18))}deg`);
    move({ x: drag.origin.x + dx, y: drag.origin.y + dy });
  };

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.parentElement?.style.setProperty('--mascot-drag-lean', '0deg');
    if (drag.moved) {
      savePosition();
      suppressClickRef.current = true;
      react('land');
      placePanel();
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const delta = event.shiftKey ? 40 : 16;
    const directions: Record<string, Point> = { ArrowLeft: { x: -delta, y: 0 }, ArrowRight: { x: delta, y: 0 }, ArrowUp: { x: 0, y: -delta }, ArrowDown: { x: 0, y: delta } };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    move({ x: positionRef.current.x + direction.x, y: positionRef.current.y + direction.y });
    savePosition();
    placePanel();
    react('land');
  };

  return (
    <div className="community-mascot-layer" data-motion={active ? 'on' : 'off'} style={{ visibility: ready ? 'visible' : 'hidden' }}>
      <m.div ref={runnerRef} className="community-mascot-runner" style={{ x, y }} data-mood={mood}>
        <button
          ref={buttonRef}
          type="button"
          className="community-mascot-btn"
          data-dragging={mood === 'held'}
          aria-label="ASC mascot. Open actions, drag to move, or use arrow keys to reposition."
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          title="Pet, drag, or tap to play"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onLostPointerCapture={finishDrag}
          onPointerLeave={() => { petRef.current.distance = 0; petRef.current.time = 0; }}
          onKeyDown={onKeyDown}
          onClick={(event) => {
            if (suppressClickRef.current && event.detail !== 0) { suppressClickRef.current = false; return; }
            suppressClickRef.current = false;
            wakeOrReact('wave');
            placePanel();
            setOpen((current) => !current);
          }}
        >
          <MascotCharacter mood={mood} reactionKey={reaction.count} />
        </button>
        <span className="mascot-emote" key={reaction.count} aria-hidden="true">
          {mood === 'sleep' ? 'z z z' : mood === 'happy' ? '♥' : mood === 'held' ? '!' : ''}
        </span>
        {mood === 'celebrate' && <span className="mascot-particles" key={`particles-${reaction.count}`} aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</span>}
      </m.div>
      {open && (
        <div ref={panelRef} id={panelId} className="community-mascot-panel" style={{ left: panelPosition.x, top: panelPosition.y }} role="region" aria-label="Mascot actions">
          <div className="mascot-panel-heading"><strong>Your ASC companion</strong><button type="button" aria-label="Close mascot actions" onClick={() => { setOpen(false); buttonRef.current?.focus(); }}>×</button></div>
          <p role="status" aria-live="polite">{MESSAGES[mood]}</p>
          <div className="mascot-actions">
            <button type="button" onClick={() => wakeOrReact('wave')}>Wave</button>
            <button type="button" onClick={() => wakeOrReact('happy')}>Pet</button>
            <button type="button" onClick={() => wakeOrReact('celebrate')}>Celebrate</button>
            <button type="button" onClick={() => react(mood === 'sleep' ? 'wake' : 'sleep')}>{mood === 'sleep' ? 'Wake up' : 'Nap'}</button>
          </div>
          <button type="button" className="mascot-pause" aria-pressed={paused} onClick={() => {
            const next = !paused;
            setPaused(next);
            try { localStorage.setItem(PAUSE_KEY, String(next)); } catch { /* Optional preference. */ }
          }}>{paused ? 'Resume animation' : 'Pause animation'}</button>
          <small>{reduceMotion ? 'Reduced motion is on. All actions still work.' : 'Stroke to pet. Drag to move. Arrow keys work too.'}</small>
        </div>
      )}
    </div>
  );
}
