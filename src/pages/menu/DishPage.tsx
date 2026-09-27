import { useLayoutEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useDB } from '@/store/db';
import { isPublic, neighbors, related } from '@/domain/menu';
import { CATEGORY_BY_ID } from '@/domain/constants';
import { formatPrice } from '@/domain/validation';
import { DishImage } from '@/components/DishImage';
import { SoldOutBadge, TagBadge } from '@/components/Tags';
import { DishCard } from './DishCard';
import { NotFoundContent } from '../NotFound';
import { useTitle } from '@/lib/useTitle';
import { useReducedMotion } from '@/lib/motion';
import { useReveal } from '@/lib/reveal';
import { gsap } from '@/lib/smooth';
import './menu.css';

export default function DishPage() {
  const { slug } = useParams();
  const db = useDB();
  const dish = useMemo(() => db.dishes.find((d) => d.slug === slug && isPublic(d)), [db.dishes, slug]);
  useTitle(dish?.name ?? 'Platillo no disponible');
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  useReveal(page, [dish?.id]);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el || reduced || !dish) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=120%', scrub: 0.6, pin: true } });
        tl.fromTo('.dish-stage__photo', { scale: 1, xPercent: 0 }, { scale: 0.84, xPercent: -6, ease: 'none' }, 0)
          .fromTo('.dish-stage__ring', { rotate: 0, scale: 0.9 }, { rotate: 140, scale: 1.08, ease: 'none' }, 0)
          .fromTo('.dish-greca path', { strokeDashoffset: 1600 }, { strokeDashoffset: 0, ease: 'none' }, 0.05)
          .to('.dish-info', { yPercent: -8, ease: 'none' }, 0)
          .to('.dish-stage__tiles', { opacity: 1, rotate: 90, ease: 'none' }, 0.55);
      });
    }, el);
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, [dish, reduced]);

  if (!dish) return <NotFoundContent dish />;

  const cat = CATEGORY_BY_ID[dish.categoryId];
  const soldOut = dish.availability === 'Agotado temporalmente';
  const { prev, next } = neighbors(db.dishes, dish.id);
  const more = related(db.dishes, dish);

  return (
    <div ref={page} className={`dish-page ${soldOut ? 'is-soldout' : ''}`}>
      <div ref={stage} className="dish-stage">
        <div className="container dish-stage__inner">
          <Link to={`/menu#${dish.categoryId}`} className="back-link">
            <ArrowLeft aria-hidden /> Volver al menú
          </Link>
          <div className="dish-stage__visual">
            <svg className="dish-stage__ring" viewBox="0 0 400 400" aria-hidden>
              {Array.from({ length: 36 }).map((_, i) => {
                const a = (i / 36) * Math.PI * 2;
                return <circle key={i} cx={200 + Math.cos(a) * 190} cy={200 + Math.sin(a) * 190} r={i % 3 === 0 ? 4 : 2} fill="currentColor" />;
              })}
            </svg>
            <svg className="dish-greca" viewBox="0 0 400 400" aria-hidden>
              <path d="M20 380 V300 H60 V340 H100 V300 H140 V380 M260 20 H340 V60 H300 V100 H340 V140 H380" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1600" />
            </svg>
            <div className="dish-stage__tiles" aria-hidden>
              <svg viewBox="0 0 100 100">
                <path d="M0 0 H50 A50 50 0 0 1 0 50 Z" fill="var(--chile)" />
                <path d="M100 100 H50 A50 50 0 0 1 100 50 Z" fill="var(--maiz)" />
              </svg>
            </div>
            <div className="dish-stage__photo">
              <DishImage imageId={dish.imageId} alt={dish.imageAlt} name={dish.name} eager vtName={`dish-${dish.slug}`} />
            </div>
          </div>
          <div className="dish-info">
            <p className="eyebrow accent stage-1" data-reveal style={{ ['--i' as string]: 1 }}>{cat.name}</p>
            <h1 className="dish-info__name display stage-1" data-reveal style={{ ['--i' as string]: 1 }}>{dish.name}</h1>
            <div className="dish-info__row stage-2" data-reveal style={{ ['--i' as string]: 2 }}>
              <span className="dish-info__price tnum">{formatPrice(dish.price)}</span>
              <div className="dish-info__tags">
                {soldOut && <SoldOutBadge />}
                {dish.tags.map((t) => (
                  <TagBadge key={t} tag={t} />
                ))}
              </div>
            </div>
            <p className="dish-info__desc serif-i stage-3" data-reveal style={{ ['--i' as string]: 3 }}>{dish.description}</p>
            {soldOut && <p className="dish-info__soldout stage-3" data-reveal style={{ ['--i' as string]: 3 }}>Hoy se nos terminó. Vuelve pronto o pregunta por él al reservar.</p>}
            <div className="dish-info__actions stage-4" data-reveal style={{ ['--i' as string]: 4 }}>
              <Link to="/reservar" className="btn btn--primary btn--lg">
                Reservar mesa <ArrowUpRight className="arrow" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <nav className="dish-nav container" aria-label="Otros platillos">
        {prev ? (
          <Link to={`/menu/${prev.slug}`} className="dish-nav__link" viewTransition>
            <ArrowLeft aria-hidden />
            <span>
              <small className="mono">Anterior</small>
              {prev.name}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/menu/${next.slug}`} className="dish-nav__link dish-nav__link--next" viewTransition>
            <span>
              <small className="mono">Siguiente</small>
              {next.name}
            </span>
            <ArrowRight aria-hidden />
          </Link>
        )}
      </nav>

      {more.length > 0 && (
        <section className="dish-more container" aria-labelledby="more-t">
          <h2 id="more-t" className="h3">
            También te puede gustar
          </h2>
          <div className="menu-grid">
            {more.map((d, i) => (
              <DishCard key={d.id} dish={d} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
