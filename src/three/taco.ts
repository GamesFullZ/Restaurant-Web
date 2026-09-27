// Taco de Short Rib procedural: el objeto protagonista del Hero (docs/16 §9) y del platillo.
import * as THREE from 'three';
import { fbm } from './noise';
import { blob, glossy, instanced, irregularRadius, leafGeometry, phys, range, rng, sheet, std, type Placement } from './kit';
import { bumpNoise, tortillaTexture } from './textures';

export interface TacoOptions {
  seed?: number;
  detail?: 'high' | 'low';
  kind?: 'short-rib' | 'camaron';
}

const FOLD_R = 0.55;

/** Superficie interior de la tortilla a la altura z' (para apoyar el relleno). */
function surfaceY(z: number) {
  const t = Math.max(-0.999, Math.min(0.999, z / FOLD_R));
  const th = Math.asin(t);
  return FOLD_R * (1 - Math.cos(th));
}

function arcLen(z: number) {
  const t = Math.max(-0.999, Math.min(0.999, z / FOLD_R));
  return Math.abs(FOLD_R * Math.asin(t));
}

export function tortillaFold(seed = 3, kind: 'yellow' | 'blue' = 'yellow', high = true): THREE.Mesh {
  const geo = sheet({
    radius: irregularRadius(1, 0.035, seed),
    thickness: 0.028,
    rings: high ? 30 : 16,
    segs: high ? 120 : 64,
    map: (x, z) => {
      const th = z / FOLD_R;
      const wob = fbm(x * 2.2 + seed, z * 2.2, 0.4, 3) * 0.035;
      const droop = -0.06 * Math.pow(Math.abs(x), 2.2) * Math.min(1, Math.abs(th));
      return new THREE.Vector3(x * (1 - 0.03 * Math.abs(th)), FOLD_R * (1 - Math.cos(th)) + wob + droop, FOLD_R * Math.sin(th));
    },
  });
  const mat = std('#ffffff', 0.78, { map: tortillaTexture(kind), bumpMap: bumpNoise('tortilla', 26), bumpScale: 1.2, side: THREE.DoubleSide });
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = m.receiveShadow = true;
  m.name = 'tortilla';
  return m;
}

function fillingPoints(r: () => number, n: number, lift = 0.04, mound = 0.34, spreadZ = 0.34) {
  const pts: THREE.Vector3[] = [];
  let guard = 0;
  while (pts.length < n && guard++ < n * 20) {
    const z = range(r, -spreadZ, spreadZ);
    const s = arcLen(z);
    const xmax = Math.sqrt(Math.max(0, 1 - (s + 0.14) ** 2)) * 0.86;
    if (xmax < 0.12) continue;
    const x = range(r, -xmax, xmax);
    const m = mound * (1 - (x / 1) ** 2) * (1 - (z / 0.5) ** 2);
    const y = surfaceY(z) + lift + r() * Math.max(0.02, m);
    pts.push(new THREE.Vector3(x, y, z));
  }
  return pts;
}

function fillingTop(x: number, z: number, lift = 0.04, mound = 0.34) {
  return surfaceY(z) + lift + mound * (1 - x * x) * (1 - (z / 0.5) ** 2);
}

