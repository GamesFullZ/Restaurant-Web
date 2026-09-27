import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowUpRight, CalendarPlus, Check, Copy } from 'lucide-react';
import { useDB } from '@/store/db';
import { getLastConfirmation } from '@/store/session';
import { TABLE_BY_ID } from '@/domain/constants';
import { endSlot, formatLong } from '@/lib/dates';
import { occasionLabel, partyLabel, STATUS_INFO } from '@/domain/reservations';
import { StatusBadge, SimPill } from '@/components/Tags';
import { toast } from '@/components/toast';
import { useTitle } from '@/lib/useTitle';
import { useReducedMotion } from '@/lib/motion';
import './reserve.css';

export default function ConfirmationPage() {
  useTitle('Reserva confirmada');
  const db = useDB();
  const id = getLastConfirmation();
  const r = db.reservations.find((x) => x.id === id);
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(reduced ? 9 : 0);

  useEffect(() => {
    if (reduced) {
      setTyped(9);
      return;
    }
    let i = 0;
    const t = window.setInterval(() => {
      i++;
      setTyped(i);
      if (i >= 9) window.clearInterval(t);
    }, 70);
    return () => window.clearInterval(t);
  }, [reduced]);

  if (!r) return <Navigate to="/reservar" replace />;
  const t = TABLE_BY_ID[r.tableId];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(r.code);
      toast('Código copiado.');
    } catch {
      toast(`Tu código es ${r.code}`, { kind: 'info' });
    }
  };

  return (
    <section className="confirm on-dark" aria-labelledby="c-title">
      <div className="confirm__tiles" aria-hidden>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} style={{ ['--i' as string]: i }} className={`ctile ctile--${i % 3}`} />
        ))}
      </div>
      <div className="container confirm__inner">
        <svg className="confirm__table" viewBox="0 0 120 80" aria-hidden>
          <rect x="16" y="14" width="88" height="52" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="44" cy="40" r="12" fill="var(--chile)" />
          <circle cx="76" cy="40" r="12" fill="var(--maiz)" />
          <circle cx="4" cy="40" r="4" fill="currentColor" />
          <circle cx="116" cy="40" r="4" fill="currentColor" />
        </svg>
        <p className="eyebrow maiz">Reserva recibida</p>
        <h1 id="c-title" className="confirm__title display">
          Tu mesa <span className="serif-i">está apartada.</span>
        </h1>
        <p className="lead confirm__lead">Te esperamos, {r.name.split(' ')[0]}. Guarda tu código: lo necesitarás junto con tu teléfono para consultar o cambiar tu reserva.</p>
        <div className="code-card">
          <span className="code-card__label mono">Código de reserva</span>
          <span className="code-card__code mono" aria-label={r.code}>
            {r.code.slice(0, typed)}
            <span className="code-card__caret" aria-hidden />
          </span>
          <button className="btn btn--sm" onClick={copy}>
            <Copy aria-hidden /> Copiar código
          </button>
        </div>
        <ul className="confirm__details">
          <li>{formatLong(r.date)}</li>
          <li className="tnum">
            {r.slot}–{endSlot(r.slot)}
          </li>
          <li>{partyLabel(r.party)}</li>
          <li>
            {t.name} · {t.features.join(' · ')}
          </li>
          {r.occasion !== 'Ninguna' && <li>{occasionLabel(r)}</li>}
        </ul>
        <div className="confirm__status">
          <StatusBadge status={r.status} />
          <span>El restaurante confirmará tu reserva en breve. Tu mesa ya está apartada.</span>
        </div>
        <div className="confirm__actions">
          <Link viewTransition to={`/mis-reservas/${r.code}`} className="btn btn--primary btn--lg">
            Ver mi reserva <ArrowUpRight className="arrow" aria-hidden />
          </Link>
          <button className="btn btn--ghost btn--lg" onClick={() => toast('Acción simulada: en un restaurante real se agregaría a tu calendario.', { kind: 'info' })}>
            <CalendarPlus aria-hidden /> Agregar al calendario <SimPill />
          </button>
          <Link viewTransition to="/" className="link">
            Volver al inicio
          </Link>
        </div>
        <p className="confirm__note">
          <Check aria-hidden /> Recibirías un SMS de confirmación en un restaurante real. En esta demo no se envían mensajes. <SimPill />
        </p>
        <p className="sr-only">{STATUS_INFO[r.status].client}</p>
      </div>
    </section>
  );
}
