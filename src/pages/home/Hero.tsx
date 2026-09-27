import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Clock3, MapPin, Star } from 'lucide-react';
import { HeroTaco, type TacoProgress } from '@/components/HeroTaco';
import { useReducedMotion } from '@/lib/motion';
import { gsap, ScrollTrigger } from '@/lib/smooth';
import { openStatus } from '@/lib/hours';
import { useNow } from '@/lib/useNow';

function DotField() {
  // Retícula de platos y sillas vista desde arriba (capa gráfica detrás del texto)
  const cells = [];
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 12; x++) {
      const k = (x * 7 + y * 13) % 11;
      cells.push(
        <g key={`${x}-${y}`} transform={`translate(${x * 100 + 50} ${y * 100 + 50})`}>
          {k === 0 ? (
            <circle r="30" className="df-plate df-fill" style={{ ['--d' as string]: `${(x + y) * 0.35}s` }} />
          ) : k % 3 === 0 ? (
            <circle r="30" className="df-plate" />
          ) : (
            <circle r="3" className="df-dot" />
          )}
        </g>,
      );
    }
  }
  return (
    <svg className="dotfield" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {cells}
    </svg>
  );
}

function Stamp() {
  const text = 'HECHO AL MOMENTO · COMAL · FUEGO LENTO · MAÍZ · ';
  return (
    <div className="stamp hero-stamp" aria-hidden>
      <svg viewBox="0 0 200 200">
        <defs>
          <path id="stamp-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <circle cx="100" cy="100" r="98" fill="var(--obsidiana)" />
        <text fontFamily="var(--font-mono)" fontSize="13.2" letterSpacing="2.4" fill="var(--nixtamal)">
          <textPath href="#stamp-circle">{text}</textPath>
        </text>
      </svg>
      <div className="stamp__center">
        <span className="hero-stamp__icon">
          <svg viewBox="0 0 32 32" width="44" height="44">
            <rect x="3.5" y="7.5" width="25" height="17" rx="1.5" fill="none" stroke="var(--nixtamal)" strokeWidth="2" />
            <circle cx="19.5" cy="16" r="5" fill="var(--chile)" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef<TacoProgress>({ p: 0 });
  const reduced = useReducedMotion();
  const now = useNow();
  const status = openStatus(now);

  useLayoutEffect(() => {
    const el = section.current;
    if (!el) return;
    el.classList.add('is-in');
    if (reduced) {
      progress.current.p = 0;
      return;
    }
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(min-width: 900px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: '+=110%',
            pin: '.hero__stage',
            scrub: 0.6,
            onUpdate: (s) => (progress.current.p = s.progress),
          },
        });
        tl.to('.hero__title .split-line', { yPercent: -40, opacity: 0, stagger: 0.06, ease: 'none' }, 0.35)
          .to('.hero__sub, .hero__ctas, .hero__eyebrow', { y: -40, opacity: 0, ease: 'none' }, 0.3)
          .to('.hero__plate', { scale: 1.35, ease: 'none' }, 0)
          .to('.hero-card', { y: (i) => -60 - i * 30, opacity: 0, stagger: 0.04, ease: 'none' }, 0.25)
          .to('.dotfield', { yPercent: -12, ease: 'none' }, 0)
          .to('.hero-stamp', { rotate: 120, x: -80, ease: 'none' }, 0);
      });
      mm.add('(max-width: 899px)', () => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (s) => (progress.current.p = s.progress * 0.8),
        });
      });
    }, el);
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, [reduced]);

  return (
    <section ref={section} className="hero" aria-labelledby="hero-title">
      <div className="hero__stage">
        <DotField />
        <div className="gridlines" aria-hidden />
        <span className="cross" style={{ top: 110, left: '16.66%' }} aria-hidden />
        <span className="cross" style={{ bottom: 80, right: '16.66%' }} aria-hidden />
        <div className="hero__inner container">
          <div className="hero__copy">
            <p className="hero__eyebrow eyebrow">Barrio Antiguo · Monterrey</p>
            <h1 id="hero-title" className="hero__title">
              <span className="split-line display" style={{ ['--i' as string]: 0 }}>
                <span>Un taco.</span>
              </span>
              <span className="split-line display" style={{ ['--i' as string]: 1 }}>
                <span>
                  Una <em className="accent">mesa.</em>
                </span>
              </span>
              <span className="split-line serif-i hero__title-serif" style={{ ['--i' as string]: 2 }}>
                <span>Un lugar para disfrutar.</span>
              </span>
            </h1>
            <p className="hero__sub lead">Cocina mexicana contemporánea en el corazón de Monterrey.</p>
            <div className="hero__ctas">
              <Link to="/reservar" className="btn btn--primary btn--lg magnetic">
                Reservar mesa <ArrowUpRight className="arrow" aria-hidden />
              </Link>
              <Link to="/menu" className="btn btn--ghost btn--lg">
                Ver menú
              </Link>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__plate" aria-hidden>
              <svg viewBox="0 0 400 400">
                <circle cx="200" cy="200" r="196" fill="var(--chile)" />
                <circle cx="200" cy="200" r="168" fill="none" stroke="rgba(255,248,240,.35)" strokeDasharray="2 9" strokeWidth="2" />
                <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(255,248,240,.18)" strokeWidth="1" />
              </svg>
            </div>
            <HeroTaco progress={progress} className="hero__taco" />
            <div className="hero-card hero-card--a glass">
              <span className={`dot ${status.open ? 'dot--on' : ''}`} aria-hidden />
              <div>
                <strong>{status.label}</strong>
                <span>{status.detail}</span>
              </div>
            </div>
            <div className="hero-card hero-card--b glass">
              <Clock3 aria-hidden />
              <div>
                <strong>Tu mesa, 1 h 30 min</strong>
                <span>Elígela en el plano</span>
              </div>
            </div>
            <div className="hero-card hero-card--c glass">
              <MapPin aria-hidden />
              <div>
                <strong>Barrio Antiguo</strong>
                <span>Monterrey, N.L.</span>
              </div>
            </div>
            <a href="#resenas" className="hero-card hero-card--d glass">
              <Star aria-hidden className="star-on" />
              <div>
                <strong className="tnum">4.4 / 5</strong>
                <span>10 reseñas</span>
              </div>
            </a>
            <Stamp />
          </div>
        </div>
        <div className="hero__scroll container" aria-hidden>
          <span className="mono">Desliza para descubrir</span>
          <span className="hero__scroll-line" />
          <ArrowDown />
        </div>
      </div>
    </section>
  );
}