export function buildTaco(opts: TacoOptions = {}): THREE.Group {
  const seed = opts.seed ?? 7;
  const high = opts.detail !== 'low';
  const r = rng(seed);
  const g = new THREE.Group();
  g.name = 'taco';

  const tortilla = tortillaFold(seed, 'yellow', high);
  const tortillaLayer = new THREE.Group();
  tortillaLayer.name = 'layer-tortilla';
  tortillaLayer.add(tortilla);
  g.add(tortillaLayer);

  const meatLayer = new THREE.Group();
  meatLayer.name = 'layer-meat';
  const onionLayer = new THREE.Group();
  onionLayer.name = 'layer-onion';
  const salsaLayer = new THREE.Group();
  salsaLayer.name = 'layer-salsa';
  const herbLayer = new THREE.Group();
  herbLayer.name = 'layer-herbs';

  if (opts.kind === 'camaron') {
    // camarones, crema de aguacate, col morada/verde
    const shrimpMat = phys('#E9825A', { roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.4, sheenColor: new THREE.Color('#ffd2b8') });
    for (let i = 0; i < 5; i++) {
      const tg = new THREE.TorusGeometry(0.12, 0.05, 14, 28, Math.PI * 1.25);
      const m = new THREE.Mesh(tg, shrimpMat);
      const x = -0.5 + i * 0.25 + range(r, -0.03, 0.03);
      const z = range(r, -0.1, 0.1);
      m.position.set(x, fillingTop(x, z, 0.05, 0.12) + 0.02, z);
      m.rotation.set(Math.PI / 2 + range(r, -0.4, 0.4), range(r, -0.5, 0.5), r() * 6.28);
      m.castShadow = m.receiveShadow = true;
      meatLayer.add(m);
    }
    const cab: Placement[] = [];
    for (let i = 0; i < 90; i++) {
      const p = fillingPoints(r, 1, 0.06, 0.1)[0];
      if (!p) continue;
      cab.push({ p, r: new THREE.Euler(range(r, -0.4, 0.4), r() * 6.28, range(r, -0.4, 0.4)), s: new THREE.Vector3(1, 1, 1), c: r() > 0.5 ? '#6B2E73' : '#C9DB9C' });
    }
    onionLayer.add(instanced(new THREE.BoxGeometry(0.16, 0.008, 0.012), std('#ffffff', 0.5), cab));
    const cream: Placement[] = [];
    for (let i = 0; i < 9; i++) {
      const x = range(r, -0.55, 0.55);
      const z = range(r, -0.08, 0.08);
      cream.push({ p: new THREE.Vector3(x, fillingTop(x, z, 0.05, 0.14) + 0.07, z), s: new THREE.Vector3(1, 0.55, 1), r: new THREE.Euler(0, r() * 6, 0) });
    }
    salsaLayer.add(instanced(blob(0.07, 0.07, 0.07, 0.25, 4, 3), glossy('#B9CC7C', 0.3), cream));
  } else {
    const meatColors = ['#5B2C18', '#6F381F', '#4A2213', '#7E4424', '#3E1C10', '#8A4B28', '#2E140B', '#9A5A32'];
    const meatMat = phys('#ffffff', { roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.4, bumpMap: bumpNoise('meat', 70), bumpScale: 2 });
    const count = high ? 300 : 120;
    const variants = [blob(0.15, 0.022, 0.03, 0.45, 11, 3, 3.2), blob(0.1, 0.03, 0.028, 0.5, 12, 3, 3.4), blob(0.19, 0.018, 0.024, 0.4, 13, 3, 3)];
    const buckets: Placement[][] = [[], [], []];
    fillingPoints(r, count).forEach((p, i) => {
      buckets[i % 3].push({
        p,
        r: new THREE.Euler(range(r, -0.6, 0.6), range(r, -0.9, 0.9), range(r, -0.7, 0.7)),
        s: range(r, 0.8, 1.25),
        c: meatColors[Math.floor(r() * meatColors.length)],
      });
    });
    buckets.forEach((b, i) => meatLayer.add(instanced(variants[i], meatMat, b)));

    // cebolla encurtida
    const onionMat = phys('#D8467F', { roughness: 0.25, transmission: 0.35, thickness: 0.02, clearcoat: 0.7, clearcoatRoughness: 0.2 });
    const onions: Placement[] = [];
    for (let i = 0; i < (high ? 22 : 12); i++) {
      const x = range(r, -0.62, 0.62);
      const z = range(r, -0.16, 0.16);
      onions.push({
        p: new THREE.Vector3(x, fillingTop(x, z) + 0.035, z),
        r: new THREE.Euler(Math.PI / 2 + range(r, -0.5, 0.5), range(r, -0.5, 0.5), r() * 6.28),
        s: range(r, 0.75, 1.2),
      });
    }
    const onionGeo = new THREE.TorusGeometry(0.1, 0.016, 8, 30, Math.PI * 0.95);
    onionGeo.scale(1, 1, 0.55);
    onionLayer.add(instanced(onionGeo, onionMat, onions));

    // salsa de chile morita
    const drops: Placement[] = [];
    for (let i = 0; i < (high ? 18 : 10); i++) {
      const x = range(r, -0.55, 0.55);
      const z = range(r, -0.14, 0.14);
      drops.push({ p: new THREE.Vector3(x, fillingTop(x, z) + 0.05, z), s: new THREE.Vector3(range(r, 0.8, 1.4), 0.45, range(r, 0.8, 1.2)) });
    }
    salsaLayer.add(instanced(blob(0.035, 0.035, 0.035, 0.2, 21, 2), glossy('#7E170E', 0.14), drops));
  }

  // micro cilantro
  const leaves: Placement[] = [];
  for (let i = 0; i < (high ? 12 : 7); i++) {
    const x = range(r, -0.55, 0.55);
    const z = range(r, -0.14, 0.14);
    leaves.push({ p: new THREE.Vector3(x, fillingTop(x, z) + 0.08, z), r: new THREE.Euler(range(r, -0.5, 0.5), r() * 6.28, range(r, -0.5, 0.5)), s: range(r, 0.05, 0.075) });
  }
  herbLayer.add(instanced(leafGeometry(), std('#3F7A2C', 0.55, { side: THREE.DoubleSide }), leaves));

  g.add(meatLayer, onionLayer, salsaLayer, herbLayer);
  g.traverse((o) => {
    if (o.name.startsWith('layer-')) o.userData.base = o.position.clone();
  });
  return g;
}

/** Centra el grupo en su caja envolvente (pivote de rotación en el centro de masa). */
export function centerOnBox(obj: THREE.Object3D): THREE.Vector3 {
  const box = new THREE.Box3().setFromObject(obj);
  const c = box.getCenter(new THREE.Vector3());
  obj.children.forEach((ch) => ch.position.sub(c));
  obj.traverse((o) => {
    if (o.name.startsWith('layer-')) o.userData.base = o.position.clone();
  });
  return box.getSize(new THREE.Vector3());
}
