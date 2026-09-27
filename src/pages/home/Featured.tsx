import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useDB } from '@/store/db';
import { featuredBadge, featuredDishes } from '@/domain/menu';
import { formatPrice } from '@/domain/validation';
import { DishImage } from '@/components/DishImage';
import { SoldOutBadge, TagBadge } from '@/components/Tags';
import { useReveal } from '@/lib/reveal';
import type { Tag } from '@/domain/types';

function tilt(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
  el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
}
function untilt(e: React.PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty('--rx', '0deg');
  e.currentTarget.style.setProperty('--ry', '0deg');
}

export function Featured() {
  const db = useDB();
  const list = featuredDishes(db.dishes);
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, [list.length]);
  return (
    <section ref={ref} id="destacados" className="featured on-dark" aria-labelledby="featured-title">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow maiz" data-reveal>
              Destacados
            </p>
            <h2 id="featured-title" className="h2 reveal-group">
              <span className="split-line">
                <span>De nuestra mesa</span>
              </span>
              <span className="split-line" style={{ ['--i' as string]: 1 }}>
                <span className="serif-i">a la tuya.</span>
              </span>
            </h2>
          </div>
          <div className="section-head__side" data-reveal>
            <p className="lead">Cuatro platillos para empezar.</p>
            <Link to="/menu" className="btn btn--ghost">
              Ver menú completo <ArrowUpRight className="arrow" aria-hidden />
            </Link>
          </div>
        </div>
        <ul className="featured__grid">
          {list.map((d, i) => {
            const badge = featuredBadge(d, i) as Tag;
            const soldOut = d.availability === 'Agotado temporalmente';
            return (
              <li key={d.id} data-reveal style={{ ['--i' as string]: i }} className={`featured__item featured__item--${i}`}>
                <Link to={`/menu/${d.slug}`} className={`fcard ${soldOut ? 'is-soldout' : ''}`} onPointerMove={tilt} onPointerLeave={untilt} viewTransition>
                  <div className="fcard__media">
                    <DishImage imageId={d.imageId} alt={d.imageAlt} name={d.name} vtName={`dish-${d.slug}`} />
                    <div className="fcard__badges">{soldOut ? <SoldOutBadge /> : badge && <TagBadge tag={badge} />}</div>
                    <span className="fcard__cta" aria-hidden>
                      Ver platillo <ArrowUpRight />
                    </span>
                  </div>
                  <div className="fcard__body">
                    <span className="fcard__num mono" aria-hidden>
                      0{i + 1}
                    </span>
                    <h3 className="fcard__name">{d.name}</h3>
                    <span className="fcard__price tnum">{formatPrice(d.price)}</span>
                    <p className="fcard__desc">{d.description}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
