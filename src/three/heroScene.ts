import * as THREE from 'three';
import { buildTaco, centerOnBox } from '@/three/taco';
import { blob, glossy, leafGeometry, phys, std } from '@/three/kit';
import { mulberry32 } from '@/three/noise';

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Monta la escena del taco del Hero en `el`. Devuelve la limpieza, o null si WebGL falla. */
export function mountHeroTaco(el: HTMLElement, progress: { current: { p: number } }, onReady: () => void): (() => void) | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  const lowPower = window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = !lowPower;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  cam.position.set(0, 0.6, 6.2);
  cam.lookAt(0, 0, 0);

  const key = new THREE.DirectionalLight('#FFEBD2', 3.2);
  key.position.set(-4, 5, 3);
  key.castShadow = !lowPower;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 6;
  scene.add(key);
  scene.add(new THREE.HemisphereLight('#FFF5E8', '#6E5C48', 0.9));
  const rim = new THREE.DirectionalLight('#FFD2B0', 1.4);
  rim.position.set(4, 2, -4);
  scene.add(rim);
  const fillFront = new THREE.DirectionalLight('#ffffff', 0.5);
  fillFront.position.set(0, 1, 6);
  scene.add(fillFront);

  const pivot = new THREE.Group();
  scene.add(pivot);
  const taco = buildTaco({ seed: 7, detail: lowPower ? 'low' : 'high' });
  centerOnBox(taco);
  taco.scale.setScalar(1.12);
  pivot.add(taco);
  const layers = ['layer-meat', 'layer-onion', 'layer-salsa', 'layer-herbs'].map((n) => taco.getObjectByName(n)!);

  // ingredientes flotando alrededor
  const r = mulberry32(99);
  const floaters = new THREE.Group();
  scene.add(floaters);
  const onionMat = phys('#D8467F', { roughness: 0.25, clearcoat: 0.7 });
  const pieces: { m: THREE.Object3D; base: THREE.Vector3; speed: number; phase: number; depth: number }[] = [];
  const makers = [
    () => new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 8, 30, Math.PI * 1.1), onionMat),
    () => new THREE.Mesh(leafGeometry(), std('#3F7A2C', 0.5, { side: THREE.DoubleSide })),
    () => new THREE.Mesh(blob(0.06, 0.04, 0.05, 0.2, 5, 2), glossy('#7E170E', 0.15)),
    () => new THREE.Mesh(blob(0.045, 0.035, 0.04, 0.15, 6, 2), phys('#E9B63C', { roughness: 0.35, clearcoat: 0.5 })),
  ];
  const n = lowPower ? 10 : 18;
  for (let i = 0; i < n; i++) {
    const m = makers[i % makers.length]();
    if (i % 4 === 1) m.scale.setScalar(0.12 + r() * 0.06);
    const a = (i / n) * Math.PI * 2 + r() * 0.4;
    const rad = 1.9 + r() * 0.8;
    const base = new THREE.Vector3(Math.cos(a) * rad, (r() - 0.5) * 2.2, Math.sin(a) * 0.9 - 0.3);
    m.position.copy(base);
    m.rotation.set(r() * 6, r() * 6, r() * 6);
    floaters.add(m);
    pieces.push({ m, base, speed: 0.3 + r() * 0.5, phase: r() * 6.28, depth: 0.4 + r() * 0.8 });
  }

  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.16 }));
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = -1.25;
  catcher.receiveShadow = true;
  scene.add(catcher);
  taco.traverse((o) => {
    o.castShadow = true;
  });

  const resize = () => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = `${w}px`;
    renderer.domElement.style.height = `${h}px`;
    cam.aspect = w / Math.max(1, h);
    cam.position.z = w < h ? 7.4 : 6.2;
    cam.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(el);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  let visible = true;
  const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0 });
  io.observe(el);

  let raf = 0;
  let first = true;
  let running = false;
  let disposed = false;
  const timer = new THREE.Timer();
  let sp = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible && !first) return;
    timer.update();
    const t = timer.getElapsed();
    const p = progress.current.p;
    sp += (p - sp) * 0.12;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    const idle = Math.sin(t * 0.8) * 0.14;
    const e = smooth(0.35, 0.8, sp);
    pivot.rotation.y = -0.55 + idle + sp * Math.PI * 0.9 + pointer.x * 0.25;
    pivot.rotation.x = 0.28 - smooth(0.2, 0.7, sp) * 0.75 + pointer.y * 0.12;
    pivot.rotation.z = 0.08 * Math.sin(t * 0.6);
    pivot.position.y = Math.sin(t * 1.1) * 0.06 - sp * 0.2;
    pivot.position.x = -smooth(0.25, 0.8, sp) * 0.25;
    const s = 1 + smooth(0.1, 0.6, sp) * 0.18 - smooth(0.85, 1, sp) * 0.5;
    pivot.scale.setScalar(s);
    layers.forEach((l, i) => {
      const b = l.userData.base as THREE.Vector3;
      l.position.set(b.x, b.y + e * (0.25 + i * 0.22), b.z);
    });
    pieces.forEach((pc) => {
      pc.m.position.set(
        pc.base.x + Math.sin(t * pc.speed + pc.phase) * 0.12 - pointer.x * pc.depth * 0.3,
        pc.base.y + Math.cos(t * pc.speed * 0.8 + pc.phase) * 0.14 - sp * pc.depth * 1.2 + pointer.y * pc.depth * 0.2,
        pc.base.z,
      );
      pc.m.rotation.x += 0.004 * pc.speed;
      pc.m.rotation.y += 0.006 * pc.speed;
    });
    floaters.rotation.y = sp * 0.8;
    renderer.render(scene, cam);
    if (first) {
      first = false;
      onReady();
    }
  };
  // En tiempo real la transmisión duplica el render: se sustituye por un acabado brillante.
  scene.traverse((o) => {
    const mat = (o as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined;
    if (mat && 'transmission' in mat && mat.transmission > 0) {
      mat.transmission = 0;
      mat.needsUpdate = true;
    }
  });
  // Compila los shaders sin congelar el hilo (KHR_parallel_shader_compile) antes del primer cuadro.
  renderer
    .compileAsync(scene, cam)
    .catch(() => undefined)
    .then(() => {
      if (disposed) return;
      running = true;
      loop();
    });

  return () => {
    disposed = true;
    if (running) cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    renderer.dispose();
    renderer.domElement.remove();
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
    });
  };
}
