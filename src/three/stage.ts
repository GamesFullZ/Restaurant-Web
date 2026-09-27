// Escenario de estudio: luz natural lateral izquierda, superficie de piedra clara (docs/16 §8).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { stoneTexture } from './textures';

export interface StageOptions {
  ground?: boolean;
  transparent?: boolean;
  shadowSize?: number;
}

export function createRenderer(canvas: HTMLCanvasElement | undefined, w: number, h: number, opts: { alpha?: boolean; preserve?: boolean; dpr?: number } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: !!opts.alpha,
    preserveDrawingBuffer: !!opts.preserve,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(opts.dpr ?? 1);
  renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (opts.alpha) renderer.setClearColor(0x000000, 0);
  return renderer;
}

export function createStage(renderer: THREE.WebGLRenderer, opts: StageOptions = {}) {
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;

  if (!opts.transparent) {
    scene.background = new THREE.Color('#CFC1AD');
    scene.fog = new THREE.Fog('#CFC1AD', 7.5, 17);
  }

  const key = new THREE.DirectionalLight('#FFEBD2', 3.4);
  key.position.set(-5.5, 6.5, -1.2);
  key.castShadow = true;
  const size = opts.shadowSize ?? 4096;
  key.shadow.mapSize.set(size, size);
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 20;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  scene.add(key);

  const fill = new THREE.HemisphereLight('#FFF5E8', '#8C7A64', 0.42);
  scene.add(fill);

  const rim = new THREE.DirectionalLight('#FFE2C4', 0.9);
  rim.position.set(4, 3, -5);
  scene.add(rim);

  const bounce = new THREE.DirectionalLight('#FFF6EA', 0.35);
  bounce.position.set(4, 2, 4);
  scene.add(bounce);

  if (opts.ground !== false) {
    const tex = stoneTexture();
    tex.repeat.set(4, 4);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, color: '#E8DAC6' }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    scene.add(ground);
  } else {
    const catcher = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.18 }));
    catcher.rotation.x = -Math.PI / 2;
    catcher.receiveShadow = true;
    scene.add(catcher);
  }
  return { scene, key, fill, rim };
}

export type View = { type: 'top'; width: number; rotate?: number } | { type: 'tq'; width: number; elevation?: number; azimuth?: number; targetY?: number };

/** Encuadre 4:5: el sujeto ocupa ~70 % del ancho. */
export function frameCamera(view: View, aspect: number): THREE.PerspectiveCamera {
  const fov = 28;
  const cam = new THREE.PerspectiveCamera(fov, aspect, 0.1, 60);
  const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov / 2)) * aspect);
  const visible = view.width / 0.86;
  const dist = visible / 2 / Math.tan(hfov / 2);
  if (view.type === 'top') {
    cam.position.set(0, dist, 0.001);
    cam.up.set(Math.sin(view.rotate ?? 0), 0, -Math.cos(view.rotate ?? 0));
    cam.lookAt(0, 0, 0);
  } else {
    const el = THREE.MathUtils.degToRad(view.elevation ?? 32);
    const az = THREE.MathUtils.degToRad(view.azimuth ?? -18);
    const ty = view.targetY ?? 0.15;
    cam.position.set(Math.sin(az) * Math.cos(el) * dist, ty + Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
    cam.lookAt(0, ty, 0);
  }
  return cam;
}
