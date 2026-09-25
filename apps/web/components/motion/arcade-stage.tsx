'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

function StillStage() {
  return (
    <div className="arcade-stage__still" aria-hidden="true">
      <span className="arcade-stage__orbit arcade-stage__orbit--outer" />
      <span className="arcade-stage__orbit arcade-stage__orbit--inner" />
      <span className="arcade-stage__mark">
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M9.5 52 28.5 13.5c1.4-2.9 5.6-2.9 7 0L54.5 52" stroke="currentColor" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.5 40.5c7.5-4.4 17.5-4.4 25 0" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="19.5" cy="40.5" r="3.6" fill="currentColor" />
          <circle cx="44.5" cy="40.5" r="3.6" fill="currentColor" />
        </svg>
      </span>
    </div>
  );
}

const Scene = dynamic(() => import('./arcade-scene').then((module) => module.ArcadeScene), {
  ssr: false,
  loading: () => <StillStage />,
});

export function ArcadeStage() {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);
  const [canAnimate, setCanAnimate] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const fail = React.useCallback(() => setFailed(true), []);

  React.useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setCanAnimate(!preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '200px' });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!inView || !canAnimate || failed) return;
    try {
      if (!document.createElement('canvas').getContext('webgl2')) setFailed(true);
    } catch { setFailed(true); }
  }, [inView, canAnimate, failed]);

  return (
    <div ref={stageRef} className="arcade-stage" aria-label="ASC arcade showcase">
      {inView && canAnimate && !failed ? <Scene onFailure={fail} /> : <StillStage />}
      <div className="arcade-stage__caption" aria-hidden="true">
        <span>ASC / 001</span>
        <span>{canAnimate && !failed ? 'Drag to turn' : 'A place to belong'}</span>
      </div>
    </div>
  );
}
