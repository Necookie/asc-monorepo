'use client';

import * as React from 'react';

export interface AnimatedRevealProps {
  children: React.ReactNode;
  key?: React.Key;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  durationMs?: number;
  className?: string;
  triggerOnce?: boolean;
}

/**
 * AnimatedReveal - High-performance entrance animation for React components.
 * Uses IntersectionObserver for 60fps hardware-accelerated transitions.
 */
export function AnimatedReveal({
  children,
  delayMs = 0,
  direction = 'up',
  durationMs = 450,
  className = '',
  triggerOnce = true,
}: AnimatedRevealProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Support reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(node);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '20px',
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [triggerOnce]);

  const getTransform = () => {
    if (isVisible) return 'none';
    switch (direction) {
      case 'up':
        return 'translate3d(0, 20px, 0)';
      case 'down':
        return 'translate3d(0, -20px, 0)';
      case 'left':
        return 'translate3d(20px, 0, 0)';
      case 'right':
        return 'translate3d(-20px, 0, 0)';
      default:
        return 'none';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

/**
 * AnimatedStagger - Staggers children animations sequentially
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
  const items = React.Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, idx) => (
        <AnimatedReveal key={idx} delayMs={idx * staggerMs}>
          {child}
        </AnimatedReveal>
      ))}
    </div>
  );
}
