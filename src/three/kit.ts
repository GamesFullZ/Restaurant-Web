// Kit de construcción: materiales, blobs orgánicos, vajilla y utilidades de colocación.
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { fbm, mulberry32 } from './noise';
import { bumpNoise, ceramicTexture } from './textures';

export type Rng = () => number;
export const rng = (seed: number) => mulberry32(seed);
export const range = (r: Rng, a: number, b: number) => a + (b - a) * r();

// ---------- materiales
export function std(color: THREE.ColorRepresentation, roughness = 0.6, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
}

export function phys(color: THREE.ColorRepresentation, extra: THREE.MeshPhysicalMaterialParameters = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.4, metalness: 0, ...extra });
}

/** Salsas y glaseados: brillo de capa transparente. */
export function glossy(color: THREE.ColorRepresentation, roughness = 0.22) {
  return phys(color, { roughness, clearcoat: 1, clearcoatRoughness: 0.12 });
}

export function ceramic(color: string, roughness = 0.5) {
  return std('#ffffff', roughness, { map: ceramicTexture(color), bumpMap: bumpNoise('ceramic', 30), bumpScale: 0.3 });
}

/** Vidrio como material transparente (no de transmisión) para que el líquido se vea a través. */
export function glassMat() {
  return phys('#ffffff', { transparent: true, opacity: 0.22, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2.2, specularIntensity: 1, depthWrite: false, side: THREE.DoubleSide });
}

export function liquidMat(color: string, transmission = 0.55, roughness = 0.08) {
  return phys(color, { transmission, roughness, thickness: 0.8, ior: 1.34, attenuationColor: new THREE.Color(color), attenuationDistance: 0.28, clearcoat: 1, clearcoatRoughness: 0.05 });
}

// ---------- geometrías orgánicas
/** Blob deformado por ruido (sin grietas en las costuras). */
export function blob(rx: number, ry: number, rz: number, amp = 0.18, seed = 1, detail = 4, freq = 1.6): THREE.BufferGeometry {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const n = fbm(v.x * freq + seed * 3.1, v.y * freq + seed * 1.7, v.z * freq + seed * 0.9, 3);
    const s = 1 + n * amp;
    p.setXYZ(i, v.x * rx * s, v.y * ry * s, v.z * rz * s);
  }
  g.computeVertexNormals();
  return g;
}

