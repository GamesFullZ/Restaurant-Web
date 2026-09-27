// Estudio de render offline: /studio.html?dish=<slug>&w=1080&h=1350
import * as THREE from 'three';
import { createRenderer, createStage, frameCamera } from '@/three/stage';
import { buildScene } from '@/three/recipes';

declare global {
  interface Window {
    __done?: boolean;
    __error?: string;
    __capture?: (type?: string, q?: number) => string;
  }
}

const q = new URLSearchParams(location.search);
const slug = q.get('dish') ?? 'taco-de-short-rib';
const w = Number(q.get('w') ?? 1080);
const h = Number(q.get('h') ?? 1350);

if (slug === 'taco-hero') {
  // El render estático del hero sale de la misma escena en vivo (pose, cámara y luces idénticas).
  const box = document.createElement('div');
  box.style.cssText = `position:relative;width:${w}px;height:${h}px`;
  document.body.appendChild(box);
  import('@/three/heroScene')
    .then(({ mountHeroTaco }) => {
      const stop = mountHeroTaco(
        box,
        { current: { p: 0 } },
        () => {
          const canvas = box.querySelector('canvas')!;
          window.__capture = (type = 'image/webp', quality = 0.9) => canvas.toDataURL(type, quality);
          window.__done = true;
        },
        { capture: true },
      );
      if (!stop) throw new Error('WebGL no disponible');
    })
    .catch((e) => {
      window.__error = String((e as Error)?.stack ?? e);
      window.__done = true;
    });
} else
try {
  const spec = buildScene(slug);
  const transparent = !!spec.transparent;
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const renderer = createRenderer(canvas, w, h, { alpha: transparent, preserve: true });
  const { scene } = createStage(renderer, { ground: !transparent, transparent });
  scene.add(spec.root);
  const cam = frameCamera(spec.view, w / h);
  renderer.render(scene, cam);
  renderer.render(scene, cam);
  window.__capture = (type = 'image/webp', quality = 0.9) => canvas.toDataURL(type, quality);
  window.__done = true;
  void THREE;
} catch (e) {
  window.__error = String((e as Error)?.stack ?? e);
  window.__done = true;
}
