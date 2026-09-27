// Texturas procedurales dibujadas en canvas (sin assets externos).
import * as THREE from 'three';
import { fbm, mulberry32 } from './noise';

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, rand: () => number) => void;

const cache = new Map<string, THREE.CanvasTexture>();

export function canvasTexture(key: string, size: number, draw: Draw, opts: { repeat?: number; color?: boolean } = {}): THREE.CanvasTexture {
  const k = `${key}:${size}:${opts.repeat ?? 1}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  draw(ctx, size, size, mulberry32(size * 13 + key.length * 7 + key.charCodeAt(0)));
  const tex = new THREE.CanvasTexture(c);
  if (opts.color !== false) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (opts.repeat) tex.repeat.set(opts.repeat, opts.repeat);
  tex.anisotropy = 4;
  cache.set(k, tex);
  return tex;
}

function noiseFill(ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, fn: (n: number, x: number, y: number) => [number, number, number, number?]) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n = fbm((x / w) * scale, (y / h) * scale, 0.37, 4);
      const [r, g, b, a] = fn(n, x, y);
      const i = (y * w + x) * 4;
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = a ?? 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

const hex = (c: string) => {
  const v = parseInt(c.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

/** Mezcla de base + variación de ruido. */
export function mottled(key: string, base: string, alt: string, scale = 6, size = 512, repeat = 1) {
  const a = hex(base);
  const b = hex(alt);
  return canvasTexture(
    key,
    size,
    (ctx, w, h) =>
      noiseFill(ctx, w, h, scale, (n) => {
        const t = Math.min(1, Math.max(0, n * 0.9 + 0.5));
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
      }),
    { repeat },
  );
}

/** Piedra clara cálida (superficie del estudio). */
export function stoneTexture() {
  return canvasTexture('stone', 1024, (ctx, w, h, r) => {
    noiseFill(ctx, w, h, 5, (n, x, y) => {
      const m = fbm(x / 90, y / 90, 3.1, 3) * 0.5;
      const v = 229 + n * 16 + m * 8;
      return [v + 4, v - 2, v - 12];
    });
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = `rgba(${120 + r() * 60},${110 + r() * 50},${95 + r() * 40},${0.08 + r() * 0.12})`;
      const s = r() * 1.8 + 0.4;
      ctx.fillRect(r() * w, r() * h, s, s);
    }
  });
}

/** Lino natural (tortillero, algunas escenas). */
export function linenTexture(color = '#E4DAC8') {
  const [cr, cg, cb] = hex(color);
  return canvasTexture(
    `linen-${color}`,
    512,
    (ctx, w, h, r) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle = `rgba(${cr - 30},${cg - 30},${cb - 30},${0.05 + r() * 0.07})`;
        ctx.fillRect(0, y, w, 1);
      }
      for (let x = 0; x < w; x += 2) {
        ctx.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.06})`;
        ctx.fillRect(x, 0, 1, h);
      }
    },
    { repeat: 3 },
  );
}

/** Tortilla de maíz con manchas de comal. */
export function tortillaTexture(kind: 'yellow' | 'blue' | 'golden' = 'yellow') {
  const palette =
    kind === 'blue'
      ? { base: '#6E6A86', dark: '#3E3953', spot: '#26212E' }
      : kind === 'golden'
        ? { base: '#E2A94E', dark: '#B97325', spot: '#7A4516' }
        : { base: '#E6BF78', dark: '#C99650', spot: '#5A3616' };
  const b = hex(palette.base);
  const dk = hex(palette.dark);
  return canvasTexture(`tortilla-${kind}`, 1024, (ctx, w, h, r) => {
    noiseFill(ctx, w, h, 7, (n) => {
      const t = Math.min(1, Math.max(0, n * 1.2 + 0.45));
      return [b[0] + (dk[0] - b[0]) * t * 0.6, b[1] + (dk[1] - b[1]) * t * 0.6, b[2] + (dk[2] - b[2]) * t * 0.6];
    });
    // manchas de comal
    for (let i = 0; i < 120; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = 4 + r() * 30;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `${palette.spot}cc`);
      g.addColorStop(0.5, `${palette.spot}55`);
      g.addColorStop(1, `${palette.spot}00`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, rad, rad * (0.6 + r() * 0.5), r() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // grano de masa
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = r() > 0.5 ? 'rgba(255,245,220,0.18)' : 'rgba(90,60,20,0.12)';
      ctx.fillRect(r() * w, r() * h, 1.4, 1.4);
    }
  });
}

