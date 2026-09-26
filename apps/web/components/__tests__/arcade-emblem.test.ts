import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { createArcadeEmblem, disposeEmblem } from '../motion/arcade-emblem';

const meshNames = ['asc-ribbon', 'asc-bridge', 'asc-node-left', 'asc-node-center', 'asc-node-right'];

function getMesh(group: THREE.Group, name: string) {
  const object = group.getObjectByName(name);
  if (!(object instanceof THREE.Mesh)) throw new Error(`Missing emblem mesh: ${name}`);
  return object;
}

describe('ASC emblem graphics resources', () => {
  it('keeps the colored mark finite and within the lightweight scene budget', () => {
    const { group, material } = createArcadeEmblem();
    try {
      const meshes: THREE.Mesh[] = [];
      group.traverse((object) => { if (object instanceof THREE.Mesh) meshes.push(object); });
      expect(meshes.map((mesh) => mesh.name).sort()).toEqual([...meshNames].sort());
      expect(material.vertexColors).toBe(true);

      let triangles = 0;
      for (const mesh of meshes) {
        expect(mesh.material).toBe(material);
        const positions = mesh.geometry.getAttribute('position');
        const colors = mesh.geometry.getAttribute('color');
        expect(positions.count).toBeGreaterThan(0);
        expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
        expect(colors.itemSize).toBe(3);
        expect(colors.count).toBe(positions.count);
        expect(Array.from(colors.array).every((value) => Number.isFinite(value) && value >= 0 && value <= 1)).toBe(true);
        // A constant RGB triplet would silently replace the authored gradient with a plain material.
        const varies = Array.from({ length: 3 }, (_, channel) => {
          const values = Array.from({ length: colors.count }, (_, index) => colors.array[index * 3 + channel]);
          return Math.max(...values) - Math.min(...values) > 0.001;
        }).some(Boolean);
        expect(varies).toBe(true);
        triangles += (mesh.geometry.index?.count ?? positions.count) / 3;
      }
      expect(triangles).toBeLessThan(20000);

      const bounds = new THREE.Box3().setFromObject(group);
      expect(bounds.min.x).toBeGreaterThanOrEqual(-1.8);
      expect(bounds.max.x).toBeLessThanOrEqual(1.8);
      expect(bounds.min.y).toBeGreaterThanOrEqual(-1.8);
      expect(bounds.max.y).toBeLessThanOrEqual(1.8);
      expect(bounds.min.z).toBeGreaterThanOrEqual(-0.5);
      expect(bounds.max.z).toBeLessThanOrEqual(0.6);
      expect(bounds.getSize(new THREE.Vector3()).z).toBeGreaterThan(0.1);
    } finally {
      disposeEmblem(group);
    }
  });

  it('connects the lower nodes beneath the arch with a smaller raised center', () => {
    const { group } = createArcadeEmblem();
    try {
      const ribbon = new THREE.Box3().setFromObject(getMesh(group, 'asc-ribbon'));
      const bridge = new THREE.Box3().setFromObject(getMesh(group, 'asc-bridge'));
      const left = new THREE.Box3().setFromObject(getMesh(group, 'asc-node-left'));
      const center = new THREE.Box3().setFromObject(getMesh(group, 'asc-node-center'));
      const right = new THREE.Box3().setFromObject(getMesh(group, 'asc-node-right'));
      const leftPosition = left.getCenter(new THREE.Vector3());
      const centerPosition = center.getCenter(new THREE.Vector3());
      const rightPosition = right.getCenter(new THREE.Vector3());

      expect(leftPosition.x).toBeLessThan(centerPosition.x);
      expect(centerPosition.x).toBeLessThan(rightPosition.x);
      expect(centerPosition.y).toBeGreaterThan(leftPosition.y);
      expect(centerPosition.y).toBeGreaterThan(rightPosition.y);
      expect(Math.abs(centerPosition.x)).toBeLessThan(0.1);
      expect(center.getSize(new THREE.Vector3()).y).toBeLessThan(left.getSize(new THREE.Vector3()).y);
      expect(center.getSize(new THREE.Vector3()).y).toBeLessThan(right.getSize(new THREE.Vector3()).y);
      expect(ribbon.max.y).toBeGreaterThan(center.max.y);
      expect(ribbon.intersectsBox(left)).toBe(true);
      expect(ribbon.intersectsBox(right)).toBe(true);
      for (const node of [left, center, right]) expect(bridge.intersectsBox(node)).toBe(true);
    } finally {
      disposeEmblem(group);
    }
  });

  it('disposes all GPU geometry and the shared material exactly once', () => {
    const { group, material } = createArcadeEmblem();
    // Exercise geometry sharing too, so future reuse cannot cause double disposal.
    group.add(getMesh(group, 'asc-node-left').clone());
    const resources = new Set<THREE.BufferGeometry | THREE.Material>([material]);
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        resources.add(object.geometry);
        for (const meshMaterial of Array.isArray(object.material) ? object.material : [object.material]) resources.add(meshMaterial);
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
