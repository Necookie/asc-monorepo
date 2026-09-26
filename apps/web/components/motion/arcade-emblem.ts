import * as THREE from 'three';

/** A physical version of the rounded ASC arch and curved smile in the site mark. */
export function createArcadeEmblem() {
  const group = new THREE.Group();
  const ink = new THREE.MeshPhysicalMaterial({ color: 0xf7f7f7, metalness: 0.45, roughness: 0.22, clearcoat: 0.7 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xec48bd, metalness: 0.55, roughness: 0.3 });
  const face = new THREE.MeshStandardMaterial({ color: 0x202024, metalness: 0.15, roughness: 0.6 });
  const detail = new THREE.MeshStandardMaterial({ color: 0x75757e, metalness: 0.6, roughness: 0.3 });

  const badge = new THREE.Mesh(new THREE.CylinderGeometry(1.57, 1.57, 0.22, 96), face);
  badge.rotation.x = Math.PI / 2;
  badge.position.z = -0.15;
  group.add(badge);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.56, 0.075, 12, 96), accent);
  rim.position.z = -0.03;
  group.add(rim);
  const inset = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.009, 6, 96), detail);
  inset.position.z = -0.027;
  group.add(inset);

  // Quadratic crown keeps the recognizable soft tip instead of a generic letter A.
  const arch = new THREE.CurvePath<THREE.Vector3>();
  arch.add(new THREE.LineCurve3(new THREE.Vector3(-1.04, -0.94, 0.27), new THREE.Vector3(-0.16, 0.9, 0.27)));
  arch.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.16, 0.9, 0.27), new THREE.Vector3(0, 1.23, 0.27), new THREE.Vector3(0.16, 0.9, 0.27)));
  arch.add(new THREE.LineCurve3(new THREE.Vector3(0.16, 0.9, 0.27), new THREE.Vector3(1.04, -0.94, 0.27)));
  const smile = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.59, -0.39, 0.3), new THREE.Vector3(0, 0.01, 0.3), new THREE.Vector3(0.59, -0.39, 0.3));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(arch, 72, 0.17, 12, false), ink));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(smile, 32, 0.125, 12, false), ink));
  const capGeometry = new THREE.SphereGeometry(0.17, 16, 12);
  for (const x of [-1.04, 1.04]) {
    const cap = new THREE.Mesh(capGeometry, ink);
    cap.position.set(x, -0.94, 0.27);
    group.add(cap);
  }
  const smileCapGeometry = new THREE.SphereGeometry(0.15, 16, 12);
  for (const x of [-0.59, 0.59]) {
    const cap = new THREE.Mesh(smileCapGeometry, ink);
    cap.position.set(x, -0.39, 0.3);
    group.add(cap);
  }
  // Small engraved ticks make the backing feel like a collectible club token.
  const tickGeometry = new THREE.BoxGeometry(0.015, 0.055, 0.015);
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    const tick = new THREE.Mesh(tickGeometry, detail);
    tick.position.set(Math.sin(angle) * 1.48, Math.cos(angle) * 1.48, -0.025);
    tick.rotation.z = -angle;
    group.add(tick);
  }
  return { group, ink, face, detail, accent };
}

/** Shared geometries/materials are freed once, including caps and engraved ticks. */
export function disposeEmblem(group: THREE.Group) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
