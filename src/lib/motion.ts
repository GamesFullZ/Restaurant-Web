// Movimiento reducido: preferencia del sistema + interruptor del footer (FR-069).
import { useEffect, useState } from 'react';
import { usePrefs } from '@/store/session';

function systemReduced(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function useReducedMotion(): boolean {
  const prefs = usePrefs();
  const [sys, setSys] = useState(systemReduced);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const fn = () => setSys(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return prefs.reduceMotion || sys;
}

export function isReducedNow(): boolean {
  return document.documentElement.dataset.reducedMotion === 'true';
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Latencia simulada breve (FR-066, SU-20). */
export function simulateLatency(min = 300, max = 800) {
  return wait(isReducedNow() ? 150 : min + Math.random() * (max - min));
}
