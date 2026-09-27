import { Link } from 'react-router-dom';
import { cx } from '@/lib/cx';

/** Isotipo: mesa vista desde arriba con plato descentrado (docs/16 §10). */
export function Isotype({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className={className}>
      <rect x="3.5" y="7.5" width="25" height="17" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="19.5" cy="16" r="5" fill="var(--chile)" />
    </svg>
  );
}

export function Logo({ to = '/', className, label = 'Mesa, ir al inicio' }: { to?: string; className?: string; label?: string }) {
  return (
    <Link viewTransition to={to} className={cx('logo', className)} aria-label={label}>
      <Isotype />
      <span className="logo__word display-wide" aria-hidden>
        Mesa
      </span>
    </Link>
  );
}
