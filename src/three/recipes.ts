// Recetas de escena para cada platillo del menú (docs/10 §7.5, prompts FP-01 … FP-25).
import * as THREE from 'three';
import { fbm } from './noise';
import {
  blob,
  ceramic,
  coaster,
  glassMat,
  glossy,
  inDisc,
  instanced,
  irregularRadius,
  leafGeometry,
  liquidMat,
  ovalPlate,
  phys,
  pick,
  plate,
  puddle,
  randomEuler,
  range,
  rectPlate,
  rng,
  sheet,
  shadowed,
  std,
  type Placement,
  type Rng,
} from './kit';
import { buildTaco, centerOnBox, tortillaFold } from './taco';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { bumpNoise, citrusTexture, crumbTexture, fishTexture, linenTexture, meltedCheeseTexture, mottled, tortillaTexture } from './textures';
import type { View } from './stage';

export interface SceneSpec {
  root: THREE.Group;
  view: View;
  transparent?: boolean;
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ------------------------------------------------------------------ piezas comunes
function scatter(r: Rng, n: number, radius: number, y: (x: number, z: number) => number, opts: { sx?: number; sz?: number; cx?: number; cz?: number; scale?: [number, number]; colors?: string[]; flat?: boolean; ys?: number } = {}): Placement[] {
  const out: Placement[] = [];
  for (let i = 0; i < n; i++) {
    const d = inDisc(r, radius, opts.sx ?? 1, opts.sz ?? 1);
    const x = d.x + (opts.cx ?? 0);
    const z = d.y + (opts.cz ?? 0);
    const s = range(r, ...(opts.scale ?? [0.8, 1.2]));
    out.push({
      p: V(x, y(x, z), z),
      r: randomEuler(r, opts.flat),
      s: opts.ys ? V(s, s * opts.ys, s) : s,
      c: opts.colors ? pick(r, opts.colors) : undefined,
    });
  }
  return out;
}

function sesame(r: Rng, n: number, radius: number, y: (x: number, z: number) => number, cx = 0, cz = 0, color = '#EFE3C4') {
  return instanced(blob(0.012, 0.005, 0.007, 0.1, 3, 1), std(color, 0.55), scatter(r, n, radius, y, { cx, cz, flat: true, colors: [color, '#E2CFA2', '#F6EDD6'] }));
}

function crumbles(r: Rng, n: number, radius: number, y: (x: number, z: number) => number, cx = 0, cz = 0, size = 0.035, color = '#F3EEDC') {
  return instanced(blob(size, size * 0.8, size, 0.45, 5, 1, 2.2), std(color, 0.75), scatter(r, n, radius, y, { cx, cz, colors: [color, '#EFE8D2', '#FBF7EA'] }));
}

function herbs(r: Rng, n: number, radius: number, y: (x: number, z: number) => number, cx = 0, cz = 0, size: [number, number] = [0.05, 0.08], color = '#3F7A2C') {
  return instanced(leafGeometry(), std('#ffffff', 0.55, { side: THREE.DoubleSide }), scatter(r, n, radius, y, { cx, cz, scale: size, flat: true, colors: [color, '#4C8A35', '#356A25'] }));
}

function onionSlivers(r: Rng, n: number, radius: number, y: (x: number, z: number) => number, cx = 0, cz = 0, color = '#D8467F', size = 0.08) {
  const mat = phys(color, { roughness: 0.25, transmission: 0.3, thickness: 0.02, clearcoat: 0.7 });
  const list = scatter(r, n, radius, y, { cx, cz, scale: [0.8, 1.2] }).map((p) => ({ ...p, r: new THREE.Euler(Math.PI / 2 + range(r, -0.3, 0.3), range(r, -0.3, 0.3), r() * 6.28) }));
  return instanced(new THREE.TorusGeometry(size, size * 0.13, 8, 26, Math.PI * 0.9), mat, list);
}

function limeWedge(seed = 1) {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.16, 40, 24, 0, Math.PI / 1.6, 0, Math.PI / 2);
  const rind = new THREE.Mesh(geo, std('#5E8F2A', 0.45, { side: THREE.DoubleSide }));
  const faceGeo = new THREE.CircleGeometry(0.16, 40, 0, Math.PI / 1.6);
  const faceMat = std('#ffffff', 0.35, { map: citrusTexture('#CFE07A', '#6E9A2E'), side: THREE.DoubleSide });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.rotation.x = -Math.PI / 2;
  g.add(rind, face);
  g.rotation.set(Math.PI / 2, 0, seed);
  return shadowed(g);
}

function limeWheel(r = 0.14, color = '#CFE07A') {
  const g = new THREE.Group();
  const side = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.03, 48), std('#6A9A2C', 0.45));
  const face = new THREE.Mesh(new THREE.CircleGeometry(r * 0.98, 48), std('#ffffff', 0.3, { map: citrusTexture(color, '#6E9A2E') }));
  face.rotation.x = -Math.PI / 2;
  face.position.y = 0.016;
  g.add(side, face);
  return shadowed(g);
}

// ------------------------------------------------------------------ bebidas
function glass(opts: { r: number; h: number; taper?: number; wall?: number }) {
  const { r, h } = opts;
  const t = opts.taper ?? 1.08;
  const w = opts.wall ?? 0.012;
  const pts = [
    new THREE.Vector2(0.0005, 0),
    new THREE.Vector2(r, 0),
    new THREE.Vector2(r * t, h),
    new THREE.Vector2(r * t - w, h),
    new THREE.Vector2(r - w, 0.04),
    new THREE.Vector2(0.0005, 0.04),
  ];
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), glassMat());
  mesh.castShadow = true;
  return mesh;
}

function liquid(r: number, h: number, fill: number, taper: number, mat: THREE.Material) {
  const top = h * fill;
  const rt = r + (r * taper - r) * fill;
  const pts = [new THREE.Vector2(0.0005, 0.042), new THREE.Vector2(r - 0.016, 0.042), new THREE.Vector2(rt - 0.017, top), new THREE.Vector2(0.0005, top)];
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), mat);
  m.castShadow = true;
  return m;
}