/** Mapa de relieve genérico (grano). */
export function bumpNoise(key = 'bump', scale = 18) {
  return canvasTexture(
    `bump-${key}`,
    512,
    (ctx, w, h) =>
      noiseFill(ctx, w, h, scale, (n) => {
        const v = 128 + n * 110;
        return [v, v, v];
      }),
    { color: false },
  );
}

/** Cerámica artesanal (moteado fino). */
export function ceramicTexture(color: string) {
  const c = hex(color);
  return canvasTexture(`ceramic-${color}`, 512, (ctx, w, h, r) => {
    noiseFill(ctx, w, h, 4, (n) => [c[0] + n * 10, c[1] + n * 10, c[2] + n * 9]);
    for (let i = 0; i < 1400; i++) {
      const dark = r() > 0.4;
      ctx.fillStyle = dark ? `rgba(40,30,20,${0.08 + r() * 0.18})` : `rgba(255,255,255,${0.05 + r() * 0.1})`;
      const s = r() * 1.6 + 0.4;
      ctx.fillRect(r() * w, r() * h, s, s);
    }
  });
}

/** Parrilla: marcas de brasa sobre una base. */
export function grillTexture(base: string, marks = '#3a2414', key = 'grill') {
  const b = hex(base);
  return canvasTexture(`${key}-${base}`, 512, (ctx, w, h, r) => {
    noiseFill(ctx, w, h, 6, (n) => [b[0] + n * 30, b[1] + n * 26, b[2] + n * 20]);
    ctx.globalAlpha = 0.75;
    for (let i = 0; i < 7; i++) {
      const x = (i + 0.5) * (w / 7) + (r() - 0.5) * 10;
      const g = ctx.createLinearGradient(x - 10, 0, x + 10, 0);
      g.addColorStop(0, `${marks}00`);
      g.addColorStop(0.5, marks);
      g.addColorStop(1, `${marks}00`);
      ctx.fillStyle = g;
      ctx.save();
      ctx.translate(x, h / 2);
      ctx.rotate(0.5);
      ctx.fillRect(-12, -h, 24, h * 2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  });
}

/** Miga (pastel) */
export function crumbTexture(base: string, key: string) {
  const b = hex(base);
  return canvasTexture(`crumb-${key}`, 512, (ctx, w, h, r) => {
    noiseFill(ctx, w, h, 22, (n) => [b[0] + n * 30, b[1] + n * 28, b[2] + n * 18]);
    for (let i = 0; i < 1800; i++) {
      ctx.fillStyle = `rgba(120,80,20,${0.08 + r() * 0.2})`;
      ctx.beginPath();
      ctx.arc(r() * w, r() * h, r() * 2.4 + 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** Queso fundido con dorado. */
export function meltedCheeseTexture() {
  return canvasTexture('cheese-melt', 1024, (ctx, w, h, r) => {
    noiseFill(ctx, w, h, 8, (n) => {
      const v = n * 0.9 + 0.5;
      return [246 - v * 20, 236 - v * 36, 200 - v * 70];
    });
    for (let i = 0; i < 90; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = 8 + r() * 36;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, 'rgba(176,104,38,0.85)');
      g.addColorStop(0.6, 'rgba(206,146,70,0.35)');
      g.addColorStop(1, 'rgba(206,146,70,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** Rodaja de cítrico (limón) vista de frente. */
export function citrusTexture(flesh = '#C9D86A', rind = '#6E9A2E') {
  return canvasTexture(`citrus-${flesh}`, 512, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = rind;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#F2F0D8';
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.46, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 9; i++) {
      const a0 = (i / 9) * Math.PI * 2 + 0.05;
      const a1 = ((i + 1) / 9) * Math.PI * 2 - 0.05;
      ctx.fillStyle = flesh;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos((a0 + a1) / 2) * w * 0.04, cy + Math.sin((a0 + a1) / 2) * w * 0.04);
      ctx.arc(cx, cy, w * 0.42, a0, a1);
      ctx.closePath();
      ctx.fill();
    }
  });
}

/** Adobo rojo/verde sobre pescado, con líneas de brasa. */
/**
 * Pescado a la talla abierto en mariposa, visto desde arriba (u: cabeza → cola, v: lomo superior → inferior).
 * Mitad superior en adobo rojo, mitad inferior en adobo verde, espina al centro, marcas de parrilla,
 * cabeza y cola doradas por el fuego.
 */
export function fishTexture() {
  return canvasTexture('fish-talla-v2', 1024, (ctx, w, h, r) => {
    const red = hex('#B8401F');
    const green = hex('#5E8A2E');
    const skin = hex('#8A5A2B');
    noiseFill(ctx, w, h, 7, (n, x, y) => {
      const u = x / w;
      const v = y / h;
      const edge = Math.abs(v - 0.5) * 2; // 0 en la espina, 1 en el borde
      if (u < 0.2 || u > 0.83) {
        // cabeza y cola: piel asada
        const k = 0.75 + n * 0.5;
        return [skin[0] * k, skin[1] * k, skin[2] * k];
      }
      const base = v < 0.5 ? red : green;
      const k = 0.74 + n * 0.62 + (1 - edge) * 0.1;
      // borde tostado
      const burn = Math.max(0, edge - 0.82) * 2.4;
      return [base[0] * k * (1 - burn) + 40 * burn, base[1] * k * (1 - burn) + 24 * burn, base[2] * k * (1 - burn) + 12 * burn];
    });
    // espina central y costillas insinuadas
    ctx.strokeStyle = 'rgba(245,230,205,0.55)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.5);
    ctx.lineTo(w * 0.84, h * 0.5);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(40,20,10,0.22)';
    for (let i = 0; i < 16; i++) {
      const x = w * (0.24 + i * 0.037);
      ctx.beginPath();
      ctx.moveTo(x, h * 0.5);
      ctx.quadraticCurveTo(x + 18, h * 0.3, x + 6, h * 0.14);
      ctx.moveTo(x, h * 0.5);
      ctx.quadraticCurveTo(x + 18, h * 0.7, x + 6, h * 0.86);
      ctx.stroke();
    }
    // marcas de parrilla diagonales
    ctx.fillStyle = 'rgba(30,14,6,0.42)';
    for (let i = 0; i < 11; i++) {
      ctx.save();
      ctx.translate(w * (0.14 + i * 0.075), h / 2);
      ctx.rotate(0.55);
      ctx.fillRect(-5, -h, 10, h * 2);
      ctx.restore();
    }
    // ojo
    ctx.fillStyle = '#1b120c';
    ctx.beginPath();
    ctx.arc(w * 0.08, h * 0.44, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(w * 0.076, h * 0.425, 5, 0, Math.PI * 2);
    ctx.fill();
    // agalla
    ctx.strokeStyle = 'rgba(30,14,6,0.5)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(w * 0.13, h * 0.5, h * 0.3, -0.9, 0.9);
    ctx.stroke();
    // radios de la cola
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(30,14,6,0.35)';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(w * 0.85, h * 0.5);
      ctx.lineTo(w, h * (0.08 + i * 0.075));
      ctx.stroke();
    }
    // brillo de aceite y pimienta
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = r() < 0.5 ? `rgba(255,236,210,${r() * 0.25})` : `rgba(25,12,6,${r() * 0.4})`;
      ctx.fillRect(r() * w, r() * h, 2 + r() * 2, 2 + r() * 2);
    }
  });
}
