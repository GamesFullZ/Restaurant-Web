import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Flame, Leaf, Sprout, WheatOff } from 'lucide-react';
import { useDB } from '@/store/db';
import { publicMenu } from '@/domain/menu';
import { DIET_TAGS } from '@/domain/constants';
import type { CategoryId, Tag } from '@/domain/types';
import { DishCard } from './DishCard';
import { DishImage } from '@/components/DishImage';
import { useReveal } from '@/lib/reveal';
import { useTitle } from '@/lib/useTitle';
import { scrollToEl } from '@/lib/smooth';
import { cx } from '@/lib/cx';
import './menu.css';

const DIET_ICON: Partial<Record<Tag, typeof Leaf>> = { Vegetariano: Leaf, Vegano: Sprout, 'Sin gluten': WheatOff, Picante: Flame };

export default function MenuPage() {
  useTitle('Menú');
  const db = useDB();
  const menu = useMemo(() => publicMenu(db.dishes), [db.dishes]);
  const [active, setActive] = useState<CategoryId>('entradas');
  const [diet, setDiet] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const tabsRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const clicking = useRef(0);
  const { hash } = useLocation();
  useReveal(pageRef, [diet, loading, menu]);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(t);
  }, []);

  // Tab activa según la sección visible (FR-017)
  useEffect(() => {
    if (loading) return;
    const sections = menu.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const onScroll = () => {
      if (Date.now() - clicking.current < 900) return;
      const line = window.innerHeight * 0.35;
      let cur = sections[0]?.id as CategoryId;
      for (const s of sections) if (s.getBoundingClientRect().top <= line) cur = s.id as CategoryId;
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menu, loading]);

  // Centra la tab activa en móvil
  useEffect(() => {
    const btn = tabsRef.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    const bar = tabsRef.current;
    if (btn && bar) bar.scrollTo({ left: btn.offsetLeft - bar.clientWidth / 2 + btn.clientWidth / 2, behavior: 'smooth' });
  }, [active]);

  useEffect(() => {
    if (loading || !hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) {
      setActive(hash.slice(1) as CategoryId);
      window.setTimeout(() => scrollToEl(el, -140), 80);
    }
  }, [hash, loading]);

  const goTo = (id: CategoryId) => {
    clicking.current = Date.now();
    setActive(id);
    const el = document.getElementById(id);
    if (el) scrollToEl(el, -140);
  };

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const n = menu.length;
    let j = -1;
    if (e.key === 'ArrowRight') j = (i + 1) % n;
    if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
    if (e.key === 'Home') j = 0;
    if (e.key === 'End') j = n - 1;
    if (j >= 0) {
      e.preventDefault();
      tabsRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[j]?.focus();
      goTo(menu[j].id);
    }
  };

  return (
    <div ref={pageRef} className="menu-page">
      <header className="menu-hero container">
        <div className="menu-hero__copy">
          <p className="eyebrow accent">Carta · {menu.reduce((n, c) => n + c.dishes.length, 0)} platillos</p>
          <h1 className="menu-hero__title display">
            Menú<span className="serif-i">.</span>
          </h1>
          <p className="lead">Para compartir, probar y volver a pedir.</p>
        </div>
        <div className="menu-hero__plates" aria-hidden>
          <div className="mplate mplate--a">
            <DishImage imageId="lib:coliflor-rostizada" alt="" name="" eager />
          </div>
          <div className="mplate mplate--b">
            <DishImage imageId="lib:enchiladas-de-mole" alt="" name="" eager />
          </div>
          <div className="mplate mplate--c">
            <DishImage imageId="lib:chocolate-y-chile" alt="" name="" eager />
          </div>
        </div>
      </header>

      <div className="menu-tabs">
        <div className="container menu-tabs__inner">
          <div className="menu-tabs__list" role="tablist" aria-label="Categorías del menú" ref={tabsRef}>
            {menu.map((c, i) => (
              <button
                key={c.id}
                role="tab"
                data-cat={c.id}
                aria-selected={active === c.id}
                aria-controls={c.id}
                tabIndex={active === c.id ? 0 : -1}
                className={cx('menu-tab', active === c.id && 'is-active')}
                onClick={() => goTo(c.id)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                {c.name}
                <span className="menu-tab__n mono">{c.dishes.length}</span>
              </button>
            ))}
          </div>
          <div className="menu-diet" role="group" aria-label="Filtrar por etiqueta">
            {DIET_TAGS.map((t) => {
              const Icon = DIET_ICON[t]!;
              return (
                <button key={t} className={cx('chip chip--sm', diet === t && 'is-on')} aria-pressed={diet === t} onClick={() => setDiet(diet === t ? null : t)}>
                  <Icon aria-hidden /> {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container menu-body">
        {menu.map((c, ci) => {
          const dishes = diet ? c.dishes.filter((d) => d.tags.includes(diet)) : c.dishes;
          return (
            <section key={c.id} id={c.id} className="menu-cat" aria-labelledby={`${c.id}-t`} role="tabpanel">
              <header className="menu-cat__head">
                <span className="mono menu-cat__n">0{ci + 1}</span>
                <h2 id={`${c.id}-t`} className="h2 menu-cat__title">
                  {c.name}
                </h2>
                <p className="serif-i menu-cat__blurb">{c.blurb}</p>
              </header>
              {loading ? (
                <div className="menu-grid">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="dcard-sk">
                      <div className="skeleton" style={{ aspectRatio: '4/5' }} />
                      <div className="skeleton skeleton-line" style={{ width: '60%', marginTop: 16 }} />
                      <div className="skeleton skeleton-line" style={{ width: '90%', marginTop: 10 }} />
                    </div>
                  ))}
                </div>
              ) : dishes.length === 0 ? (
                <div className="empty">
                  <p className="serif-i empty__title">{diet ? `Sin platillos con “${diet}” en ${c.name}.` : 'Pronto habrá novedades aquí.'}</p>
                  {diet && (
                    <button className="btn btn--ghost btn--sm" onClick={() => setDiet(null)}>
                      Quitar filtro
                    </button>
                  )}
                </div>
              ) : (
                <div className="menu-grid">
                  {dishes.map((d, i) => (
                    <DishCard key={d.id} dish={d} index={i} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
        <p className="menu-note muted">Precios en pesos mexicanos, IVA incluido.</p>
      </div>
    </div>
  );
}
