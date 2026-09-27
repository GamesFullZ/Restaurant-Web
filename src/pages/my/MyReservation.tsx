import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight, Copy, Phone, RotateCcw, Search } from 'lucide-react';
import { mutate, useDB, useExternalChangeAt } from '@/store/db';
import { isVerified } from '@/store/session';
import { cancelReservation } from '@/store/actions';
import { TABLE_BY_ID } from '@/domain/constants';
import { tableStatuses } from '@/domain/availability';
import { clientCanChange, occasionLabel, partyLabel, STATUS_INFO } from '@/domain/reservations';
import { maskPhone, normalizeCode } from '@/domain/validation';
import { endSlot, formatLong, relativeFrom } from '@/lib/dates';
import { StatusBadge, SimPill } from '@/components/Tags';
import { FloorPlan } from '@/components/FloorPlan';
import { Dialog } from '@/components/Dialog';
import { toast } from '@/components/toast';
import { useNow } from '@/lib/useNow';
import { useTitle } from '@/lib/useTitle';
import { simulateLatency } from '@/lib/motion';
import './my.css';

export default function MyReservation() {
  const { code = '' } = useParams();
  const db = useDB();
  const now = useNow();
  const nav = useNavigate();
  const ext = useExternalChangeAt();
  const r = db.reservations.find((x) => x.code === normalizeCode(code));
  useTitle(r ? `Reserva ${r.code}` : 'Mis reservas');
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const firstExt = useRef(ext);

  useEffect(() => {
    if (ext !== firstExt.current) toast('Esta reserva se actualizó.', { kind: 'info' });
  }, [ext, r?.updatedAt]);

  if (!r || !isVerified(r.id)) return <Navigate to={`/mis-reservas?codigo=${encodeURIComponent(normalizeCode(code))}`} replace />;

  const t = TABLE_BY_ID[r.tableId];
  const can = clientCanChange(r, now);
  const statuses = tableStatuses({ date: r.date, slot: r.slot }, { reservations: [], blocks: {} }).map((s) => (s.table.id === r.tableId ? { ...s, state: 'Seleccionada' as const } : { ...s, state: 'Disponible' as const }));

  const doCancel = async () => {
    setBusy(true);
    await simulateLatency(300, 600);
    mutate((s) => cancelReservation(s, r.id, 'Cliente', new Date()));
    setBusy(false);
    setAsk(false);
    setCancelled(true);
    toast('Reserva cancelada.');
  };

  if (cancelled || (r.status === 'Cancelada' && cancelled)) {
    return (
      <section className="my-page my-cancelled">
        <div className="container my-cancelled__inner">
          <svg viewBox="0 0 120 80" className="my-cancelled__art" aria-hidden>
            <rect x="16" y="14" width="88" height="52" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="44" cy="40" r="12" fill="none" stroke="currentColor" strokeDasharray="3 4" strokeWidth="2" />
            <circle cx="76" cy="40" r="12" fill="none" stroke="currentColor" strokeDasharray="3 4" strokeWidth="2" />
          </svg>
          <h1 className="my-title display">
            Tu reserva <span className="serif-i">fue cancelada.</span>
          </h1>
          <p className="lead">Esperamos verte pronto.</p>
          <p className="mono my-code">{r.code}</p>
          <StatusBadge status="Cancelada" />
          <div className="my-actions">
            <Link viewTransition to={`/reservar?personas=${r.party}`} className="btn btn--primary btn--lg">
              <RotateCcw aria-hidden /> Reservar de nuevo
            </Link>
            <Link viewTransition to="/" className="btn btn--ghost btn--lg">
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(r.code);
      toast('Código copiado.');
    } catch {
      toast(`Tu código es ${r.code}`, { kind: 'info' });
    }
  };

  return (
    <section className="my-page">
      <div className="container my-detail">
        <div className="my-detail__main">
          <div className="my-detail__top">
            <p className="eyebrow accent">Tu reserva</p>
            <button className="code-chip mono" onClick={copy} aria-label={`Copiar código ${r.code}`}>
              {r.code} <Copy aria-hidden />
            </button>
          </div>
          <h1 className="my-title display">{formatLong(r.date)}</h1>
          <p className="my-when serif-i tnum">
            {r.slot}–{endSlot(r.slot)} · {partyLabel(r.party)}
          </p>
          <div className="my-status">
            <StatusBadge status={r.status} />
            <span>{STATUS_INFO[r.status].client}</span>
          </div>
          <dl className="kv">
            <div>
              <dt>Mesa</dt>
              <dd>
                {t.name} · {t.zone} · {t.features.join(' · ')}
              </dd>
            </div>
            <div>
              <dt>Ocasión</dt>
              <dd>
                {occasionLabel(r)}
                {r.occasionNotes && <span className="kv__note">“{r.occasionNotes}”</span>}
              </dd>
            </div>
            <div>
              <dt>A nombre de</dt>
              <dd>
                {r.name} · <span className="tnum">{maskPhone(r.phone)}</span>
              </dd>
            </div>
            <div>
              <dt>Comentario</dt>
              <dd>{r.comment || '—'}</dd>
            </div>
            <div>
              <dt>Última actualización</dt>
              <dd>{relativeFrom(r.updatedAt, now)}</dd>
            </div>
          </dl>
          {r.status === 'Cancelada' || r.status === 'Completada' ? (
            <div className="my-actions">
              <Link viewTransition to={`/reservar?personas=${r.party}`} className="btn btn--primary">
                <RotateCcw aria-hidden /> Reservar de nuevo
              </Link>
            </div>
          ) : can.ok ? (
            <div className="my-actions">
              <button className="btn btn--primary" onClick={() => nav(`/mis-reservas/${r.code}/modificar`)}>
                Modificar reserva <ArrowUpRight className="arrow" aria-hidden />
              </button>
              <button className="btn btn--danger" onClick={() => setAsk(true)}>
                Cancelar reserva
              </button>
            </div>
          ) : (
            <div className="alert alert--info" role="note">
              <Phone aria-hidden />
              <p className="alert__title">Esta reserva ya no se puede cambiar en línea.</p>
              <p className="alert__text">{can.reason}</p>
              <div className="alert__actions">
                <button className="btn btn--sm" disabled aria-disabled>
                  Modificar reserva
                </button>
                <button className="btn btn--sm btn--ghost" onClick={() => toast('Llamada simulada: en un restaurante real se abriría tu marcador.', { kind: 'info' })}>
                  <Phone aria-hidden /> Llamar <SimPill />
                </button>
              </div>
            </div>
          )}
          <Link viewTransition to="/mis-reservas" className="link my-other">
            <Search aria-hidden width={16} /> Consultar otra reserva
          </Link>
        </div>
        <aside className="my-detail__map" aria-label="Tu mesa en el plano">
          <div className="floor-wrap">
            <FloorPlan statuses={statuses} selectedId={r.tableId} label={`Plano: tu mesa es la ${t.name}`} />
          </div>
          <p className="my-map__cap">
            <strong>{t.name}</strong> · {t.description}
          </p>
        </aside>
      </div>

      <Dialog
        open={ask}
        onClose={() => setAsk(false)}
        title="¿Cancelar tu reserva?"
        initialFocus="[data-safe]"
        actions={
          <>
            <button className="btn btn--danger" onClick={doCancel} disabled={busy}>
              {busy && <span className="spinner" aria-hidden />} Sí, cancelar reserva
            </button>
            <button className="btn" data-safe onClick={() => setAsk(false)}>
              Mantener mi reserva
            </button>
          </>
        }
      >
        <p>La mesa se liberará de inmediato y no podrás recuperarla.</p>
        <p className="dialog-sum">
          <span className="mono">{r.code}</span> · {formatLong(r.date)} · {r.slot} · {partyLabel(r.party)} · {t.name}
        </p>
      </Dialog>
    </section>
  );
}