function iceCubes(r: Rng, n: number, rad: number, y0: number, y1: number, size = 0.1) {
  const g = new THREE.Group();
  const mat = phys('#ffffff', { transmission: 0.9, roughness: 0.12, thickness: 0.2, ior: 1.31 });
  for (let i = 0; i < n; i++) {
    const geo = new THREE.BoxGeometry(size, size, size, 3, 3, 3);
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < p.count; k++) {
      const v = new THREE.Vector3().fromBufferAttribute(p, k);
      const len = v.length();
      v.multiplyScalar(1 - 0.08 * (len / (size * 0.87)));
      p.setXYZ(k, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    const d = inDisc(r, rad);
    m.position.set(d.x, range(r, y0, y1), d.y);
    m.rotation.copy(randomEuler(r));
    g.add(m);
  }
  return g;
}

function drink(opts: {
  seed: number;
  color: string;
  coasterColor: string;
  transmission?: number;
  roughness?: number;
  r?: number;
  h?: number;
  fill?: number;
  ice?: number;
  taper?: number;
  foam?: string;
  bubbles?: boolean;
}): THREE.Group {
  const r = rng(opts.seed);
  const g = new THREE.Group();
  const R = opts.r ?? 0.3;
  const H = opts.h ?? 1.25;
  const taper = opts.taper ?? 1.08;
  const fill = opts.fill ?? 0.82;
  const c = coaster(0.62, opts.coasterColor);
  g.add(c.mesh);
  const gl = new THREE.Group();
  gl.position.y = c.top;
  gl.add(glass({ r: R, h: H, taper }));
  gl.add(liquid(R, H, fill, taper, liquidMat(opts.color, opts.transmission ?? 0.55, opts.roughness ?? 0.08)));
  if (opts.ice) gl.add(iceCubes(r, opts.ice, R * 0.35, H * fill * 0.45, H * fill * 0.92, R * 0.52));
  if (opts.foam) {
    const top = H * fill;
    const rt = R + (R * taper - R) * fill - 0.018;
    const foamGeo = new THREE.CylinderGeometry(rt, rt, 0.16, 64, 4);
    const p = foamGeo.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < p.count; k++) {
      const y = p.getY(k);
      if (y > 0.07) p.setY(k, y + fbm(p.getX(k) * 9, p.getZ(k) * 9, 1, 3) * 0.03);
    }
    foamGeo.computeVertexNormals();
    const foam = new THREE.Mesh(foamGeo, std(opts.foam, 0.85, { bumpMap: bumpNoise('foam', 60), bumpScale: 2 }));
    foam.position.y = top + 0.06;
    gl.add(foam);
  }
  if (opts.bubbles) {
    const list: Placement[] = [];
    for (let i = 0; i < 70; i++) {
      const d = inDisc(r, R * 0.8);
      list.push({ p: V(d.x, range(r, 0.08, H * fill * 0.9), d.y), s: range(r, 0.4, 1) });
    }
    gl.add(instanced(new THREE.SphereGeometry(0.008, 8, 6), phys('#FFF6D8', { roughness: 0.05, transmission: 0.6 }), list));
  }
  g.add(gl);
  g.userData.glassTop = c.top + H;
  g.userData.liquidTop = c.top + H * fill;
  g.userData.R = R;
  shadowed(g);
  // El vidrio y el líquido no proyectan sombra opaca (se veía un rectángulo gris):
  // en su lugar, una sombra suave teñida del color de la bebida, hacia donde cae la luz.
  gl.traverse((o) => (o.castShadow = false));
  g.add(glassShadow(R * taper, H * fill * 0.95, opts.color, c.top));
  return g;
}

