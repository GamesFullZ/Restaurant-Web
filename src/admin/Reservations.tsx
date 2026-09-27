import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, History, Lock, MoreHorizontal, Pencil, Search, X, XCircle, Award } from 'lucide-react';
import { useDB } from '@/store/db';
import { adminActions, isPendingClose, occasionLabel } from '@/domain/reservations';
import { isActive } from '@/domain/availability';
import { TABLE_BY_ID } from '@/domain/constants';
import type { Reservation, ReservationStatus } from '@/domain/types';
import { formatPhone, slugify } from '@/domain/validation';
import { addDays, endSlot, formatAdmin, formatDateTimeShort, formatLong, toISODate } from '@/lib/dates';
import { StatusBadge } from '@/components/Tags';
import { Dialog } from '@/components/Dialog';
import { useNow } from '@/lib/useNow';
import { useTitle } from '@/lib/useTitle';
import { cx } from '@/lib/cx';
import { runReservationAction } from './ops';

const STATUSES: ReservationStatus[] = ['Pendiente', 'Confirmada', 'Modificada', 'Cancelada', 'Completada'];
const DATE_OPTS = [
  { v: 'hoy', l: 'Hoy' },
  { v: 'manana', l: 'Mañana' },
  { v: '7', l: 'Próximos 7 días' },
  { v: 'todas', l: 'Todas' },
];

