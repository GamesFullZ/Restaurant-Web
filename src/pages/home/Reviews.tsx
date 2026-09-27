import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { REVIEWS } from '@/data/seed';
import { REVIEW_TAGS } from '@/domain/constants';
import type { ReviewTag } from '@/domain/types';
import { Stars } from '@/components/Stars';
import { announce } from '@/lib/announce';
import { useReveal } from '@/lib/reveal';
import { addDays, formatLong, toISODate } from '@/lib/dates';
import { cx } from '@/lib/cx';

type StarFilter = 'all' | 5 | 4 | 3;
const AVATAR_STYLE = [
  { background: 'var(--nopal)', color: 'var(--nixtamal)' },
  { background: 'var(--maiz)' },
  { background: 'var(--cantera)' },
  { background: 'var(--nixtamal)' },
];

export function Reviews() {
  const [stars, setStars] = useState<StarFilter>('all');
  const [tag, setTag] = useState<ReviewTag | 'all'>('all');
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const ref = useRef<HTMLElement>(null);
  const touch = useRef<number | null>(null);
  useReveal(ref);
  const today = toISODate(new Date());

  const list = useMemo(
    () =>
      REVIEWS.filter((r) => (stars === 'all' ? true : stars === 3 ? r.stars <= 3 : r.stars === stars)).filter((r) => (tag === 'all' ? true : r.tag === tag)),
    [stars, tag],
  );
  const current = list[Math.min(index, list.length - 1)];

  const go = (d: 1 | -1) => {
    if (!list.length) return;
    const next = (index + d + list.length) % list.length;
    setDir(d);
    setIndex(next);
    const r = list[next];
    announce(`Reseña ${next + 1} de ${list.length}: ${r.name}, ${r.stars} de 5 estrellas.`);
  };
  const setFilter = (s: StarFilter, t: ReviewTag | 'all') => {
    setStars(s);
    setTag(t);
    setIndex(0);
  };
  const tagsPresent = REVIEW_TAGS.filter((t) => REVIEWS.some((r) => r.tag === t));

  return (
    <section ref={ref} id="resenas" className="reviews on-dark" aria-labelledby="reviews-title">
      <div className="reviews__rings" aria-hidden />
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow maiz" data-reveal>
              Reseñas
            </p>
            <h2 id="reviews-title" className="h2 reveal-group">
              <span className="split-line">
                <span>Lo que se comparte</span>
              </span>
              <span className="split-line" style={{ ['--i' as string]: 1 }}>
                <span className="serif-i">en la mesa.</span>
              </span>
            </h2>
          </div>
          <div className="reviews__score" data-reveal>
            <span className="reviews__big display tnum">4.4</span>
            <div>
              <Stars value={4} size={18} />
              <p>4.4 de 5 · 10 reseñas</p>
            </div>
          </div>
        </div>

        <div className="reviews__filters" data-reveal>
          <div className="seg" role="group" aria-label="Filtrar por estrellas">
            {(['all', 5, 4, 3] as StarFilter[]).map((s) => (
              <button key={String(s)} aria-pressed={stars === s} className={cx('seg__btn', stars === s && 'is-on')} onClick={() => setFilter(s, tag)}>
                {s === 'all' ? 'Todas' : s === 3 ? '3 ★ o menos' : `${s} ★`}
              </button>
            ))}
          </div>
          <div className="chips chips--scroll" role="group" aria-label="Filtrar por ocasión">
            <button aria-pressed={tag === 'all'} className={cx('chip', tag === 'all' && 'is-on')} onClick={() => setFilter(stars, 'all')}>
              Todas
            </button>
            {tagsPresent.map((t) => (
              <button key={t} aria-pressed={tag === t} className={cx('chip', tag === t && 'is-on')} onClick={() => setFilter(stars, t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {!current ? (
          <div className="empty empty--dark" role="status">
            <p className="serif-i empty__title">No hay reseñas con estos filtros.</p>
            <button className="btn btn--light" onClick={() => setFilter('all', 'all')}>
              Quitar filtros
            </button>
          </div>
        ) : (
          <div className="reviews__body">
            <article
              key={`${current.id}-${stars}-${tag}`}
              className={cx('review-hero', dir === 1 ? 'from-right' : 'from-left')}
              onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touch.current == null) return;
                const dx = e.changedTouches[0].clientX - touch.current;
                if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
                touch.current = null;
              }}
            >
              <Quote className="review-hero__q" aria-hidden />
              <blockquote className="review-hero__text serif-i">“{current.comment}”</blockquote>
              <footer className="review-hero__who">
                <span className="avatar" style={AVATAR_STYLE[REVIEWS.indexOf(current) % 4]} aria-hidden>
                  {current.initials}
                </span>
                <div>
                  <strong>{current.name}</strong>
                  <span className="review-hero__meta">
                    <Stars value={current.stars} size={14} /> · {formatLong(addDays(today, -current.daysAgo))}
                  </span>
                </div>
                <span className="chip is-static">{current.tag}</span>
              </footer>
            </article>
            <div className="reviews__side">
              <ul className="reviews__list" aria-label="Otras reseñas">
                {list.map((r, i) => (
                  <li key={r.id}>
                    <button
                      className={cx('rmini', r.id === current.id && 'is-on')}
                      aria-current={r.id === current.id}
                      onClick={() => {
                        setDir(i > index ? 1 : -1);
                        setIndex(i);
                      }}
                    >
                      <span className="avatar avatar--sm" style={AVATAR_STYLE[REVIEWS.indexOf(r) % 4]} aria-hidden>
                        {r.initials}
                      </span>
                      <span className="rmini__txt">
                        <strong>{r.name}</strong>
                        <span>{r.comment.slice(0, 64)}…</span>
                      </span>
                      <Stars value={r.stars} size={11} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="reviews__nav">
                <button className="icon-btn icon-btn--lg" onClick={() => go(-1)} aria-label="Reseña anterior">
                  <ArrowLeft aria-hidden />
                </button>
                <span className="mono tnum" aria-hidden>
                  {String(Math.min(index, list.length - 1) + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
                </span>
                <button className="icon-btn icon-btn--lg" onClick={() => go(1)} aria-label="Reseña siguiente">
                  <ArrowRight aria-hidden />
                </button>
              </div>
            </div>
          </div>
        )}
        <p className="reviews__note">Reseñas de ejemplo para este proyecto.</p>
      </div>
    </section>
  );
}
