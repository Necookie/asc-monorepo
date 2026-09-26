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

class SceneBoundary extends React.Component<{ children: React.ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? <StillStage /> : this.props.children; }
}

export function ArcadeStage() {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);
  const [canAnimate, setCanAnimate] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [automatic, setAutomatic] = React.useState(false);
  const [idleReady, setIdleReady] = React.useState(false);
  const [requested, setRequested] = React.useState(false);
  const requestedRef = React.useRef(false);
  const fail = React.useCallback(() => setFailed(true), []);
  const markReady = React.useCallback(() => {
    setReady(true);
    if (requestedRef.current) {
      requestedRef.current = false;
      stageRef.current?.querySelector<HTMLElement>('.arcade-scene')?.focus();
    }
  }, []);

  React.useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean; effectiveType?: string } }).connection;
    const update = () => setAutomatic(desktop.matches && !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType ?? ''));
    update();
    desktop.addEventListener('change', update);
    connection?.addEventListener('change', update);
    return () => { desktop.removeEventListener('change', update); connection?.removeEventListener('change', update); };
  }, []);

  React.useEffect(() => {
    if (!inView || !canAnimate || !automatic || idleReady) return;
    // Give text and buttons their first paint before downloading and compiling WebGL.
    let idle: number | undefined;
    const delay = window.setTimeout(() => {
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => setIdleReady(true), { timeout: 2000 });
      else setIdleReady(true);
    }, 700);
    return () => { window.clearTimeout(delay); if (idle !== undefined) window.cancelIdleCallback(idle); };
  }, [inView, canAnimate, automatic, idleReady]);

  React.useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setCanAnimate(!preference.matches); setReady(false); };
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

  const showScene = inView && canAnimate && !failed && (requested || (automatic && idleReady));
  React.useEffect(() => { if (!showScene) setReady(false); }, [showScene]);

  return (
    <div ref={stageRef} className="arcade-stage" aria-label="ASC arcade showcase">
      {showScene ? <SceneBoundary onFailure={fail}><Scene onFailure={fail} onReady={markReady} /></SceneBoundary> : <StillStage />}
      {canAnimate && !failed && !ready && <button type="button" className="arcade-stage__activate" disabled={requested} onClick={() => { requestedRef.current = true; setRequested(true); }}>{requested ? 'Loading 3D…' : 'Explore in 3D'}</button>}
      <div className="arcade-stage__caption" aria-hidden="true">
        <span>ASC / 001</span>
        <span>{inView && canAnimate && ready && !failed ? 'Drag or use arrow keys' : 'A place to belong'}</span>
      </div>
    </div>
  );
}
