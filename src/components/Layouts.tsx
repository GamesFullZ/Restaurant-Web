import { useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { DemoHelper } from './DemoHelper';
import { Toasts } from './toast';
import { StorageNotice } from './StorageNotice';
import { useReducedMotion } from '@/lib/motion';
import { scrollToTop, startSmooth, stopSmooth, ScrollTrigger } from '@/lib/smooth';

/** Sincroniza el atributo de movimiento reducido en <html>. */
export function MotionAttr() {
  const reduced = useReducedMotion();
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reduced);
  }, [reduced]);
  return null;
}

/** Al cambiar de ruta: arriba y foco al H1 (docs/14 §3). */
function RouteFocus() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);
  useLayoutEffect(() => {
    if (hash) return;
    scrollToTop();
    if (first.current) {
      first.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      const h1 = document.querySelector<HTMLElement>('main h1');
      if (h1) {
        h1.setAttribute('tabindex', '-1');
        h1.focus({ preventScroll: true });
      }
      ScrollTrigger.refresh();
    }, 60);
    return () => window.clearTimeout(id);
  }, [pathname, hash]);
  return null;
}

export function PublicLayout() {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      stopSmooth();
      return;
    }
    startSmooth();
    return () => stopSmooth();
  }, [reduced]);
  return (
    <>
      <a href="#main" className="skip-link">
        Saltar al contenido principal
      </a>
      <MotionAttr />
      <RouteFocus />
      <StorageNotice />
      <Header />
      <main id="main" className="site-main">
        <Outlet />
      </main>
      <Footer />
      <DemoHelper />
      <Toasts />
    </>
  );
}
