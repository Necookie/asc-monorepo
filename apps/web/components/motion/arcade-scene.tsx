'use client';

import * as React from 'react';
import * as THREE from 'three';

function createMark() {
  const outline = new THREE.Shape();
  outline.moveTo(-1.16, -1.18);
  outline.lineTo(-0.25, 1.05);
  outline.quadraticCurveTo(-0.18, 1.21, 0, 1.21);
  outline.quadraticCurveTo(0.18, 1.21, 0.25, 1.05);
  outline.lineTo(1.16, -1.18);
  outline.lineTo(0.69, -1.18);
  outline.lineTo(0.44, -0.55);
  outline.lineTo(-0.44, -0.55);
  outline.lineTo(-0.69, -1.18);
  outline.closePath();
  const opening = new THREE.Path();
  opening.moveTo(-0.31, -0.16);
  opening.lineTo(0.31, -0.16);
  opening.lineTo(0, 0.61);
  opening.closePath();
  outline.holes.push(opening);
  const geometry = new THREE.ExtrudeGeometry(outline, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.065,
    bevelSize: 0.045,
    bevelSegments: 4,
    curveSegments: 10,
  });
  geometry.center();
  return geometry;
}

export function ArcadeScene({ onFailure }: { onFailure: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const targetRef = React.useRef({ x: 0, y: 0 });
  const dragRef = React.useRef<{ id: number; x: number; y: number; originX: number; originY: number } | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch { onFailure(); return; }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7.8);
    const group = new THREE.Group();
    scene.add(group);

    const front = new THREE.MeshStandardMaterial({ color: 0xf4f2ff, metalness: 0.35, roughness: 0.28 });
    const side = new THREE.MeshStandardMaterial({ color: 0xec48bd, metalness: 0.55, roughness: 0.26 });
    const mark = new THREE.Mesh(createMark(), [front, side]);
    mark.position.z = 0.5;
    group.add(mark);

    const ticketGeometry = new THREE.BoxGeometry(1.17, 1.55, 0.12);
    const ticketColors = [0x35ed7e, 0x00b0f4, 0xec48bd];
    const tickets = ticketColors.map((color, index) => {
      const mesh = new THREE.Mesh(ticketGeometry, new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.55 }));
      mesh.position.set((index - 1) * 1.13, index === 1 ? 0.25 : -0.15, -0.55 - index * 0.18);
      mesh.rotation.z = (index - 1) * -0.18;
      group.add(mesh);
      return mesh;
    });
    const ringGeometry = new THREE.TorusGeometry(1.72, 0.018, 8, 96);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xec48bd, transparent: true, opacity: 0.55 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.z = -0.95;
    ring.rotation.x = 0.18;
    group.add(ring);

    scene.add(new THREE.AmbientLight(0xffffff, 2.1));
    const light = new THREE.DirectionalLight(0xffffff, 3.2);
    light.position.set(-2, 3, 5);
    scene.add(light);
    const rim = new THREE.DirectionalLight(0xec48bd, 2.5);
    rim.position.set(3, -2, -1);
    scene.add(rim);

    const syncTheme = () => {
      front.color.set(document.documentElement.classList.contains('light') ? 0x1b1b23 : 0xf4f2ff);
      ringMaterial.color.set(document.documentElement.classList.contains('light') ? 0xa92c7c : 0xec48bd);
    };
    syncTheme();
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const resize = () => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 500 ? 1.25 : 1.75));
      renderer.setSize(width, height, false);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const render = () => {
      group.rotation.y += (targetRef.current.x - group.rotation.y) * 0.065;
      group.rotation.x += (targetRef.current.y - group.rotation.x) * 0.065;
      renderer.render(scene, camera);
    };
    let inView = true;
    const syncLoop = () => renderer.setAnimationLoop(inView && !document.hidden ? render : null);
    const intersection = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncLoop(); });
    intersection.observe(canvas);
    document.addEventListener('visibilitychange', syncLoop);
    const contextLost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener('webglcontextlost', contextLost);
    syncLoop();

    return () => {
      renderer.setAnimationLoop(null);
      document.removeEventListener('visibilitychange', syncLoop);
      canvas.removeEventListener('webglcontextlost', contextLost);
      intersection.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      mark.geometry.dispose();
      ticketGeometry.dispose();
      tickets.forEach((mesh) => (mesh.material as THREE.Material).dispose());
      ringGeometry.dispose();
      ringMaterial.dispose();
      front.dispose();
      side.dispose();
      renderer.dispose();
    };
  }, [onFailure]);

  const pointRotation = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    targetRef.current = {
      x: Math.max(-0.65, Math.min(0.65, ((clientX - rect.left) / rect.width - 0.5) * 1.1)),
      y: Math.max(-0.38, Math.min(0.38, ((clientY - rect.top) / rect.height - 0.5) * 0.65)),
    };
  };

  return (
    <div
      className="arcade-scene"
      role="group"
      tabIndex={0}
      aria-label="Interactive ASC mark. Drag or use arrow keys to turn it."
      onPointerDown={(event) => {
        dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: targetRef.current.x, originY: targetRef.current.y };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (drag?.id === event.pointerId) {
          targetRef.current = {
            x: Math.max(-0.9, Math.min(0.9, drag.originX + (event.clientX - drag.x) / 240)),
            y: Math.max(-0.5, Math.min(0.5, drag.originY + (event.clientY - drag.y) / 300)),
          };
        } else if (event.pointerType === 'mouse') pointRotation(event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        dragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { dragRef.current = null; }}
      onPointerLeave={() => { if (!dragRef.current) targetRef.current = { x: 0, y: 0 }; }}
      onKeyDown={(event) => {
        const delta = 0.15;
        if (event.key === 'ArrowLeft') targetRef.current.x -= delta;
        else if (event.key === 'ArrowRight') targetRef.current.x += delta;
        else if (event.key === 'ArrowUp') targetRef.current.y -= delta;
        else if (event.key === 'ArrowDown') targetRef.current.y += delta;
        else return;
        event.preventDefault();
        targetRef.current.x = Math.max(-0.9, Math.min(0.9, targetRef.current.x));
        targetRef.current.y = Math.max(-0.5, Math.min(0.5, targetRef.current.y));
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