/** Disco orgánico (salsas, charcos) con borde irregular y leve domo. */
export function puddle(r: number, height: number, seed = 1, irregular = 0.18, segs = 72): THREE.BufferGeometry {
  const rings = 10;
  const pos: number[] = [];
  const idx: number[] = [];
  pos.push(0, height, 0);
  for (let i = 1; i <= rings; i++) {
    const t = i / rings;
    for (let j = 0; j < segs; j++) {
      const a = (j / segs) * Math.PI * 2;
      const edge = r * (1 + fbm(Math.cos(a) * 1.3 + seed, Math.sin(a) * 1.3, seed * 0.7, 3) * irregular * 2);
      const rr = edge * t;
      const y = height * (1 - t * t * t) + (i === rings ? 0 : 0.0);
      pos.push(Math.cos(a) * rr, Math.max(0.001, y), Math.sin(a) * rr);
    }
  }
  for (let j = 0; j < segs; j++) idx.push(0, 1 + ((j + 1) % segs), 1 + j);
  for (let i = 1; i < rings; i++) {
    for (let j = 0; j < segs; j++) {
      const a = 1 + (i - 1) * segs + j;
      const b = 1 + (i - 1) * segs + ((j + 1) % segs);
      const c = 1 + i * segs + j;
      const d = 1 + i * segs + ((j + 1) % segs);
      idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * Lámina con grosor (tortillas, tostadas, buñuelos). `map(x, z)` deforma el disco plano;
 * `radius(phi)` define el contorno.
 */
export function sheet(opts: {
  radius: (phi: number) => number;
  map: (x: number, z: number) => THREE.Vector3;
  thickness: number;
  rings?: number;
  segs?: number;
}): THREE.BufferGeometry {
  const rings = opts.rings ?? 26;
  const segs = opts.segs ?? 96;
  const top: THREE.Vector3[] = [];
  const uv: number[] = [];
  top.push(opts.map(0, 0));
  uv.push(0.5, 0.5);
  for (let i = 1; i <= rings; i++) {
    for (let j = 0; j < segs; j++) {
      const phi = (j / segs) * Math.PI * 2;
      const r = (opts.radius(phi) * i) / rings;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      top.push(opts.map(x, z));
      uv.push(0.5 + x / 2.4, 0.5 + z / 2.4);
    }
  }
  const idxTop: number[] = [];
  for (let j = 0; j < segs; j++) idxTop.push(0, 1 + ((j + 1) % segs), 1 + j);
  for (let i = 1; i < rings; i++) {
    for (let j = 0; j < segs; j++) {
      const a = 1 + (i - 1) * segs + j;
      const b = 1 + (i - 1) * segs + ((j + 1) % segs);
      const c = 1 + i * segs + j;
      const d = 1 + i * segs + ((j + 1) % segs);
      idxTop.push(a, b, c, b, d, c);
    }
  }
  // normales de la cara superior
  const tmp = new THREE.BufferGeometry();
  tmp.setAttribute('position', new THREE.Float32BufferAttribute(top.flatMap((v) => [v.x, v.y, v.z]), 3));
  tmp.setIndex(idxTop);
  tmp.computeVertexNormals();
  const nAttr = tmp.attributes.normal as THREE.BufferAttribute;
  const n = top.length;
  const pos: number[] = [];
  for (const v of top) pos.push(v.x, v.y, v.z);
  const nv = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    nv.fromBufferAttribute(nAttr, i);
    pos.push(top[i].x - nv.x * opts.thickness, top[i].y - nv.y * opts.thickness, top[i].z - nv.z * opts.thickness);
  }
  const uvs = [...uv, ...uv];
  const idx = [...idxTop];
  for (let k = 0; k < idxTop.length; k += 3) idx.push(idxTop[k] + n, idxTop[k + 2] + n, idxTop[k + 1] + n);
  const outer = 1 + (rings - 1) * segs;
  for (let j = 0; j < segs; j++) {
    const a = outer + j;
    const b = outer + ((j + 1) % segs);
    idx.push(a, a + n, b, b, a + n, b + n);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function irregularRadius(r: number, amount: number, seed: number) {
  return (phi: number) => r * (1 + fbm(Math.cos(phi) * 1.4 + seed, Math.sin(phi) * 1.4, seed * 0.33, 3) * amount);
}

// ---------- vajilla (perfiles de torno)
type PlateKind = 'flat' | 'wide' | 'deep' | 'bowl' | 'ramekin';

export function plate(kind: PlateKind, r: number, color: string): { mesh: THREE.Mesh; top: number } {
  const V = (x: number, y: number) => new THREE.Vector2(Math.max(0.0005, x * r), y * r);
  let pts: THREE.Vector2[];
  let top: number;
  switch (kind) {
    case 'wide':
      pts = [V(0, 0), V(0.55, 0), V(0.58, 0.015), V(0.93, 0.05), V(1, 0.075), V(0.985, 0.088), V(0.9, 0.07), V(0.62, 0.036), V(0, 0.034)];
      top = 0.034 * r;
      break;
    case 'deep':
      pts = [V(0, 0), V(0.5, 0), V(0.53, 0.02), V(0.9, 0.14), V(1, 0.2), V(0.98, 0.212), V(0.86, 0.15), V(0.55, 0.06), V(0, 0.055)];
      top = 0.055 * r;
      break;
    case 'bowl':
      pts = [V(0, 0), V(0.42, 0), V(0.46, 0.03), V(0.78, 0.2), V(0.97, 0.46), V(1, 0.52), V(0.96, 0.525), V(0.92, 0.46), V(0.72, 0.22), V(0.42, 0.09), V(0, 0.08)];
      top = 0.08 * r;
      break;
    case 'ramekin':
      pts = [V(0, 0), V(0.9, 0), V(0.96, 0.05), V(1, 0.55), V(0.97, 0.57), V(0.9, 0.55), V(0.86, 0.1), V(0, 0.09)];
      top = 0.09 * r;
      break;
    default:
      pts = [V(0, 0), V(0.58, 0), V(0.62, 0.015), V(0.95, 0.07), V(1, 0.1), V(0.97, 0.106), V(0.7, 0.046), V(0, 0.04)];
      top = 0.04 * r;
  }
  const g = new THREE.LatheGeometry(pts, 128);
  const mesh = new THREE.Mesh(g, ceramic(color));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return { mesh, top };
}

/** Plato oval / rectangular a partir de uno redondo escalado. */
export function ovalPlate(kind: PlateKind, r: number, color: string, sx = 1.4) {
  const p = plate(kind, r, color);
  p.mesh.scale.set(sx, 1, 1);
  return p;
}

export function rectPlate(w: number, d: number, color: string): { mesh: THREE.Mesh; top: number } {
  const s = new THREE.Shape();
  const rad = 0.08;
  s.moveTo(-w / 2 + rad, -d / 2);
  s.lineTo(w / 2 - rad, -d / 2);
  s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + rad);
  s.lineTo(w / 2, d / 2 - rad);
  s.quadraticCurveTo(w / 2, d / 2, w / 2 - rad, d / 2);
  s.lineTo(-w / 2 + rad, d / 2);
  s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - rad);
  s.lineTo(-w / 2, -d / 2 + rad);
  s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + rad, -d / 2);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 4, curveSegments: 16 });
  g.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(g, ceramic(color));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return { mesh, top: 0.047 };
}