let shadowTex: THREE.CanvasTexture | null = null;
function softShadowTexture() {
  if (shadowTex) return shadowTex;
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 128;
  const ctx = cv.getContext('2d')!;
  // mancha alargada: más densa junto a la base del vaso (izquierda) y difusa hacia la punta
  const grd = ctx.createLinearGradient(0, 0, 256, 0);
  grd.addColorStop(0, 'rgba(255,255,255,0.95)');
  grd.addColorStop(0.55, 'rgba(255,255,255,0.45)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grd;
  ctx.filter = 'blur(10px)';
  ctx.beginPath();
  ctx.ellipse(118, 64, 104, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  shadowTex = new THREE.CanvasTexture(cv);
  return shadowTex;
}

function glassShadow(radius: number, height: number, tint: string, y: number) {
  // dirección de la luz principal proyectada al suelo (ver stage.ts: key en -5.5, 6.5, -1.2)
  const dir = new THREE.Vector2(5.5, 1.2).normalize();
  const len = height * 0.85 + radius * 2;
  const color = new THREE.Color(tint).lerp(new THREE.Color('#3A2A1C'), 0.55);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(len, radius * 2.3),
    new THREE.MeshBasicMaterial({ map: softShadowTexture(), color, transparent: true, opacity: 0.5, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.rotation.z = -Math.atan2(dir.y, dir.x);
  m.position.set(dir.x * (len / 2 - radius * 0.9), y + 0.003, dir.y * (len / 2 - radius * 0.9));
  m.renderOrder = -1;
  return m;
}

// ------------------------------------------------------------------ recetas
type Recipe = () => SceneSpec;

const recipes: Record<string, Recipe> = {
  'tostada-de-atun': () => {
    const r = rng(101);
    const g = new THREE.Group();
    const p = plate('flat', 1.05, '#D8C3AE');
    g.add(p.mesh);
    const base = p.top + 0.005;
    const tostadaGeo = sheet({
      radius: irregularRadius(0.66, 0.03, 2),
      thickness: 0.035,
      map: (x, z) => V(x, base + 0.035 + fbm(x * 3, z * 3, 2, 3) * 0.018, z),
    });
    g.add(new THREE.Mesh(tostadaGeo, std('#ffffff', 0.72, { map: tortillaTexture('golden'), bumpMap: bumpNoise('tostada', 40), bumpScale: 2 })));
    const top = base + 0.06;
    // atún
    const tuna = scatter(r, 26, 0.4, () => top + 0.045, { colors: ['#A51C33', '#B5243A', '#951A2C', '#C0304A'], scale: [0.85, 1.15] });
    tuna.forEach((t, i) => {
      if (i > 17) t.p.y += 0.07;
    });
    tuna.forEach((t) => (t.r = new THREE.Euler(range(r, -0.25, 0.25), r() * 6.28, range(r, -0.25, 0.25))));
    g.add(instanced(new RoundedBoxGeometry(0.1, 0.085, 0.1, 3, 0.018), phys('#ffffff', { map: mottled('atun', '#B0213A', '#7A1024', 14), roughness: 0.26, clearcoat: 0.9, clearcoatRoughness: 0.18 }), tuna));
    // aguacate en abanico
    const av: Placement[] = [];
    for (let i = 0; i < 6; i++) {
      const a = 2.2 + i * 0.26;
      av.push({ p: V(0.05 + Math.cos(a) * 0.18, top + 0.1 + i * 0.012, 0.05 + Math.sin(a) * 0.18), r: new THREE.Euler(0.05, -a, 0.12), s: 1 });
    }
    g.add(instanced(blob(0.2, 0.02, 0.055, 0.06, 9, 3, 0.8), phys('#ffffff', { map: mottled('aguacate', '#C8D878', '#6E8E2E', 3), roughness: 0.32, clearcoat: 0.6 }), av));
    // serrano
    const rings = scatter(r, 10, 0.4, () => top + 0.14, { flat: true }).map((q) => ({ ...q, r: new THREE.Euler(Math.PI / 2 + range(r, -0.3, 0.3), 0, range(r, -0.3, 0.3)) }));
    g.add(instanced(new THREE.TorusGeometry(0.03, 0.009, 8, 20), glossy('#4E8F2F', 0.3), rings));
    // ralladura + cilantro
    g.add(instanced(new THREE.BoxGeometry(0.02, 0.004, 0.006), std('#D9D25A', 0.5), scatter(r, 50, 0.45, () => top + 0.16, { flat: true })));
    g.add(herbs(r, 7, 0.35, () => top + 0.17, 0, 0, [0.05, 0.07]));
    return { root: shadowed(g), view: { type: 'top', width: 1.85, rotate: 0.2 } };
  },

  'queso-fundido-al-mezcal': () => {
    const r = rng(102);
    const g = new THREE.Group();
    const board = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.06, 96), ceramic('#1E1B19', 0.55));
    board.position.y = 0.03;
    g.add(board);
    // sartén
    const sk = new THREE.Group();
    const skPts = [V(0.0005, 0, 0), V(0.52, 0, 0), V(0.6, 0.18, 0), V(0.57, 0.18, 0), V(0.5, 0.03, 0), V(0.0005, 0.03, 0)].map((v) => new THREE.Vector2(v.x, v.y));
    const iron = std('#26221F', 0.55, { metalness: 0.55 });
    sk.add(new THREE.Mesh(new THREE.LatheGeometry(skPts, 96), iron));
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.1), iron);
    handle.position.set(0.8, 0.14, 0);
    handle.rotation.z = 0.12;
    sk.add(handle);
    // queso fundido burbujeante
    const cheeseGeo = puddle(0.54, 0.09, 4, 0.02, 96);
    const pp = cheeseGeo.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < pp.count; k++) {
      const x = pp.getX(k);
      const z = pp.getZ(k);
      pp.setY(k, pp.getY(k) + Math.max(0, fbm(x * 6, z * 6, 3, 3)) * 0.05);
    }
    cheeseGeo.computeVertexNormals();
    const cheese = new THREE.Mesh(cheeseGeo, phys('#ffffff', { map: meltedCheeseTexture(), roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25 }));
    cheese.position.y = 0.05;
    sk.add(cheese);
    // rajas de poblano
    const rajas: Placement[] = [];
    for (let i = 0; i < 9; i++) {
      const d = inDisc(r, 0.35);
      rajas.push({ p: V(d.x, 0.17, d.y), r: new THREE.Euler(0, r() * 6.28, 0), s: V(range(r, 0.8, 1.2), 1, 1) });
    }
    sk.add(instanced(new THREE.TorusGeometry(0.16, 0.02, 8, 24, 1.2), glossy('#2F5A22', 0.28), rajas.map((q) => ({ ...q, r: new THREE.Euler(Math.PI / 2, 0, (q.r as THREE.Euler).y) }))));
    sk.position.set(-0.22, 0.06, -0.12);
    g.add(sk);
    // tortillas en lino
    const linen = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.62), std('#ffffff', 0.9, { map: linenTexture('#E6DCCB') }));
    linen.position.set(0.62, 0.07, 0.62);
    linen.rotation.y = 0.5;
    g.add(linen);
    for (let i = 0; i < 3; i++) {
      const t = new THREE.Mesh(
        sheet({ radius: irregularRadius(0.26, 0.03, i + 1), thickness: 0.012, rings: 12, segs: 64, map: (x, z) => V(x, fbm(x * 3, z * 3, i, 2) * 0.01, z) }),
        std('#ffffff', 0.8, { map: tortillaTexture('yellow') }),
      );
      t.position.set(0.62 + i * 0.02, 0.09 + i * 0.016, 0.62 - i * 0.015);
      g.add(t);
    }
    return { root: shadowed(g), view: { type: 'tq', width: 2.3, elevation: 38, azimuth: -12, targetY: 0.12 } };
  },

  'esquites-cremosos': () => {
    const r = rng(103);
    const g = new THREE.Group();
    const b = plate('bowl', 0.66, '#EFE7DA');
    g.add(b.mesh);
    const mound = (x: number, z: number) => 0.3 + 0.12 * (1 - (x * x + z * z) / 0.3);
    const kernels = scatter(r, 260, 0.52, (x, z) => mound(x, z) + range(r, -0.03, 0.03), {
      colors: ['#E9B63C', '#E3A935', '#F0C24C', '#C98A2B', '#9C6524', '#D86A45'],
      scale: [0.8, 1.2],
    });
    g.add(instanced(blob(0.03, 0.022, 0.026, 0.15, 14, 2), phys('#ffffff', { roughness: 0.35, clearcoat: 0.5 }), kernels));
    // crema de chile ancho
    const cream = scatter(r, 14, 0.3, (x, z) => mound(x, z) + 0.04, { scale: [0.8, 1.3], ys: 0.35 });
    g.add(instanced(blob(0.07, 0.07, 0.07, 0.25, 15, 3), glossy('#C0673E', 0.3), cream));
    g.add(crumbles(r, 24, 0.32, (x, z) => mound(x, z) + 0.07, 0, 0, 0.028));
    g.add(sesame(r, 30, 0.35, (x, z) => mound(x, z) + 0.08, 0, 0, '#9B2A1A'));
    const lime = limeWedge(0.6);
    lime.position.set(0.72, 0.1, 0.42);
    g.add(lime);
    return { root: shadowed(g), view: { type: 'tq', width: 1.9, elevation: 34, azimuth: -16, targetY: 0.2 } };
  },

  'coliflor-rostizada': () => {
    const r = rng(104);
    const g = new THREE.Group();
    const p = plate('wide', 1.1, '#1E1B19');
    g.add(p.mesh);
    const base = p.top;
    // mole ligero en trazo
    const sw = new THREE.Mesh(puddle(0.5, 0.025, 7, 0.22), glossy('#6B2A18', 0.25));
    sw.scale.set(1.4, 1, 0.7);
    sw.position.set(-0.05, base, 0.05);
    sw.rotation.y = 0.35;
    g.add(sw);
    // “steak” de coliflor
    const steak = new THREE.Group();
    const bodyGeo = blob(0.44, 0.07, 0.34, 0.2, 16, 4, 1.4);
    steak.add(new THREE.Mesh(bodyGeo, std('#ffffff', 0.7, { map: mottled('coliflor', '#E8D6AE', '#9C6A30', 5) })));
    const florets = scatter(r, 60, 0.36, (x, z) => 0.06 + Math.max(0, 0.03 * (1 - (x * x + z * z) / 0.15)), { sx: 1.2, sz: 0.9, colors: ['#E9D8AE', '#D8B27A', '#B07A3C', '#8C5A28', '#F1E4C4'], scale: [0.7, 1.3] });
    steak.add(instanced(blob(0.06, 0.05, 0.06, 0.35, 17, 2, 2.4), std('#ffffff', 0.72), florets));
    steak.position.set(0, base + 0.06, 0);
    steak.rotation.y = -0.3;
    g.add(steak);
    const y = () => base + 0.17;
    g.add(instanced(blob(0.03, 0.01, 0.018, 0.1, 18, 2), std('#6F8A3E', 0.5), scatter(r, 16, 0.42, y, { flat: true, sx: 1.2 })));
    g.add(sesame(r, 40, 0.45, y));
    g.add(herbs(r, 9, 0.4, () => base + 0.19, 0, 0, [0.06, 0.09], '#4E8A33'));
    return { root: shadowed(g), view: { type: 'top', width: 2.3, rotate: -0.15 } };
  },

  'taco-de-short-rib': () => {
    const g = new THREE.Group();
    const p = plate('flat', 0.95, '#D8C3AE');
    g.add(p.mesh);
    const taco = buildTaco({ seed: 7 });
    taco.scale.setScalar(0.78);
    taco.position.set(0, p.top + 0.005, 0);
    taco.rotation.y = -0.45;
    g.add(taco);
    return { root: shadowed(g), view: { type: 'tq', width: 2.0, elevation: 30, azimuth: -20, targetY: 0.18 } };
  },

  'taco-de-camaron': () => {
    const r = rng(106);
    const g = new THREE.Group();
    const p = plate('flat', 0.95, '#EFE7DA');
    g.add(p.mesh);
    const taco = buildTaco({ seed: 9, kind: 'camaron' });
    taco.scale.setScalar(0.78);
    taco.position.set(-0.05, p.top + 0.005, -0.05);
    taco.rotation.y = -0.4;
    g.add(taco);
    const wheel = limeWheel(0.13);
    wheel.position.set(0.55, p.top + 0.03, 0.45);
    wheel.rotation.set(0.1, 0, 0.12);
    g.add(wheel);
    void r;
    return { root: shadowed(g), view: { type: 'tq', width: 2.0, elevation: 44, azimuth: -24, targetY: 0.16 } };
  },

  'quesadilla-de-hongos': () => {
    const r = rng(107);
    const g = new THREE.Group();
    const p = plate('flat', 1.0, '#EFE7DA');
    g.add(p.mesh);
    // media luna de maíz azul
    const q = new THREE.Group();
    const half = sheet({
      radius: (phi) => (phi <= Math.PI ? 0.62 * (1 + fbm(Math.cos(phi), Math.sin(phi), 3, 2) * 0.04) : 0.0001 + 0.62 * Math.abs(Math.sin(phi)) * 0),
      thickness: 0.06,
      rings: 22,
      segs: 120,
      // abombada: más alta al centro de la media luna, baja hacia el borde curvo y el recto
      map: (x, z) => {
        const d = Math.min(1, Math.hypot(x, z) / 0.62);
        const edge = Math.min(1, Math.max(0, z) / 0.12);
        return V(x, 0.03 + 0.14 * (1 - d * d) * edge + fbm(x * 3, z * 3, 5, 2) * 0.014, z);
      },
    });
    q.add(new THREE.Mesh(half, std('#ffffff', 0.72, { map: tortillaTexture('blue'), bumpMap: bumpNoise('azul', 30), bumpScale: 1.5, side: THREE.DoubleSide })));
    // hilos de queso Oaxaca asomando por el borde recto
    for (let i = 0; i < 11; i++) {
      const x0 = range(r, -0.5, 0.5);
      const curve = new THREE.CatmullRomCurve3([V(x0, 0.06, 0.0), V(x0 + range(r, -0.04, 0.04), 0.04, -0.05), V(x0 + range(r, -0.06, 0.06), 0.012, -0.1 - r() * 0.06)]);
      q.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.012 + r() * 0.008, 8), glossy('#F5ECD6', 0.3)));
    }
    q.add(instanced(blob(0.05, 0.02, 0.04, 0.3, 19, 2), glossy('#7A5230', 0.35), scatter(r, 12, 0.46, () => 0.035, { sx: 1, sz: 0.12, cz: -0.03 })));
    q.position.set(-0.04, p.top, 0.26);
    q.scale.setScalar(1.12);
    q.rotation.y = Math.PI + 0.3; // borde recto (queso y hongos) hacia la cámara
    g.add(q);
    // salsa verde en ramequín
    const rk = plate('ramekin', 0.22, '#EFE7DA');
    rk.mesh.position.set(0.5, p.top, 0.56);
    g.add(rk.mesh);
    const salsa = new THREE.Mesh(new THREE.CircleGeometry(0.19, 48), glossy('#2C5F1F', 0.18));
    salsa.rotation.x = -Math.PI / 2;
    salsa.position.set(0.5, p.top + 0.09, 0.56);
    g.add(herbs(r, 7, 0.16, () => p.top + 0.02, -0.4, 0.5, [0.06, 0.09]));
    g.add(salsa);
    return { root: shadowed(g), view: { type: 'top', width: 2.15, rotate: -0.25 } };
  },

  'sopes-de-birria': () => {
    const r = rng(108);
    const g = new THREE.Group();
    const p = rectPlate(2.1, 0.95, '#D8C3AE');
    g.add(p.mesh);
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Group();
      const pts = [0, 0.26, 0.28, 0.285, 0.24, 0].map((x, k) => new THREE.Vector2(Math.max(0.0005, x), [0, 0, 0.05, 0.11, 0.1, 0.07][k]));
      s.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 72), std('#ffffff', 0.8, { map: tortillaTexture('yellow'), bumpMap: bumpNoise('sope', 22), bumpScale: 1.4 })));
      const beans = new THREE.Mesh(puddle(0.22, 0.02, i + 3, 0.05), glossy('#3A2218', 0.45));
      beans.position.y = 0.075;
      s.add(beans);
      const shreds = scatter(r, 45, 0.18, () => 0.11 + r() * 0.05, { colors: ['#7A2E1A', '#8E3A1E', '#5E2413', '#A0452A'] });
      s.add(instanced(blob(0.07, 0.018, 0.022, 0.4, 22, 2), phys('#ffffff', { roughness: 0.38, clearcoat: 0.6 }), shreds));
      s.add(crumbles(r, 14, 0.17, () => 0.17 + r() * 0.02, 0, 0, 0.024));
      s.add(onionSlivers(r, 6, 0.14, () => 0.2, 0, 0, '#D8467F', 0.05));
      s.position.set(-0.64 + i * 0.64, p.top, range(r, -0.04, 0.04));
      g.add(s);
    }
    return { root: shadowed(g), view: { type: 'top', width: 2.2, rotate: 0.0 } };
  },

  'mole-de-pollo': () => {
    const r = rng(109);
    const g = new THREE.Group();
    const p = plate('wide', 1.1, '#EFE7DA');
    g.add(p.mesh);
    const pool = new THREE.Mesh(puddle(0.52, 0.04, 11, 0.1), glossy('#2E1611', 0.22));
    pool.position.set(-0.1, p.top, 0.02);
    g.add(pool);
    const chicken = new THREE.Mesh(blob(0.36, 0.14, 0.26, 0.18, 23, 4, 1.3), glossy('#3A1C13', 0.28));
    chicken.position.set(-0.12, p.top + 0.1, 0.02);
    chicken.rotation.y = 0.4;
    g.add(chicken);
    g.add(sesame(r, 70, 0.28, () => p.top + 0.23, -0.12, 0.02));
    // arroz rojo
    const rice = new THREE.Mesh(blob(0.26, 0.12, 0.24, 0.12, 24, 4, 2), std('#ffffff', 0.85, { map: mottled('arroz-rojo', '#D9814F', '#B45A30', 30), bumpMap: bumpNoise('arroz', 90), bumpScale: 3 }));
    rice.position.set(0.52, p.top + 0.05, -0.1);
    g.add(rice);
    g.add(herbs(r, 4, 0.1, () => p.top + 0.18, 0.52, -0.1, [0.05, 0.07]));
    return { root: shadowed(g), view: { type: 'top', width: 2.3, rotate: 0.1 } };
  },

  'pescado-a-la-talla': () => {
    const r = rng(110);
    const g = new THREE.Group();
    const p = ovalPlate('flat', 0.9, '#1E1B19', 1.5);
    g.add(p.mesh);
    // silueta del pescado abierto (x: cabeza en -0.95 → cola en 0.95; y: ancho)
    const s = new THREE.Shape();
    s.moveTo(-0.97, 0);
    s.bezierCurveTo(-0.95, 0.2, -0.72, 0.36, -0.45, 0.4);
    s.bezierCurveTo(-0.1, 0.44, 0.35, 0.36, 0.58, 0.16);
    s.bezierCurveTo(0.64, 0.1, 0.68, 0.07, 0.72, 0.07);
    s.bezierCurveTo(0.8, 0.18, 0.9, 0.3, 0.98, 0.34);
    s.bezierCurveTo(0.93, 0.16, 0.9, 0.05, 0.9, 0);
    s.bezierCurveTo(0.9, -0.05, 0.93, -0.16, 0.98, -0.34);
    s.bezierCurveTo(0.9, -0.3, 0.8, -0.18, 0.72, -0.07);
    s.bezierCurveTo(0.68, -0.07, 0.64, -0.1, 0.58, -0.16);
    s.bezierCurveTo(0.35, -0.36, -0.1, -0.44, -0.45, -0.4);
    s.bezierCurveTo(-0.72, -0.36, -0.95, -0.2, -0.97, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 5, curveSegments: 48 });
    // mapeo planar (vista cenital) y un ligero abombado hacia la espina
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const uv: number[] = [];
    for (let k = 0; k < pos.count; k++) {
      const x = pos.getX(k);
      const y = pos.getY(k);
      const z = pos.getZ(k);
      if (z > 0.02) pos.setZ(k, z + Math.max(0, 0.05 - Math.abs(y) * 0.1) * (1 - Math.abs(x)));
      uv.push((x + 1) / 2, 0.5 - y / 0.9);
    }
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    const fish = new THREE.Mesh(geo, std('#ffffff', 0.5, { map: fishTexture(), bumpMap: bumpNoise('fish', 40), bumpScale: 1.4 }));
    fish.rotation.x = -Math.PI / 2;
    fish.position.set(-0.02, p.top + 0.005, 0);
    fish.rotation.z = 0.06;
    g.add(fish);
    const top = p.top + 0.13;
    g.add(herbs(r, 14, 0.5, () => top, 0.05, 0.02, [0.05, 0.08]));
    g.add(onionSlivers(r, 7, 0.45, () => top, 0.05, 0, '#D8467F', 0.05));
    const lime = limeWheel(0.14);
    lime.position.set(0.38, p.top + 0.02, 0.62);
    g.add(lime);
    const lime2 = limeWheel(0.13);
    lime2.position.set(0.14, p.top + 0.045, 0.66);
    lime2.rotation.set(0.12, 0, -0.1);
    g.add(lime2);
    return { root: shadowed(g), view: { type: 'top', width: 2.2, rotate: Math.PI / 2 } };
  },

  'costilla-de-res': () => {
    const r = rng(111);
    const g = new THREE.Group();
    const p = plate('deep', 1.05, '#D8C3AE');
    g.add(p.mesh);
    const jus = new THREE.Mesh(puddle(0.62, 0.03, 12, 0.08), glossy('#7A2615', 0.2));
    jus.position.y = p.top;
    g.add(jus);
    const meat = new THREE.Mesh(blob(0.44, 0.24, 0.3, 0.16, 26, 5, 1.5), phys('#ffffff', { map: mottled('costilla', '#4A2013', '#2A120B', 8), roughness: 0.34, clearcoat: 0.8, clearcoatRoughness: 0.25 }));
    meat.position.set(-0.05, p.top + 0.2, 0.02);
    meat.rotation.y = 0.3;
    g.add(meat);
    const bone = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.42, 8, 24), std('#E9DEC8', 0.55));
    bone.rotation.z = Math.PI / 2;
    bone.rotation.y = 0.3;
    bone.position.set(0.3, p.top + 0.26, -0.1);
    g.add(bone);
    for (let i = 0; i < 2; i++) {
      const on = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.7, 6, 20), std('#ffffff', 0.5, { map: mottled('cebollin', '#6E9A3E', '#2B2A18', 7) }));
      on.rotation.set(Math.PI / 2, 0, 0.9 + i * 0.12);
      on.position.set(-0.22 + i * 0.1, p.top + 0.06 + i * 0.04, 0.32 - i * 0.05);
      g.add(on);
    }
    g.add(herbs(r, 5, 0.18, () => p.top + 0.44, -0.05, 0.02, [0.05, 0.07]));
    return { root: shadowed(g), view: { type: 'tq', width: 2.2, elevation: 35, azimuth: -18, targetY: 0.2 } };
  },

  'enchiladas-de-mole': () => {
    const r = rng(112);
    const g = new THREE.Group();
    const p = ovalPlate('flat', 0.92, '#EFE7DA', 1.45);
    g.add(p.mesh);
    for (let i = 0; i < 3; i++) {
      const e = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.8, 8, 32), std('#ffffff', 0.8, { map: tortillaTexture('yellow') }));
      e.rotation.z = Math.PI / 2;
      e.position.set(0, p.top + 0.12, -0.3 + i * 0.3);
      g.add(e);
    }
    const drape = new THREE.Mesh(blob(0.74, 0.14, 0.56, 0.08, 27, 5, 1.4), glossy('#4A1E14', 0.26));
    drape.position.set(0, p.top + 0.16, 0);
    g.add(drape);
    // crema en zigzag
    const zig: THREE.Vector3[] = [];
    for (let k = 0; k <= 12; k++) zig.push(V(-0.55 + k * 0.09, p.top + 0.3, k % 2 ? 0.28 : -0.28));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(zig), 120, 0.014, 8), glossy('#F4EEE2', 0.35)));
    g.add(sesame(r, 60, 0.5, () => p.top + 0.31, 0, 0));
    const rings = scatter(r, 6, 0.4, () => p.top + 0.32, { flat: true }).map((q) => ({ ...q, r: new THREE.Euler(Math.PI / 2, 0, 0) }));
    g.add(instanced(new THREE.TorusGeometry(0.06, 0.008, 8, 28), phys('#F4EFE8', { roughness: 0.3, transmission: 0.3 }), rings));
    return { root: shadowed(g), view: { type: 'top', width: 2.15, rotate: Math.PI / 2 + 0.1 } };
  },

  'pato-en-adobo': () => {
    const r = rng(113);
    const g = new THREE.Group();
    const p = plate('wide', 1.05, '#1E1B19');
    g.add(p.mesh);
    const sauce = new THREE.Mesh(puddle(0.4, 0.025, 13, 0.2), glossy('#7A1F12', 0.22));
    sauce.position.set(-0.1, p.top, 0.05);
    g.add(sauce);
    const leg = new THREE.Group();
    leg.add(new THREE.Mesh(blob(0.36, 0.14, 0.22, 0.14, 28, 5, 1.3), phys('#ffffff', { map: mottled('pato', '#9A3A1F', '#4E160C', 7), roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.18 })));
    const bone = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.28, 6, 16), std('#EFE4D0', 0.5));
    bone.rotation.z = Math.PI / 2;
    bone.position.set(0.44, 0.02, 0.04);
    leg.add(bone);
    leg.position.set(-0.1, p.top + 0.11, 0.05);
    leg.rotation.y = -0.5;
    g.add(leg);
    const camote = scatter(r, 6, 0.26, () => p.top + 0.06, { cx: 0.38, cz: -0.38, colors: ['#D9772E', '#C9651F', '#E08A3F'] });
    g.add(instanced(blob(0.08, 0.06, 0.07, 0.25, 29, 3), glossy('#ffffff', 0.35), camote));
    const petals = scatter(r, 5, 0.3, () => p.top + 0.05, { cx: -0.35, cz: -0.45 });
    g.add(instanced(new THREE.SphereGeometry(0.08, 24, 12, 0, Math.PI * 1.2, 0, Math.PI / 3), std('#ffffff', 0.5, { map: mottled('petal', '#E7D9C0', '#4A2E1A', 6), side: THREE.DoubleSide }), petals));
    g.add(herbs(r, 4, 0.12, () => p.top + 0.28, -0.12, 0.05, [0.05, 0.07]));
    return { root: shadowed(g), view: { type: 'top', width: 2.2, rotate: -0.2 } };
  },

  'arroz-cremoso-de-hongos': () => {
    const r = rng(114);
    const g = new THREE.Group();
    const b = plate('deep', 0.95, '#EFE7DA');
    g.add(b.mesh);
    const rice = new THREE.Mesh(puddle(0.62, 0.1, 30, 0.04), std('#ffffff', 0.55, { map: mottled('risotto', '#EFE2C2', '#D9C38F', 24), bumpMap: bumpNoise('risotto', 120), bumpScale: 4 }));
    rice.position.y = b.top + 0.02;
    g.add(rice);
    const grains = scatter(r, 260, 0.55, () => b.top + 0.1 + r() * 0.02, { colors: ['#F1E6C8', '#E8D9B2', '#F6EFD9'] });
    g.add(instanced(blob(0.018, 0.009, 0.009, 0.1, 31, 1), glossy('#ffffff', 0.4), grains));
    for (let i = 0; i < 7; i++) {
      const m = new THREE.Group();
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2.2), std('#ffffff', 0.5, { map: mottled('hongo', '#A06A33', '#4E2F16', 9) }));
      cap.scale.y = 0.55;
      m.add(cap);
      const d = inDisc(r, 0.35);
      m.position.set(d.x, b.top + 0.12, d.y);
      m.rotation.set(range(r, -0.4, 0.4), r() * 6.28, range(r, -0.4, 0.4));
      g.add(m);
    }
    g.add(herbs(r, 7, 0.4, () => b.top + 0.17, 0, 0, [0.06, 0.09], '#4A7F30'));
    g.add(instanced(new THREE.BoxGeometry(0.1, 0.004, 0.04), std('#F4EAD0', 0.6), scatter(r, 10, 0.35, () => b.top + 0.18, { flat: true })));
    return { root: shadowed(g), view: { type: 'tq', width: 2.0, elevation: 36, azimuth: -14, targetY: 0.1 } };
  },

  'cerdo-en-salsa-de-chile': () => {
    const r = rng(115);
    const g = new THREE.Group();
    const b = plate('bowl', 0.78, '#1E1B19');
    g.add(b.mesh);
    const sauce = new THREE.Mesh(puddle(0.62, 0.03, 32, 0.02), glossy('#7A1C0E', 0.24));
    sauce.position.y = 0.26;
    g.add(sauce);
    const chunks = scatter(r, 9, 0.4, () => 0.3 + r() * 0.03, { colors: ['#7A3A22', '#8C4428', '#6A301C'], scale: [0.9, 1.2] });
    g.add(instanced(blob(0.11, 0.08, 0.1, 0.3, 33, 3, 1.8), glossy('#ffffff', 0.3), chunks));
    for (let i = 0; i < 2; i++) {
      const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.2, 6, 16), glossy('#B3261A', 0.25));
      c.rotation.set(Math.PI / 2, 0, 0.6 + i * 1.8);
      c.position.set(-0.15 + i * 0.3, 0.36, 0.12 - i * 0.2);
      g.add(c);
    }
    g.add(herbs(r, 5, 0.3, () => 0.38, 0, 0, [0.05, 0.07]));
    return { root: shadowed(g), view: { type: 'top', width: 1.95, rotate: 0.3 } };
  },

  'pastel-de-elote': () => {
    const g = new THREE.Group();
    const p = plate('flat', 0.85, '#D8C3AE');
    g.add(p.mesh);
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.72, -0.26);
    s.quadraticCurveTo(0.78, 0, 0.72, 0.26);
    s.lineTo(0, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 4, curveSegments: 24 });
    geo.rotateX(-Math.PI / 2);
    const cake = new THREE.Mesh(geo, std('#ffffff', 0.8, { map: crumbTexture('#E6B44E', 'elote'), bumpMap: bumpNoise('miga', 80), bumpScale: 3 }));
    cake.position.set(-0.35, p.top + 0.02, 0.0);
    g.add(cake);
    const topCrust = new THREE.Mesh(new THREE.ShapeGeometry(s, 24), std('#B87A2E', 0.6));
    topCrust.rotation.x = -Math.PI / 2;
    topCrust.position.set(-0.35, p.top + 0.385, 0);
    g.add(topCrust);
    const caj = new THREE.Mesh(puddle(0.2, 0.035, 34, 0.25), glossy('#8E4A14', 0.15));
    caj.position.set(0.02, p.top + 0.39, 0);
    g.add(caj);
    for (let i = 0; i < 3; i++) {
      const d = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.12 + i * 0.05, 6, 12), glossy('#8E4A14', 0.15));
      d.position.set(0.05 + i * 0.1, p.top + 0.3 - i * 0.03, 0.2 - i * 0.02);
      g.add(d);
    }
    const pool = new THREE.Mesh(puddle(0.18, 0.012, 35, 0.3), glossy('#8E4A14', 0.15));
    pool.position.set(0.25, p.top, 0.25);
    g.add(pool);
    return { root: shadowed(g), view: { type: 'tq', width: 1.8, elevation: 30, azimuth: -24, targetY: 0.16 } };
  },

  'flan-de-cajeta': () => {
    const r = rng(117);
    const g = new THREE.Group();
    const p = plate('flat', 0.85, '#EFE7DA');
    g.add(p.mesh);
    const pts = [0, 0.34, 0.34, 0.3, 0.28, 0].map((x, k) => new THREE.Vector2(Math.max(0.0005, x), [0, 0, 0.02, 0.26, 0.28, 0.28][k]));
    const flan = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), phys('#E8B45A', { roughness: 0.25, clearcoat: 0.7, sheen: 0.4, sheenColor: new THREE.Color('#fff0cc') }));
    flan.position.y = p.top;
    g.add(flan);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.29, 0.03, 96), glossy('#7C3E10', 0.12));
    cap.position.y = p.top + 0.28;
    g.add(cap);
    const pool = new THREE.Mesh(puddle(0.5, 0.012, 36, 0.12), glossy('#8A4612', 0.12));
    pool.position.y = p.top;
    g.add(pool);
    g.add(instanced(blob(0.045, 0.02, 0.03, 0.3, 37, 2, 2.4), glossy('#6B3A1E', 0.3), scatter(r, 5, 0.12, () => p.top + 0.32, {})));
    return { root: shadowed(g), view: { type: 'tq', width: 1.75, elevation: 30, azimuth: -18, targetY: 0.14 } };
  },

  'chocolate-y-chile': () => {
    const r = rng(118);
    const g = new THREE.Group();
    const p = plate('flat', 0.8, '#1E1B19');
    g.add(p.mesh);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.3, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), phys('#2A150D', { roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06 }));
    dome.position.y = p.top;
    g.add(dome);
    const dust: Placement[] = [];
    for (let i = 0; i < 260; i++) {
      const a = range(r, -0.4, 1.4);
      const el = range(r, 0.2, 1.4);
      const n = V(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el));
      dust.push({ p: n.clone().multiplyScalar(0.302).add(V(0, p.top, 0)), s: range(r, 0.6, 1.4), r: randomEuler(r) });
    }
    g.add(instanced(new THREE.BoxGeometry(0.008, 0.008, 0.008), std('#B0301C', 0.8), dust));
    g.add(instanced(blob(0.022, 0.012, 0.016, 0.3, 38, 1), std('#3A2014', 0.6), scatter(r, 12, 0.5, () => p.top + 0.012, { flat: true })));
    return { root: shadowed(g), view: { type: 'top', width: 1.7, rotate: 0.4 } };
  },

  'bunuelo-de-canela': () => {
    const r = rng(119);
    const g = new THREE.Group();
    const p = plate('flat', 0.9, '#D8C3AE');
    g.add(p.mesh);
    const geo = sheet({
      radius: irregularRadius(0.62, 0.06, 7),
      thickness: 0.018,
      map: (x, z) => V(x, 0.05 + Math.max(0, fbm(x * 7, z * 7, 8, 3)) * 0.07 + (x * x + z * z) * -0.05, z),
      rings: 30,
      segs: 120,
    });
    const b = new THREE.Mesh(geo, std('#ffffff', 0.55, { map: tortillaTexture('golden'), bumpMap: bumpNoise('bunuelo', 60), bumpScale: 2 }));
    b.position.set(0, p.top, 0);
    b.rotation.set(0.15, 0.3, 0.08);
    g.add(b);
    g.add(instanced(new THREE.BoxGeometry(0.01, 0.01, 0.01), std('#FBF6EC', 0.4), scatter(r, 380, 0.55, (x, z) => p.top + 0.12 + x * 0.12 - z * 0.05, { flat: true })));
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 9; k++) pts.push(V(-0.45 + k * 0.11, p.top + 0.16 + Math.sin(k) * 0.02, Math.sin(k * 1.4) * 0.25));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, 0.012, 8), glossy('#5A2A0C', 0.1)));
    return { root: shadowed(g), view: { type: 'tq', width: 1.9, elevation: 38, azimuth: -16, targetY: 0.08 } };
  },

  'agua-de-jamaica': () => {
    const r = rng(120);
    const g = drink({ seed: 120, color: '#8C0F2E', coasterColor: '#EFE7DA', transmission: 0.45, ice: 4 });
    const flower = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const pet = new THREE.Mesh(blob(0.07, 0.012, 0.035, 0.3, 40 + i, 2), glossy('#5E0A1C', 0.4));
      pet.position.set(Math.cos((i / 6) * 6.28) * 0.05, 0, Math.sin((i / 6) * 6.28) * 0.05);
      pet.rotation.y = -(i / 6) * 6.28;
      pet.rotation.z = 0.25;
      flower.add(pet);
    }
    flower.position.set(0.45, 0.05, 0.3);
    flower.rotation.set(0.2, r(), 0.1);
    g.add(shadowed(flower));
    return { root: g, view: { type: 'tq', width: 1.45, elevation: 18, azimuth: -14, targetY: 0.6 } };
  },

  'horchata-de-vainilla': () => {
    const r = rng(121);
    const g = drink({ seed: 121, color: '#EFE6D6', coasterColor: '#D8C3AE', transmission: 0.08, roughness: 0.3, ice: 3 });
    g.add(instanced(new THREE.BoxGeometry(0.012, 0.004, 0.012), std('#7A4A26', 0.7), scatter(r, 90, 0.22, () => (g.userData.liquidTop as number) + 0.003, { flat: true })));
    const pod = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-0.1, 0.02, 0.5), V(0.2, 0.025, 0.45), V(0.5, 0.03, 0.3)]), 40, 0.018, 8), std('#2B1A12', 0.6));
    g.add(shadowed(pod));
    return { root: g, view: { type: 'tq', width: 1.45, elevation: 18, azimuth: -14, targetY: 0.6 } };
  },

  'agua-de-pepino-y-limon': () => {
    const r = rng(122);
    const g = drink({ seed: 122, color: '#C4D993', coasterColor: '#EFE7DA', transmission: 0.55, ice: 4 });
    const ribbonPts: THREE.Vector3[] = [];
    for (let k = 0; k < 40; k++) {
      const a = k * 0.45;
      ribbonPts.push(V(Math.cos(a) * 0.19, 0.12 + k * 0.022, Math.sin(a) * 0.19));
    }
    const ribbon = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribbonPts), 200, 0.012, 6), phys('#6E9B3E', { roughness: 0.3, transmission: 0.3 }));
    ribbon.scale.set(1, 1, 1);
    ribbon.position.y = 0.03;
    g.add(ribbon);
    const leaves = scatter(r, 7, 0.07, () => (g.userData.liquidTop as number) + 0.06 + r() * 0.05, { scale: [0.07, 0.1] });
    g.add(instanced(leafGeometry(), std('#3E7F2C', 0.5, { side: THREE.DoubleSide }), leaves));
    return { root: g, view: { type: 'tq', width: 1.45, elevation: 18, azimuth: -14, targetY: 0.6 } };
  },

  'margarita-de-la-casa': () => {
    const r = rng(123);
    const g = drink({ seed: 123, color: '#E9E2A2', coasterColor: '#1E1B19', transmission: 0.6, r: 0.42, h: 0.62, fill: 0.72, taper: 1.12 });
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34, 4, 4, 4), phys('#ffffff', { transmission: 0.95, roughness: 0.08, thickness: 0.4, ior: 1.31 }));
    cube.position.set(0, 0.34, 0);
    cube.rotation.set(0.2, 0.5, 0.1);
    g.add(cube);
    const R = 0.42 * 1.12;
    const salt: Placement[] = [];
    for (let i = 0; i < 380; i++) {
      const a = range(r, Math.PI * 0.1, Math.PI * 1.1);
      salt.push({ p: V(Math.cos(a) * (R + range(r, -0.012, 0.012)), 0.03 + 0.62 - range(r, 0, 0.05), Math.sin(a) * (R + range(r, -0.012, 0.012))), s: range(r, 0.6, 1.3), r: randomEuler(r), c: pick(r, ['#B8301E', '#D2462C', '#F2E8DA']) });
    }
    g.add(instanced(new THREE.BoxGeometry(0.012, 0.012, 0.012), std('#ffffff', 0.7), salt));
    const wheel = limeWheel(0.15);
    wheel.position.set(-0.36, 0.64, 0.25);
    wheel.rotation.set(Math.PI / 2.2, 0, 0.5);
    g.add(wheel);
    return { root: shadowed(g), view: { type: 'tq', width: 1.6, elevation: 24, azimuth: -14, targetY: 0.32 } };
  },

  'cerveza-clara': () => {
    const g = drink({ seed: 124, color: '#E3A72A', coasterColor: '#EFE7DA', transmission: 0.62, r: 0.26, h: 1.5, fill: 0.84, taper: 1.18, foam: '#FBF6EA', bubbles: true });
    return { root: g, view: { type: 'tq', width: 1.35, elevation: 16, azimuth: -12, targetY: 0.72 } };
  },

  'cerveza-ambar': () => {
    const g = drink({ seed: 125, color: '#9B4A16', coasterColor: '#D8C3AE', transmission: 0.5, r: 0.26, h: 1.5, fill: 0.84, taper: 1.18, foam: '#F1E6D2', bubbles: true });
    return { root: g, view: { type: 'tq', width: 1.35, elevation: 16, azimuth: -12, targetY: 0.72 } };
  },

  // ---------------------------------------------------------------- escenas extra
  'taco-hero': () => {
    const g = new THREE.Group();
    const taco = buildTaco({ seed: 7 });
    centerOnBox(taco);
    taco.rotation.set(-0.35, -0.6, 0.12);
    g.add(taco);
    return { root: g, view: { type: 'tq', width: 2.3, elevation: 14, azimuth: -10, targetY: 0 }, transparent: true };
  },

  'mesa-vacia': () => {
    const r = rng(130);
    const g = new THREE.Group();
    const p = plate('flat', 0.8, '#EFE7DA');
    p.mesh.position.set(0.12, 0, 0.05);
    g.add(p.mesh);
    const napkin = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.02, 1.1), std('#ffffff', 0.9, { map: linenTexture('#E6DCCB') }));
    napkin.position.set(-0.95, 0.01, 0.05);
    g.add(napkin);
    const gl = glass({ r: 0.17, h: 0.6, taper: 1.08 });
    gl.position.set(0.95, 0, -0.75);
    g.add(gl);
    void r;
    return { root: shadowed(g), view: { type: 'top', width: 2.8, rotate: 0 } };
  },
};

export const RECIPE_SLUGS = Object.keys(recipes).filter((k) => !['taco-hero', 'mesa-vacia'].includes(k));
export const EXTRA_SLUGS = ['taco-hero', 'mesa-vacia'];

export function buildScene(slug: string): SceneSpec {
  const recipe = recipes[slug];
  if (!recipe) throw new Error(`Receta desconocida: ${slug}`);
  return recipe();
}

export { tortillaFold };
