import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useReveal } from '@/lib/reveal';

function Tiles({ side }: { side: 'l' | 'r' }) {
  const tiles = [];
  for (let i = 0; i < 12; i++) {
    const rot = ((i * 7 + (side === 'l' ? 1 : 3)) % 4) * 90;
    const variant = (i + (side === 'l' ? 0 : 1)) % 3;
    tiles.push(
      <div key={i} className="tile" style={{ ['--i' as string]: i, ['--rot' as string]: `${rot}deg` }}>
        <svg viewBox="0 0 100 100" aria-hidden>
          {variant === 0 && <path d="M0 0 H100 A100 100 0 0 1 0 100 Z" fill="var(--cantera)" />}
          {variant === 1 && (
            <>
              <path d="M0 0 H50 A50 50 0 0 1 0 50 Z" fill="var(--nixtamal)" />
              <path d="M100 100 H50 A50 50 0 0 1 100 50 Z" fill="var(--nixtamal)" />
            </>
          )}
          {variant === 2 && <circle cx="50" cy="50" r="26" fill="var(--obsidiana)" />}
        </svg>
      </div>,
    );
  }
  return <div className={`tiles tiles--${side} reveal-group`}>{tiles}</div>;
}

export function ReserveCTA() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section ref={ref} className="cta on-dark" aria-labelledby="cta-title">
      <Tiles side="l" />
      <Tiles side="r" />
      <div className="cta__inner container">
        <svg className="cta__table" viewBox="0 0 64 40" aria-hidden>
          <rect x="6" y="6" width="52" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="22" cy="20" r="7" fill="currentColor" opacity="0.9" />
          <circle cx="42" cy="20" r="7" fill="currentColor" opacity="0.9" />
          <circle cx="32" cy="2" r="2" fill="currentColor" />
          <circle cx="32" cy="38" r="2" fill="currentColor" />
        </svg>
        <h2 id="cta-title" className="cta__title reveal-group">
          <span className="split-line display">
            <span>Tu mesa</span>
          </span>
          <span className="split-line" style={{ ['--i' as string]: 1 }}>
            <span className="serif-i">te espera.</span>
          </span>
        </h2>
        <p className="lead" data-reveal>
          Elige horario, fecha y hasta la mesa exacta. Toma menos de dos minutos.
        </p>
        <Link viewTransition to="/reservar" className="btn btn--light btn--lg" data-reveal>
          Reservar mesa <ArrowUpRight className="arrow" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
