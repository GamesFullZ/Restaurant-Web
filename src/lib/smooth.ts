// Scroll suave (Lenis) sincronizado con GSAP ScrollTrigger. Se desactiva con movimiento reducido.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let tick: ((t: number) => void) | null = null;

export function startSmooth() {
  if (lenis) return lenis;
  lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function stopSmooth() {
  if (tick) gsap.ticker.remove(tick);
  lenis?.destroy();
  lenis = null;
  tick = null;
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

export function scrollToEl(el: HTMLElement, offset = -110) {
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.1 });
  else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: document.documentElement.dataset.reducedMotion === 'true' ? 'auto' : 'smooth' });
  }
}

export { gsap, ScrollTrigger };
