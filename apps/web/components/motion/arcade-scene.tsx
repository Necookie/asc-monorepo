'use client';

import * as React from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createArcadeEmblem, disposeEmblem } from './arcade-emblem';

const restingPose = { x: -0.32, y: -0.12 };

export function ArcadeScene({ onFailure, onReady }: { onFailure: () => void; onReady: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const targetRef = React.useRef({ ...restingPose });
  const dragRef = React.useRef<{ id: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const rectRef = React.useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const requestRenderRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch { onFailure(); return; }

    const scene = new THREE.Scene();
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.12, 6.2);
    const { group, ink, face, detail } = createArcadeEmblem();
    group.rotation.set(restingPose.y, restingPose.x, -0.08);
    group.position.y = 0.12;
    scene.add(group);
    const environment = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(renderer);
    // The small, rounded token does not need the default 256px reflection map.
    const environmentTarget = generator.fromScene(environment, 0.04, 0.1, 100, { size: 64 });
    scene.environment = environmentTarget.texture;
    environment.dispose();
    generator.dispose();

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(-2, 3, 5);
    scene.add(light);
    const rim = new THREE.DirectionalLight(0xec48bd, 2);
    rim.position.set(3, -2, -1);
    scene.add(rim);

    let inView = true;
    let compiled = false;
    let disposed = false;
    let isLoopActive = false;
    let previousFrame = performance.now();

    const render = () => {
      const now = performance.now();
      const easing = 1 - Math.exp(-Math.min(now - previousFrame, 100) / 120);
      previousFrame = now;
      const dy = targetRef.current.x - group.rotation.y;
      const dx = targetRef.current.y - group.rotation.x;
      const isMoving = Math.abs(dy) > 0.0002 || Math.abs(dx) > 0.0002 || dragRef.current !== null;

      if (isMoving) {
        group.rotation.y += dy * easing;
        group.rotation.x += dx * easing;
        renderer.render(scene, camera);
      } else {
        group.rotation.y = targetRef.current.x;
        group.rotation.x = targetRef.current.y;
        renderer.render(scene, camera);
        isLoopActive = false;
        renderer.setAnimationLoop(null);
      }
    };

    const startLoop = () => {
      if (compiled && !isLoopActive && inView && !document.hidden) {
        previousFrame = performance.now();
        isLoopActive = true;
        renderer.setAnimationLoop(render);
      }
    };

    requestRenderRef.current = startLoop;

    const syncTheme = () => {
      const lightMode = document.documentElement.classList.contains('light');
      ink.color.set(lightMode ? 0x18181d : 0xf7f7f7);
      face.color.set(lightMode ? 0xe4e4e7 : 0x202024);
      detail.color.set(lightMode ? 0x77777e : 0x93939d);
      startLoop();
    };
    syncTheme();
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const resize = () => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      camera.aspect = width / height;
      // Keep the full token above the caption on narrow screens.
      camera.position.z = camera.aspect < 1 ? 6.2 / camera.aspect : 6.2;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 500 ? 1.25 : 1.75));
      renderer.setSize(width, height, false);
      const bcr = canvas.getBoundingClientRect();
      rectRef.current = { left: bcr.left, top: bcr.top, width: bcr.width, height: bcr.height };
      startLoop();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const syncLoop = () => {
      if (inView && !document.hidden) {
        startLoop();
      } else {
        isLoopActive = false;
        renderer.setAnimationLoop(null);
      }
    };

    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncLoop();
    });
    intersection.observe(canvas);
    document.addEventListener('visibilitychange', syncLoop);
    const contextLost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener('webglcontextlost', contextLost);
    // Wait for parallel shader compilation where the GPU supports it.
    void renderer.compileAsync(scene, camera).then(() => {
      if (disposed) return;
      compiled = true;
      renderer.render(scene, camera);
      onReady();
      startLoop();
    }).catch(() => { if (!disposed) onFailure(); });

    return () => {
      disposed = true;
      requestRenderRef.current = () => {};
      renderer.setAnimationLoop(null);
      document.removeEventListener('visibilitychange', syncLoop);
      canvas.removeEventListener('webglcontextlost', contextLost);
      intersection.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      disposeEmblem(group);
      environmentTarget.dispose();
      renderer.dispose();
    };
  }, [onFailure, onReady]);

  const updateRect = () => {
    const bcr = canvasRef.current?.getBoundingClientRect();
    if (bcr) rectRef.current = { left: bcr.left, top: bcr.top, width: bcr.width, height: bcr.height };
  };

  const pointRotation = (clientX: number, clientY: number) => {
    let rect = rectRef.current;
    if (!rect) {
      updateRect();
      rect = rectRef.current;
    }
    if (!rect || rect.width === 0 || rect.height === 0) return;
    targetRef.current = {
      x: restingPose.x + ((clientX - rect.left) / rect.width - 0.5) * 0.7,
      y: restingPose.y + ((clientY - rect.top) / rect.height - 0.5) * 0.4,
    };
    requestRenderRef.current();
  };

  return (
    <div
      className="arcade-scene"
      role="group"
      tabIndex={0}
      aria-label="Interactive ASC emblem. Drag or use arrow keys to turn it. Press Home to reset."
      onPointerEnter={updateRect}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        updateRect();
        dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: targetRef.current.x, originY: targetRef.current.y };
        event.currentTarget.setPointerCapture(event.pointerId);
        requestRenderRef.current();
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (drag?.id === event.pointerId) {
          targetRef.current = {
            x: Math.max(-0.9, Math.min(0.9, drag.originX + (event.clientX - drag.x) / 240)),
            y: Math.max(-0.5, Math.min(0.5, drag.originY + (event.clientY - drag.y) / 300)),
          };
          requestRenderRef.current();
        } else if (event.pointerType === 'mouse') pointRotation(event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        dragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        requestRenderRef.current();
      }}
      onPointerCancel={() => {
        dragRef.current = null;
        requestRenderRef.current();
      }}
      onLostPointerCapture={() => {
        dragRef.current = null;
        requestRenderRef.current();
      }}
      onPointerLeave={() => {
        if (!dragRef.current) {
          targetRef.current = { ...restingPose };
          requestRenderRef.current();
        }
      }}
      onKeyDown={(event) => {
        const delta = 0.15;
        if (event.key === 'ArrowLeft') targetRef.current.x -= delta;
        else if (event.key === 'ArrowRight') targetRef.current.x += delta;
        else if (event.key === 'ArrowUp') targetRef.current.y -= delta;
        else if (event.key === 'ArrowDown') targetRef.current.y += delta;
        else if (event.key === 'Home') targetRef.current = { ...restingPose };
        else return;
        event.preventDefault();
        targetRef.current.x = Math.max(-0.9, Math.min(0.9, targetRef.current.x));
        targetRef.current.y = Math.max(-0.5, Math.min(0.5, targetRef.current.y));
        requestRenderRef.current();
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <button
        type="button"
        className="arcade-scene__reset"
        aria-label="Reset the ASC emblem position"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          targetRef.current = { ...restingPose };
          requestRenderRef.current();
        }}
      >Reset view</button>
    </div>
  );
}
