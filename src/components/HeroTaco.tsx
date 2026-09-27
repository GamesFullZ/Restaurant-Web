import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/motion';
import { cx } from '@/lib/cx';

export interface TacoProgress {
  /** 0 → 1 a lo largo del Hero fijado */
  p: number;
}

/** Taco 3D del Hero (FR-005): rota, se desplaza, cambia de escala y se “abre” en capas con el scroll. */
export function HeroTaco({ progress, className }: { progress: React.MutableRefObject<TacoProgress>; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // Teléfonos y equipos modestos: render estático del mismo taco (sin descargar three.js).
  const [lite] = useState(() => typeof window !== 'undefined' && (window.matchMedia('(max-width: 899px), (pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 2));
  const fallback = `${import.meta.env.BASE_URL}images/taco-hero.webp`;

  useEffect(() => {
    const el = wrap.current;
    if (!el || reduced || lite) return;
    let cleanup: (() => void) | null = null;
    let cancelled = false;
    const start = () =>
      import('@/three/heroScene')
        .then(({ mountHeroTaco }) => {
          if (cancelled) return;
          cleanup = mountHeroTaco(el, progress, () => setReady(true));
          if (!cleanup) setFailed(true);
        })
        .catch(() => setFailed(true));
    // El render estático pinta primero; three.js se descarga y monta con la primera interacción
    // (mover el ratón, hacer scroll, tocar o teclear), cuando el hilo principal ya está libre.
    const events = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'] as const;
    let idle = 0;
    const kick = () => {
      events.forEach((ev) => window.removeEventListener(ev, kick));
      const ric = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => number) | undefined;
      idle = ric ? ric(() => void start(), { timeout: 600 }) : window.setTimeout(() => void start(), 50);
    };
    events.forEach((ev) => window.addEventListener(ev, kick, { passive: true }));
    return () => {
      cancelled = true;
      events.forEach((ev) => window.removeEventListener(ev, kick));
      (window as any).cancelIdleCallback?.(idle);
      window.clearTimeout(idle);
      cleanup?.();
    };
  }, [reduced, lite, progress]);

  const staticMode = reduced || failed || lite;
  return (
    <div className={cx('hero-taco', className, ready && !staticMode && 'is-ready', lite && !reduced && 'is-lite')} ref={wrap} role="img" aria-label="Taco de short rib con cebolla encurtida y salsa de chile morita, en 3D.">
      <img src={fallback} alt="" aria-hidden width={1200} height={1200} fetchPriority="high" decoding="async" className={cx('hero-taco__fallback', staticMode && 'is-static')} />
    </div>
  );
}
