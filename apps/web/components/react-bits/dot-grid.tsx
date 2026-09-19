'use client';

import * as React from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from 'motion/react';

type Dot = { cx: number; cy: number; xOffset: number; yOffset: number };

type DotGridProps = {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  shockRadius?: number;
  shockStrength?: number;
  returnDuration?: number;
  className?: string;
};

function hexToRgb(hex: string) {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return { r: 88, g: 101, b: 242 };
  return {
    r: Number.parseInt(match[1], 16),
    g: Number.parseInt(match[2], 16),
    b: Number.parseInt(match[3], 16),
  };
}

export function DotGrid({
  dotSize = 3,
  gap = 25,
  baseColor = '#343b7a',
  activeColor = '#8d96ff',
  proximity = 130,
  shockRadius = 210,
  shockStrength = 0.18,
  returnDuration = 0.8,
  className = '',
}: DotGridProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const dotsRef = React.useRef<Dot[]>([]);
  const pointerRef = React.useRef({ x: -1000, y: -1000 });
  const reduceMotion = useReducedMotion();
  const baseRgb = React.useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = React.useMemo(() => hexToRgb(activeColor), [activeColor]);

  const buildGrid = React.useCallback(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const { width, height } = wrapper.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const cell = dotSize + gap;
    const columns = Math.max(1, Math.floor((width + gap) / cell));
    const rows = Math.max(1, Math.floor((height + gap) / cell));
    const startX = (width - (cell * columns - gap)) / 2 + dotSize / 2;
    const startY = (height - (cell * rows - gap)) / 2 + dotSize / 2;
    dotsRef.current = Array.from({ length: rows * columns }, (_, index) => ({
      cx: startX + (index % columns) * cell,
      cy: startY + Math.floor(index / columns) * cell,
      xOffset: 0,
      yOffset: 0,
    }));
  }, [dotSize, gap]);

  React.useEffect(() => {
    buildGrid();
    const wrapper = wrapperRef.current;
    const observer = new ResizeObserver(buildGrid);
    if (wrapper) observer.observe(wrapper);
    return () => observer.disconnect();
  }, [buildGrid]);

  React.useEffect(() => {
    let frame = 0;
    const draw = () => {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !wrapper) return;
      const context = canvas.getContext('2d');
      if (!context) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = wrapper.getBoundingClientRect();
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      for (const dot of dotsRef.current) {
        const distance = Math.hypot(dot.cx - pointerRef.current.x, dot.cy - pointerRef.current.y);
        const intensity = reduceMotion ? 0 : Math.max(0, 1 - distance / proximity);
        const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * intensity);
        const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * intensity);
        const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * intensity);
        context.beginPath();
        context.arc(dot.cx + dot.xOffset, dot.cy + dot.yOffset, dotSize / 2 + intensity * 1.2, 0, Math.PI * 2);
        context.fillStyle = `rgb(${r} ${g} ${b})`;
        context.fill();
      }
      frame = window.requestAnimationFrame(draw);
    };
    draw();
    return () => window.cancelAnimationFrame(frame);
  }, [activeRgb, baseRgb, dotSize, proximity, reduceMotion]);

  React.useEffect(() => {
    if (reduceMotion) return;
    const updatePointer = (event: PointerEvent) => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const createRipple = (event: PointerEvent) => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect || event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      for (const dot of dotsRef.current) {
        const dx = dot.cx - x;
        const dy = dot.cy - y;
        const distance = Math.hypot(dx, dy);
        if (distance >= shockRadius) continue;
        const force = (1 - distance / shockRadius) * shockStrength;
        gsap.killTweensOf(dot);
        gsap.timeline()
          .to(dot, { xOffset: dx * force, yOffset: dy * force, duration: 0.18, ease: 'power4.out' })
          .to(dot, { xOffset: 0, yOffset: 0, duration: returnDuration, ease: 'power4.out' });
      }
    };
    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('pointerdown', createRipple, { passive: true });
    return () => {
      window.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('pointerdown', createRipple);
      gsap.killTweensOf(dotsRef.current);
    };
  }, [reduceMotion, returnDuration, shockRadius, shockStrength]);

  return (
    <div className={`dot-grid ${className}`} aria-hidden="true">
      <div ref={wrapperRef} className="dot-grid__wrap">
        <canvas ref={canvasRef} className="dot-grid__canvas" />
      </div>
    </div>
  );
}
