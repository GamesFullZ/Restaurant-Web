import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu as MenuIcon, X } from 'lucide-react';
import { Logo } from './Brand';
import { cx } from '@/lib/cx';
import { RESTAURANT } from '@/domain/constants';

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/menu', label: 'Menú' },
  { to: '/reservar', label: 'Reservar' },
  { to: '/mis-reservas', label: 'Mis reservas' },
];

export function Header() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const last = useRef(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inFlow = pathname.startsWith('/reservar');
  const overHero = pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 240 && y > last.current + 4 && !open);
      if (y < last.current - 4) setHidden(false);
      last.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
      if (e.key === 'Tab' && panel) {
        const f = Array.from(panel.querySelectorAll<HTMLElement>('a, button'));
        const first = f[0];
        const lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className={cx('site-header', scrolled && 'is-scrolled', hidden && 'is-hidden', overHero && !scrolled && 'is-over')}>
        <div className="site-header__inner container">
          <Logo />
          <nav className="site-nav" aria-label="Principal">
            <ul>
              {LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink viewTransition to={l.to} end={l.end} className={({ isActive }) => cx('site-nav__link', isActive && 'is-active')}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-header__actions">
            {!inFlow && (
              <NavLink viewTransition to="/reservar" className="btn btn--primary btn--sm header-cta">
                <span className="hide-mobile">Reservar mesa</span>
                <span className="show-mobile">Reservar</span>
                <ArrowUpRight className="arrow" aria-hidden />
              </NavLink>
            )}
            <button
              ref={btnRef}
              className="icon-btn menu-toggle"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X aria-hidden /> : <MenuIcon aria-hidden />}
            </button>
          </div>
        </div>
      </header>
      <div id="mobile-nav" ref={panelRef} className={cx('mobile-nav on-dark', open && 'is-open')} hidden={!open} role="dialog" aria-modal="true" aria-label="Navegación">
        <div className="mobile-nav__dots" aria-hidden />
        <div className="mobile-nav__top container">
          <Logo className="logo--inv" />
          <button className="icon-btn" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
            <X aria-hidden />
          </button>
        </div>
        <nav aria-label="Principal móvil" className="container">
          <ul>
            {LINKS.map((l, i) => (
              <li key={l.to} style={{ ['--i' as string]: i }}>
                <NavLink viewTransition to={l.to} end={l.end} className={({ isActive }) => cx('mobile-nav__link', isActive && 'is-active')}>
                  <span className="mono">0{i + 1}</span>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-nav__foot container">
          <p>{RESTAURANT.address}</p>
          <p>Martes a domingo · Comida 13:00–17:00 · Cena 18:00–22:30 · Lunes cerrado</p>
        </div>
      </div>
    </>
  );
}
