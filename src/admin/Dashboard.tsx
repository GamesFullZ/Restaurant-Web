import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, Lock, Percent, Sparkles, Unlock, Users } from 'lucide-react';
import { useDB } from '@/store/db';
import { dayMetrics, defaultSlot } from '@/domain/metrics';
import { isActive, tableStatuses } from '@/domain/availability';
import { isPendingClose, occasionLabel } from '@/domain/reservations';
import { SLOTS, TABLE_BY_ID } from '@/domain/constants';
import type { TableId } from '@/domain/types';
import { FloorLegend, FloorPlan } from '@/components/FloorPlan';
import { StatusBadge } from '@/components/Tags';
import { addDays, capitalize, endSlot, formatLong, isMonday, toISODate } from '@/lib/dates';
import { operatingDay } from '@/data/seed';
import { useNow } from '@/lib/useNow';
import { useTitle } from '@/lib/useTitle';
import { cx } from '@/lib/cx';
import { BlockDialog } from './BlockDialog';
import { doUnblock, runReservationAction } from './ops';

export default function Dashboard() {
  useTitle('Dashboard');
  const db = useDB();
  const now = useNow();
  const nav = useNavigate();
  const today = toISODate(now);
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState(() => defaultSlot(today, now, db.reservations));
  const [tableSel, setTableSel] = useState<TableId | null>(null);
  const [blockId, setBlockId] = useState<TableId | null>(null);
  const m = useMemo(() => dayMetrics(date, slot, now, db), [date, slot, now, db]);
  const statuses = useMemo(() => tableStatuses({ date, slot, selectedId: tableSel }, db), [date, slot, tableSel, db]);
  const dayRes = db.reservations.filter((r) => r.date === date).sort((a, b) => a.slot.localeCompare(b.slot));
  const upcoming = dayRes.filter(isActive).filter((r) => date !== today || r.slot >= `${String(now.getHours()).padStart(2, '0')}:00`).slice(0, 5);
  const pendingCount = db.reservations.filter((r) => r.status === 'Pendiente' && r.date >= today).length;
  const toClose = db.reservations.filter((r) => isPendingClose(r, now)).length;
  const blockedAffected = db.reservations.filter((r) => isActive(r) && r.date >= today && db.blocks[r.tableId]).length;
  const closed = isMonday(date);

  const changeDate = (d: string) => {
    setDate(d);
    setSlot(defaultSlot(d, now, db.reservations));
    setTableSel(null);
  };
  const selTable = tableSel ? TABLE_BY_ID[tableSel] : null;
  const selBlock = tableSel ? db.blocks[tableSel] : undefined;
  const tableRes = tableSel ? dayRes.filter((r) => r.tableId === tableSel && r.status !== 'Cancelada') : [];

  const kpis = [
    { label: 'Reservas del día', value: String(m.reservations), sub: `${m.people} personas`, icon: CalendarDays, to: `/admin/reservas?fecha=${date}` },
    { label: 'Pendientes', value: String(m.pending), sub: 'por confirmar', icon: Clock3, to: `/admin/reservas?fecha=${date}&estado=Pendiente`, accent: m.pending > 0 },
    { label: 'Ocupación del día', value: `${m.occupancy}%`, sub: 'mesa × horario', icon: Percent, meter: m.occupancy },
    { label: 'Mesas ocupadas', value: String(m.occupied), sub: `a las ${slot}`, icon: Users },
    { label: 'Mesas disponibles', value: String(m.available), sub: `a las ${slot}`, icon: Unlock },
    { label: 'Completadas', value: String(m.completed), sub: 'del día', icon: Sparkles, to: `/admin/reservas?fecha=${date}&estado=Completada` },
    { label: 'Canceladas', value: String(m.cancelled), sub: 'del día', icon: AlertTriangle, to: `/admin/reservas?fecha=${date}&estado=Cancelada` },
  ];

  return (
    <div className="dash">
      <header className="admin-head">
        <div>
          <p className="eyebrow accent">Dashboard</p>
          <h1 className="admin-title display">{date === today ? 'Hoy' : capitalize(formatLong(date).split(' ')[0])}</h1>
          <p className="admin-sub">{capitalize(formatLong(date))}</p>
        </div>
        <div className="datebar">
          <button className="icon-btn" onClick={() => changeDate(addDays(date, -1))} aria-label="Día anterior">
            <ChevronLeft aria-hidden />
          </button>
          <input type="date" className="input input--date" value={date} onChange={(e) => e.target.value && changeDate(e.target.value)} aria-label="Elegir fecha" />
          <button className="icon-btn" onClick={() => changeDate(addDays(date, 1))} aria-label="Día siguiente">
            <ChevronRight aria-hidden />
          </button>
          {date !== today && (
            <button className="btn btn--sm btn--ghost" onClick={() => changeDate(today)}>
              Hoy
            </button>
          )}
        </div>
      </header>

      {(pendingCount > 0 || toClose > 0 || blockedAffected > 0) && (
        <div className="alerts-row">
          {pendingCount > 0 && (
            <Link className="alert-chip" to="/admin/reservas?fecha=todas&estado=Pendiente">
              <Clock3 aria-hidden /> {pendingCount} {pendingCount === 1 ? 'reserva pendiente' : 'reservas pendientes'} de confirmar
            </Link>
          )}
          {toClose > 0 && (
            <Link className="alert-chip" to="/admin/reservas?fecha=todas&aviso=cerrar">
              <AlertTriangle aria-hidden /> {toClose} {toClose === 1 ? 'reserva pendiente' : 'reservas pendientes'} de cerrar
            </Link>
          )}
          {blockedAffected > 0 && (
            <Link className="alert-chip alert-chip--warn" to="/admin/reservas?fecha=todas&aviso=bloqueada">
              <Lock aria-hidden /> {blockedAffected} en mesas bloqueadas
            </Link>
          )}
        </div>
      )}

      {closed ? (
        <div className="empty">
          <svg className="empty__art" viewBox="0 0 64 40" aria-hidden>
            <rect x="6" y="6" width="52" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p className="serif-i empty__title">Hoy cerrado. Los lunes descansamos.</p>
          <button className="btn" onClick={() => changeDate(operatingDay(date, 0))}>
            Ver el {formatLong(operatingDay(date, 0))}
          </button>
        </div>
      ) : (
        <>
          <ul className="kpis">
            {kpis.map((k) => {
              const inner = (
                <>
                  <span className="kpi__label">
                    <k.icon aria-hidden /> {k.label}
                  </span>
                  <span className="kpi__value display tnum">{k.value}</span>
                  <span className="kpi__sub">{k.sub}</span>
                  {k.meter !== undefined && (
                    <span className="kpi__meter" aria-hidden>
                      <span style={{ width: `${k.meter}%` }} />
                    </span>
                  )}
                </>
              );
              return (
                <li key={k.label} className={cx('kpi', k.accent && 'kpi--accent')}>
                  {k.to ? (
                    <Link to={k.to} className="kpi__link">
                      {inner}
                    </Link>
                  ) : (
                    <div className="kpi__link">{inner}</div>
                  )}
                </li>
              );
            })}
            <li className="kpi kpi--next">
              <div className="kpi__link">
                <span className="kpi__label">
                  <ArrowRight aria-hidden /> Próxima reserva
                </span>
                {m.next ? (
                  <button className="kpi__nextbtn" onClick={() => nav(`/admin/reservas?fecha=todas&reserva=${m.next!.code}`)}>
                    <span className="kpi__value display tnum">{m.next.slot}</span>
                    <span className="kpi__sub">
                      {m.next.name} · {m.next.party} pers. · {TABLE_BY_ID[m.next.tableId].name}
                      {m.next.occasion !== 'Ninguna' ? ` · ${occasionLabel(m.next)}` : ''}
                    </span>
                  </button>
                ) : (
                  <span className="kpi__sub">Sin más reservas este día.</span>
                )}
              </div>
            </li>
          </ul>

          <div className="dash-grid">
            <section className="panel" aria-labelledby="map-t">
              <div className="panel__head">
                <h2 id="map-t" className="panel__title">
                  Mapa del restaurante
                </h2>
                <div className="chips chips--scroll slot-chips" role="group" aria-label="Horario">
                  {SLOTS.map((s) => (
                    <button key={s.slot} className={cx('chip chip--sm', slot === s.slot && 'is-on')} aria-pressed={slot === s.slot} onClick={() => setSlot(s.slot)}>
                      <span className="tnum">{s.slot}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="floor-wrap">
                <FloorPlan statuses={statuses} mode="admin" selectedId={tableSel} onSelect={(id) => setTableSel(id === tableSel ? null : id)} label={`Plano a las ${slot}. Elige una mesa para ver sus reservas.`} />
              </div>
              <FloorLegend admin />
              {selTable && (
                <div className="tpanel" aria-live="polite">
                  <div className="tpanel__head">
                    <div>
                      <h3 className="tpanel__name display">{selTable.name}</h3>
                      <p className="muted">
                        {selTable.capacity} personas · {selTable.zone} · {selTable.features.join(' · ')}
                      </p>
                    </div>
                    {selBlock ? (
                      <button className="btn btn--sm" onClick={() => doUnblock(selTable.id)}>
                        <Unlock aria-hidden /> Desbloquear
                      </button>
                    ) : (
                      <button className="btn btn--sm btn--ghost" onClick={() => setBlockId(selTable.id)}>
                        <Lock aria-hidden /> Bloquear mesa
                      </button>
                    )}
                  </div>
                  {selBlock && (
                    <p className="tpanel__block">
                      <Lock aria-hidden width={15} /> {selBlock.type}
                      {selBlock.note ? ` · “${selBlock.note}”` : ''}
                    </p>
                  )}
                  <div className="daytl" aria-label="Reservas de la mesa en el día">
                    {['13:00', '15:00', '17:00', '19:00', '21:00'].map((h) => (
                      <span key={h} className="daytl__tick" style={{ left: `${((Number(h.slice(0, 2)) - 13) / 9.5) * 100}%` }}>
                        {h}
                      </span>
                    ))}
                    {tableRes.map((r) => {
                      const start = (Number(r.slot.slice(0, 2)) + Number(r.slot.slice(3)) / 60 - 13) / 9.5;
                      return (
                        <Link key={r.id} to={`/admin/reservas?fecha=${date}&reserva=${r.code}`} className={`daytl__block st-${r.status}`} style={{ left: `${start * 100}%`, width: `${(1.5 / 9.5) * 100}%` }} title={`${r.slot}–${endSlot(r.slot)} ${r.name}`}>
                          <span className="tnum">{r.slot}</span> {r.name.split(' ')[0]}
                        </Link>
                      );
                    })}
                  </div>
                  {tableRes.length === 0 && <p className="muted">Sin reservas en esta mesa este día.</p>}
                </div>
              )}
            </section>

            <section className="panel" aria-labelledby="up-t">
              <div className="panel__head">
                <h2 id="up-t" className="panel__title">
                  Próximas reservas
                </h2>
                <Link to={`/admin/reservas?fecha=${date}`} className="link">
                  Ver todas
                </Link>
              </div>
              {upcoming.length === 0 ? (
                <div className="empty">
                  <p className="serif-i empty__title">No hay reservas para este día.</p>
                  <Link to="/admin/reservas?fecha=7" className="btn btn--sm btn--ghost">
                    Ver próximos 7 días
                  </Link>
                </div>
              ) : (
                <ul className="uplist">
                  {upcoming.map((r) => (
                    <li key={r.id}>
                      <span className="uplist__time display tnum">{r.slot}</span>
                      <div className="uplist__who">
                        <Link to={`/admin/reservas?fecha=${date}&reserva=${r.code}`}>
                          <strong>{r.name}</strong>
                        </Link>
                        <span className="muted">
                          {r.party} pers. · {TABLE_BY_ID[r.tableId].name}
                          {r.occasion !== 'Ninguna' && ` · ${occasionLabel(r)}`}
                        </span>
                      </div>
                      <StatusBadge status={r.status} />
                      {(r.status === 'Pendiente' || r.status === 'Modificada') && (
                        <button className="btn btn--sm btn--primary" onClick={() => runReservationAction(r, 'confirm')} aria-label={`Confirmar reserva de ${r.name}`}>
                          Confirmar
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
      <BlockDialog tableId={blockId} onClose={() => setBlockId(null)} />
    </div>
  );
}
