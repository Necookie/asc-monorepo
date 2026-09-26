import * as THREE from 'three';
import { ASC_ARCH, ASC_BRIDGE, ASC_NODES, type MarkCommand } from '../../lib/asc-mark';

const toX = (value: number) => (value - 32) / 16;
const toY = (value: number) => (32 - value) / 16;

function ribbonShape(commands: MarkCommand[]) {
  const shape = new THREE.Shape();
  for (const command of commands) {
    if (command[0] === 'M') shape.moveTo(toX(command[1]), toY(command[2]));
    else if (command[0] === 'L') shape.lineTo(toX(command[1]), toY(command[2]));
    else if (command[0] === 'C') shape.bezierCurveTo(toX(command[1]), toY(command[2]), toX(command[3]), toY(command[4]), toX(command[5]), toY(command[6]));
  }
  shape.closePath();
  return shape;
}

/** Vertex colors keep the source logo's cyan crown, violet left and magenta right. */
function colorSculpture(geometry: THREE.BufferGeometry) {
  const positions = geometry.getAttribute('position');
  const colors = new Float32Array(positions.count * 3);
  const cyan = new THREE.Color('#30d5f4');
  const violet = new THREE.Color('#6348f5');
  const magenta = new THREE.Color('#ee35d2');
  const color = new THREE.Color();
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const across = THREE.MathUtils.smoothstep(x, -1.1, 1.25);
    const crown = THREE.MathUtils.smoothstep(y, -0.1, 1.2);
    color.copy(violet).lerp(magenta, across).lerp(cyan, crown);
    color.toArray(colors, index * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/** A satin ribbon sculpture of ASC's original three-node icon, without a backing coin. */
export function createArcadeEmblem() {
  const group = new THREE.Group();
  const material = new THREE.MeshPhysicalMaterial({
    vertexColors: true, metalness: 0.05, roughness: 0.42, specularIntensity: 0.3,
    clearcoat: 0.1, clearcoatRoughness: 0.4, envMapIntensity: 0.3,
  });

  for (const [name, commands, depth] of [
    ['asc-ribbon', ASC_ARCH, 0.22],
    ['asc-bridge', ASC_BRIDGE, 0.16],
  ] as const) {
    const geometry = new THREE.ExtrudeGeometry(ribbonShape(commands), {
      depth, steps: 1, curveSegments: 32,
      bevelEnabled: true, bevelThickness: 0.075, bevelSize: 0.055, bevelSegments: 5,
    });
    geometry.translate(0, 0, -depth / 2);
    const mesh = new THREE.Mesh(colorSculpture(geometry), material);
    mesh.name = name;
    group.add(mesh);
  }

  for (const node of ASC_NODES) {
    const radius = node.radius / 16;
    // Soft, flattened nodes stay connected to the ribbon while catching a broad highlight.
    const geometry = new THREE.SphereGeometry(radius, 32, 20);
    geometry.scale(1, 1, 0.68);
    geometry.translate(toX(node.x), toY(node.y), 0.075);
    const mesh = new THREE.Mesh(colorSculpture(geometry), material);
    mesh.name = `asc-node-${node.name}`;
    group.add(mesh);
  }
  return { group, material };
}

/** Shared geometries/materials are freed once when the scene leaves the page. */
export function disposeEmblem(group: THREE.Group) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      if (object instanceof THREE.InstancedMesh) object.dispose();
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