export default function Reservations() {
  useTitle('Reservas');
  const db = useDB();
  const now = useNow();
  const [q, setQ] = useSearchParams();
  const today = toISODate(now);
  const fecha = q.get('fecha') ?? 'hoy';
  const estados = (q.get('estado')?.split(',').filter(Boolean) ?? []) as ReservationStatus[];
  const search = q.get('q') ?? '';
  const aviso = q.get('aviso');
  const openCode = q.get('reserva');
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setParam = (k: string, v: string | null) => {
    const n = new URLSearchParams(q);
    if (v === null || v === '') n.delete(k);
    else n.set(k, v);
    setQ(n, { replace: true });
  };

  const list = useMemo(() => {
    const norm = slugify(search);
    let r = db.reservations.filter((x) => {
      if (fecha === 'hoy') return x.date === today;
      if (fecha === 'manana') return x.date === addDays(today, 1);
      if (fecha === '7') return x.date >= today && x.date <= addDays(today, 7);
      if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return x.date === fecha;
      return true;
    });
    if (estados.length) r = r.filter((x) => estados.includes(x.status));
    if (norm) r = r.filter((x) => slugify(x.name).includes(norm) || slugify(x.code).includes(norm));
    if (aviso === 'cerrar') r = r.filter((x) => isPendingClose(x, now));
    if (aviso === 'bloqueada') r = r.filter((x) => isActive(x) && !!db.blocks[x.tableId] && x.date >= today);
    const key = (x: Reservation) => x.date + x.slot;
    if (fecha === 'todas') {
      const fut = r.filter((x) => x.date >= today).sort((a, b) => key(a).localeCompare(key(b)));
      const past = r.filter((x) => x.date < today).sort((a, b) => key(b).localeCompare(key(a)));
      return [...fut, ...past];
    }
    return r.sort((a, b) => key(a).localeCompare(key(b)));
  }, [db, fecha, estados.join(), search, aviso, today, now]); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = openCode ? db.reservations.find((x) => x.code === openCode) ?? null : null;
  const warnings = (r: Reservation) => [
    ...(isActive(r) && db.blocks[r.tableId] && r.date >= today ? ['Mesa bloqueada — reasignar'] : []),
    ...(isPendingClose(r, now) ? ['Pendiente de cerrar'] : []),
  ];
  const activeFilters = (fecha !== 'hoy' ? 1 : 0) + estados.length + (aviso ? 1 : 0);

  const Filters = (
    <div className="filters">
      <div className="filters__group">
        <span className="filters__label">Fecha</span>
        <div className="chips">
          {DATE_OPTS.map((o) => (
            <button key={o.v} className={cx('chip chip--sm', fecha === o.v && 'is-on')} aria-pressed={fecha === o.v} onClick={() => setParam('fecha', o.v)}>
              {o.l}
            </button>
          ))}
          <input
            type="date"
            className={cx('input input--date input--sm', /^\d{4}/.test(fecha) && 'is-on')}
            aria-label="Fecha específica"
            value={/^\d{4}/.test(fecha) ? fecha : ''}
            onChange={(e) => setParam('fecha', e.target.value || 'hoy')}
          />
        </div>
      </div>
      <div className="filters__group">
        <span className="filters__label">Estado</span>
        <div className="chips">
          {STATUSES.map((s) => {
            const on = estados.includes(s);
            return (
              <button
                key={s}
                className={cx('chip chip--sm', on && 'is-on')}
                aria-pressed={on}
                onClick={() => setParam('estado', (on ? estados.filter((x) => x !== s) : [...estados, s]).join(','))}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
      {aviso && (
        <button className="chip chip--sm is-on" onClick={() => setParam('aviso', null)}>
          {aviso === 'cerrar' ? 'Pendientes de cerrar' : 'En mesas bloqueadas'} <X aria-hidden />
        </button>
      )}
    </div>
  );

  return (
    <div className="resv">
      <header className="admin-head">
        <div>
          <p className="eyebrow accent">Gestión</p>
          <h1 className="admin-title display">Reservas</h1>
        </div>
      </header>
      <div className="toolbar">
        <label className="search">
          <Search aria-hidden />
          <span className="sr-only">Buscar por nombre o código</span>
          <input className="input" placeholder="Buscar por nombre o código" value={search} onChange={(e) => setParam('q', e.target.value)} />
        </label>
        <button className="btn btn--ghost btn--sm filters-toggle" onClick={() => setFiltersOpen(true)}>
          Filtros {activeFilters > 0 && `(${activeFilters})`}
        </button>
        <div className="filters-inline">{Filters}</div>
      </div>
      <p className="count" role="status">
        {list.length} {list.length === 1 ? 'resultado' : 'resultados'}
      </p>

      {list.length === 0 ? (
        <div className="empty">
          <p className="serif-i empty__title">No hay reservas con estos filtros.</p>
          <button className="btn btn--ghost btn--sm" onClick={() => setQ(new URLSearchParams({ fecha: 'todas' }))}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <table className="rtable">
            <caption className="sr-only">Reservas</caption>
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Fecha</th>
                <th scope="col">Hora</th>
                <th scope="col">Nombre</th>
                <th scope="col">Pers.</th>
                <th scope="col">Mesa</th>
                <th scope="col" className="col-occ">
                  Ocasión
                </th>
                <th scope="col">Estado</th>
                <th scope="col">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const a = adminActions(r, now);
                const w = warnings(r);
                return (
                  <tr key={r.id} className={cx(selected?.id === r.id && 'is-sel', r.status === 'Cancelada' && 'is-cancel')}>
                    <td>
                      <button className="linkish mono" onClick={() => setParam('reserva', r.code)}>
                        {r.code}
                      </button>
                    </td>
                    <td className="tnum">{formatAdmin(r.date)}</td>
                    <td className="tnum">{r.slot}</td>
                    <td>
                      <strong>{r.name}</strong>
                      {w.map((x) => (
                        <span key={x} className="warn">
                          <AlertTriangle aria-hidden /> {x}
                        </span>
                      ))}
                      {r.origin === 'Demo' && <span className="pill pill--demo">Demo</span>}
                    </td>
                    <td className="tnum">{r.party}</td>
                    <td>{r.tableId}</td>
                    <td className="col-occ">{r.occasion === 'Ninguna' ? '—' : occasionLabel(r)}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="rtable__actions">
                      {a.confirm && (
                        <button className="btn btn--sm btn--primary" onClick={() => runReservationAction(r, 'confirm')}>
                          Confirmar
                        </button>
                      )}
                      <RowMenu r={r} open={menuFor === r.id} setOpen={(o) => setMenuFor(o ? r.id : null)} onView={() => setParam('reserva', r.code)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ul className="rcards">
            {list.map((r) => {
              const a = adminActions(r, now);
              return (
                <li key={r.id} className="rcard">
                  <button className="rcard__main" onClick={() => setParam('reserva', r.code)}>
                    <span className="rcard__time display tnum">{r.slot}</span>
                    <span className="rcard__info">
                      <strong>{r.name}</strong>
                      <span>
                        {formatAdmin(r.date)} · {r.party} pers. · {TABLE_BY_ID[r.tableId].name}
                        {r.occasion !== 'Ninguna' && ` · ${occasionLabel(r)}`}
                      </span>
                      <span className="mono">{r.code}</span>
                    </span>
                    <StatusBadge status={r.status} />
                  </button>
                  {warnings(r).map((x) => (
                    <span key={x} className="warn">
                      <AlertTriangle aria-hidden /> {x}
                    </span>
                  ))}
                  {a.confirm && (
                    <button className="btn btn--sm btn--primary" onClick={() => runReservationAction(r, 'confirm')}>
                      Confirmar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {filtersOpen && (
        <div className="sheet" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="sheet__scrim" onClick={() => setFiltersOpen(false)} />
          <div className="sheet__body">
            <div className="sheet__head">
              <h2 className="h3">Filtros</h2>
              <button className="icon-btn" onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros">
                <X aria-hidden />
              </button>
            </div>
            {Filters}
            <div className="sheet__actions">
              <button className="btn btn--ghost" onClick={() => setQ(new URLSearchParams({ fecha: 'hoy' }))}>
                Limpiar
              </button>
              <button className="btn" onClick={() => setFiltersOpen(false)}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && <DetailPanel r={selected} onClose={() => setParam('reserva', null)} />}
    </div>
  );
}

function RowMenu({ r, open, setOpen, onView }: { r: Reservation; open: boolean; setOpen: (o: boolean) => void; onView: () => void }) {
  const now = useNow();
  const a = adminActions(r, now);
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [ask, setAsk] = useState(false);
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', fn);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', fn);
      document.removeEventListener('keydown', key);
    };
  }, [open, setOpen]);
  return (
    <div className="rowmenu" ref={ref}>
      <button className="icon-btn" aria-label={`Más acciones para ${r.code}`} aria-expanded={open} onClick={() => setOpen(!open)}>
        <MoreHorizontal aria-hidden />
      </button>
      {open && (
        <div className="rowmenu__list" role="menu">
          <button role="menuitem" onClick={onView}>
            Ver detalle
          </button>
          <button role="menuitem" disabled={!a.modify} onClick={() => nav(`/admin/reservas/${r.code}/modificar`)}>
            Modificar
          </button>
          <button role="menuitem" disabled={!a.cancel} onClick={() => setAsk(true)}>
            Cancelar
          </button>
          <button role="menuitem" disabled={!a.complete} title={a.completeReason} onClick={() => runReservationAction(r, 'complete').then(() => setOpen(false))}>
            Marcar como completada
          </button>
          {a.completeReason && <p className="rowmenu__why">{a.completeReason}</p>}
        </div>
      )}
      <CancelDialog r={r} open={ask} onClose={() => { setAsk(false); setOpen(false); }} />
    </div>
  );
}

function CancelDialog({ r, open, onClose }: { r: Reservation; open: boolean; onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="¿Cancelar esta reserva?"
      initialFocus="[data-safe]"
      actions={
        <>
          <button className="btn btn--danger" onClick={() => runReservationAction(r, 'cancel').then(onClose)}>
            Cancelar reserva
          </button>
          <button className="btn" data-safe onClick={onClose}>
            Mantener
          </button>
        </>
      }
    >
      <p>La mesa se liberará de inmediato. Esta acción no se puede deshacer.</p>
      <p className="dialog-sum">
        <span className="mono">{r.code}</span> · {formatLong(r.date)} · {r.slot} · {r.name}
      </p>
    </Dialog>
  );
}

function DetailPanel({ r, onClose }: { r: Reservation; onClose: () => void }) {
  const now = useNow();
  const db = useDB();
  const a = adminActions(r, now);
  const t = TABLE_BY_ID[r.tableId];
  const [ask, setAsk] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = toISODate(now);
  useEffect(() => {
    ref.current?.focus();
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [r.id, onClose]);
  const blocked = isActive(r) && db.blocks[r.tableId] && r.date >= today;
  return (
    <>
      <div className="dpanel-scrim" onClick={onClose} aria-hidden />
      <aside className="detail" role="dialog" aria-modal="true" aria-labelledby="det-t" tabIndex={-1} ref={ref}>
        <div className="detail__head">
          <div>
            <p className="mono muted">{r.code}</p>
            <h2 id="det-t" className="detail__title display">
              {r.name}
            </h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar detalle">
            <X aria-hidden />
          </button>
        </div>
        <div className="detail__status">
          <StatusBadge status={r.status} />
          {r.origin === 'Demo' && <span className="pill pill--demo">Demo</span>}
          {blocked && (
            <span className="warn">
              <Lock aria-hidden /> Mesa bloqueada — reasignar
            </span>
          )}
          {isPendingClose(r, now) && (
            <span className="warn">
              <AlertTriangle aria-hidden /> Pendiente de cerrar
            </span>
          )}
        </div>
        <dl className="kv">
          <div>
            <dt>Fecha</dt>
            <dd>{formatLong(r.date)}</dd>
          </div>
          <div>
            <dt>Horario</dt>
            <dd className="tnum">
              {r.slot}–{endSlot(r.slot)}
            </dd>
          </div>
          <div>
            <dt>Personas</dt>
            <dd>{r.party}</dd>
          </div>
          <div>
            <dt>Mesa</dt>
            <dd>
              {t.name} · {t.features.join(' · ')}
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
            <dt>Teléfono</dt>
            <dd className="tnum">{formatPhone(r.phone)}</dd>
          </div>
          <div>
            <dt>Comentario</dt>
            <dd>{r.comment || '—'}</dd>
          </div>
          <div>
            <dt>Origen</dt>
            <dd>{r.origin}</dd>
          </div>
          <div>
            <dt>Creada / actualizada</dt>
            <dd className="tnum">
              {formatDateTimeShort(r.createdAt)} · {formatDateTimeShort(r.updatedAt)}
            </dd>
          </div>
        </dl>
        <section className="history" aria-labelledby="hist-t">
          <h3 id="hist-t" className="history__title">
            <History aria-hidden /> Historial
          </h3>
          <ol>
            {[...r.history].reverse().map((h, i) => (
              <li key={i}>
                <span className="history__dot" aria-hidden />
                <div>
                  <strong>{h.action}</strong> · {h.actor} · <span className="tnum">{formatDateTimeShort(h.at)}</span>
                  {h.changes?.map((c, j) => (
                    <p key={j} className="history__chg">
                      {c.field}: {c.before} → {c.after}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>
        <div className="detail__actions">
          {a.confirm && (
            <button className="btn btn--primary" onClick={() => runReservationAction(r, 'confirm')}>
              <Check aria-hidden /> Confirmar
            </button>
          )}
          {a.modify && (
            <Link className="btn btn--ghost" to={`/admin/reservas/${r.code}/modificar`}>
              <Pencil aria-hidden /> Modificar
            </Link>
          )}
          {a.cancel && (
            <button className="btn btn--danger" onClick={() => setAsk(true)}>
              <XCircle aria-hidden /> Cancelar
            </button>
          )}
          {(a.complete || a.completeReason) && (
            <div className="detail__complete">
              <button className="btn btn--ghost" disabled={!a.complete} onClick={() => runReservationAction(r, 'complete')}>
                <Award aria-hidden /> Marcar como completada
              </button>
              {a.completeReason && <p className="muted">{a.completeReason}</p>}
            </div>
          )}
          {!a.modify && <p className="muted">Reserva en estado final: solo lectura.</p>}
        </div>
      </aside>
      <CancelDialog r={r} open={ask} onClose={() => setAsk(false)} />
    </>
  );
}