export function coaster(r: number, color: string) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.03, 96), ceramic(color, 0.6));
  mesh.position.y = 0.015;
  mesh.castShadow = mesh.receiveShadow = true;
  return { mesh, top: 0.03 };
}

// ---------- instancias
export interface Placement {
  p: THREE.Vector3;
  r?: THREE.Euler;
  s?: THREE.Vector3 | number;
  c?: THREE.ColorRepresentation;
}

export function instanced(geo: THREE.BufferGeometry, mat: THREE.Material, list: Placement[]): THREE.InstancedMesh {
  const m = new THREE.InstancedMesh(geo, mat, list.length);
  const o = new THREE.Object3D();
  const col = new THREE.Color();
  list.forEach((it, i) => {
    o.position.copy(it.p);
    o.rotation.copy(it.r ?? new THREE.Euler());
    if (typeof it.s === 'number') o.scale.setScalar(it.s);
    else if (it.s) o.scale.copy(it.s);
    else o.scale.setScalar(1);
    o.updateMatrix();
    m.setMatrixAt(i, o.matrix);
    if (it.c !== undefined) m.setColorAt(i, col.set(it.c));
  });
  m.castShadow = true;
  m.receiveShadow = true;
  m.instanceMatrix.needsUpdate = true;
  if (m.instanceColor) m.instanceColor.needsUpdate = true;
  return m;
}

export function randomEuler(r: Rng, flat = false) {
  return flat ? new THREE.Euler(range(r, -0.2, 0.2), r() * Math.PI * 2, range(r, -0.2, 0.2)) : new THREE.Euler(r() * 6.28, r() * 6.28, r() * 6.28);
}

/** Punto aleatorio dentro de un disco (distribución uniforme). */
export function inDisc(r: Rng, radius: number, sx = 1, sz = 1) {
  const a = r() * Math.PI * 2;
  const d = Math.sqrt(r()) * radius;
  return new THREE.Vector2(Math.cos(a) * d * sx, Math.sin(a) * d * sz);
}

export function pick<T>(r: Rng, arr: T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

export function shadowed<T extends THREE.Object3D>(o: T): T {
  o.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
  return o;
}

export function leafGeometry(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.35, 0.15, 0.45, 0.6, 0.12, 0.95);
  s.bezierCurveTo(0.05, 0.8, -0.05, 0.8, -0.12, 0.95);
  s.bezierCurveTo(-0.45, 0.6, -0.35, 0.15, 0, 0);
  const g = new THREE.ShapeGeometry(s, 10);
  g.rotateX(-Math.PI / 2);
  return g;
}
