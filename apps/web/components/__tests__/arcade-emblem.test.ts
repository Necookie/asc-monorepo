import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { createArcadeEmblem, disposeEmblem } from '../motion/arcade-emblem';

describe('ASC emblem graphics resources', () => {
  it('produces finite geometry with the rounded mark inside its backing', () => {
    const { group } = createArcadeEmblem();
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const positions = object.geometry.getAttribute('position');
        expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
      }
    });
    const bounds = new THREE.Box3().setFromObject(group);
    expect(bounds.min.x).toBeGreaterThan(-1.7);
    expect(bounds.max.x).toBeLessThan(1.7);
    expect(bounds.max.z).toBeGreaterThan(0.4);
    disposeEmblem(group);
  });

  it('disposes shared GPU geometry and materials exactly once', () => {
    const { group } = createArcadeEmblem();
    const resources = new Set<THREE.BufferGeometry | THREE.Material>();
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        resources.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) resources.add(material);
      }
    });
    const listeners = [...resources].map((resource) => {
      const listener = vi.fn();
      resource.addEventListener('dispose', listener);
      return listener;
    });
    disposeEmblem(group);
    for (const listener of listeners) expect(listener).toHaveBeenCalledTimes(1);
  });
});
