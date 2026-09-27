import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Check, Minus, Plus } from 'lucide-react';
import { mutate, useDB } from '@/store/db';
import { modifyReservation } from '@/store/actions';
import { isActive, slotsOverlap, tableStatuses, isCompatible } from '@/domain/availability';
import { OCCASIONS, SLOTS, TABLE_BY_ID } from '@/domain/constants';
import type { Occasion, TableId } from '@/domain/types';
import { formatPhone, normalizePhone, validateName, validatePhone, maxLen } from '@/domain/validation';
import { occasionLabel } from '@/domain/reservations';
import { FloorLegend, FloorPlan } from '@/components/FloorPlan';
import { toast } from '@/components/toast';
import { endSlot, formatLong, isMonday } from '@/lib/dates';
import { useTitle } from '@/lib/useTitle';
import { simulateLatency } from '@/lib/motion';
import { cx } from '@/lib/cx';

export default function ReservationEdit() {
  const { code } = useParams();
  const db = useDB();
  const nav = useNavigate();
  const r = db.reservations.find((x) => x.code === code);
  useTitle(`Modificar ${code}`);
  const [f, setF] = useState(() =>
    r
      ? { date: r.date, slot: r.slot, party: r.party, tableId: r.tableId as TableId | null, occasion: r.occasion, occasionOther: r.occasionOther ?? '', occasionNotes: r.occasionNotes ?? '', name: r.name, phone: formatPhone(r.phone), comment: r.comment ?? '' }
      : null,
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const statuses = useMemo(() => (f && r ? tableStatuses({ date: f.date, slot: f.slot, party: f.party, selectedId: f.tableId, excludeId: r.id }, db) : []), [f, r, db]);
  if (!r || !f) return <Navigate to="/admin/reservas" replace />;
  if (!isActive(r)) return <Navigate to={`/admin/reservas?fecha=todas&reserva=${r.code}`} replace />;

  const set = (p: Partial<typeof f>) => {
    setErr(null);
    setF((x) => {
      const n = { ...x!, ...p };
      if (n.tableId && ('party' in p || 'slot' in p || 'date' in p)) {
        const t = TABLE_BY_ID[n.tableId];
        const busyT = db.reservations.some((o) => o.id !== r.id && o.tableId === n.tableId && o.date === n.date && o.status !== 'Cancelada' && slotsOverlap(o.slot, n.slot));
        if (!isCompatible(t.capacity, n.party) || busyT || db.blocks[n.tableId]) n.tableId = null;
      }
      return n;
    });
  };
  const slotFree = (s: string) => tableStatuses({ date: f.date, slot: s, party: f.party, excludeId: r.id }, db).some((x) => x.state === 'Disponible');
  const errors: Record<string, string | null> = {
    name: validateName(f.name),
    phone: validatePhone(f.phone),
    comment: maxLen(f.comment, 300),
    occasionNotes: maxLen(f.occasionNotes, 200),
    date: isMonday(f.date) ? 'Los lunes descansamos.' : null,
    tableId: f.tableId ? null : 'Elige una mesa disponible.',
    occasionOther: f.occasion === 'Otra' && f.occasionOther.trim().length < 2 ? 'Cuéntanos qué celebran.' : null,
  };
  const valid = Object.values(errors).every((e) => !e);
  const rows: [string, string, string][] = [
    ['Fecha', formatLong(r.date), formatLong(f.date)],
    ['Horario', `${r.slot}–${endSlot(r.slot)}`, `${f.slot}–${endSlot(f.slot)}`],
    ['Personas', String(r.party), String(f.party)],
    ['Mesa', r.tableId, f.tableId ?? '—'],
    ['Ocasión', occasionLabel(r), occasionLabel(f)],
    ['Nombre', r.name, f.name.trim()],
    ['Teléfono', formatPhone(r.phone), formatPhone(normalizePhone(f.phone))],
    ['Comentario', r.comment || '—', f.comment || '—'],
  ];
  const changed = rows.some(([, a, b]) => a !== b) || (r.occasionNotes ?? '') !== f.occasionNotes;

  const save = async () => {
    if (!valid) return;
    setBusy(true);
    await simulateLatency(300, 600);
    const res = mutate((s) => modifyReservation(s, r.id, { ...f, tableId: f.tableId! }, 'Admin', new Date()));
    setBusy(false);
    if (!res.ok) {
      setErr(
        res.error === 'conflict' || res.error === 'no-tables'
          ? 'La disponibilidad acaba de cambiar: esa mesa ya no está libre. Elige otra.'
          : res.error === 'duplicate'
            ? `Ese teléfono ya tiene una reserva a esa hora (${res.duplicateCode}).`
            : res.error === 'invalid-date'
              ? 'Esa fecha no se puede reservar.'
              : 'No se pudo guardar.',
      );
      if (res.error === 'conflict') set({ tableId: null });
      return;
    }
    toast('Reserva modificada.');
    nav(`/admin/reservas?fecha=${f.date}&reserva=${r.code}`);
  };

  return (
    <div className="redit">
      <Link to={`/admin/reservas?fecha=todas&reserva=${r.code}`} className="back-link">
        <ArrowLeft aria-hidden /> Volver al detalle
      </Link>
      <header className="admin-head">
        <div>
          <p className="eyebrow accent">Modificar reserva</p>
          <h1 className="admin-title display">{r.code}</h1>
          <p className="admin-sub">Sin plazo de 2 horas para el administrador. Las mesas ocupadas o bloqueadas no se pueden elegir.</p>
        </div>
      </header>
      <div className="redit__grid">
        <div className="redit__form panel">
          <div className={cx('field', errors.date && 'field--error')}>
            <label className="field__label" htmlFor="r-date">
              Fecha
            </label>
            <input id="r-date" type="date" className="input" value={f.date} onChange={(e) => e.target.value && set({ date: e.target.value })} />
            {errors.date && <p className="field__error">{errors.date}</p>}
          </div>
          <div className="field">
            <span className="field__label">Horario</span>
            <div className="chips" role="radiogroup" aria-label="Horario">
              {SLOTS.map(({ slot }) => {
                const ok = slotFree(slot);
                return (
                  <button key={slot} role="radio" aria-checked={f.slot === slot} className={cx('chip chip--sm', f.slot === slot && 'is-on', !ok && 'is-na')} onClick={() => set({ slot })} aria-label={`${slot}${ok ? '' : ', sin mesas compatibles'}`}>
                    <span className="tnum">{slot}</span>
                    <span className={cx('slot__dot slot__dot--inline', ok ? 'ok' : 'no')} aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="field">
            <span className="field__label">Personas</span>
            <div className="stepper">
              <button className="icon-btn" disabled={f.party <= 1} onClick={() => set({ party: f.party - 1 })} aria-label="Una persona menos">
                <Minus aria-hidden />
              </button>
              <output className="stepper__val tnum">{f.party}</output>
              <button className="icon-btn" disabled={f.party >= 6} onClick={() => set({ party: f.party + 1 })} aria-label="Una persona más">
                <Plus aria-hidden />
              </button>
            </div>
          </div>
          <div className="field">
            <span className="field__label">Ocasión</span>
            <div className="chips">
              {OCCASIONS.map((o) => (
                <button key={o} className={cx('chip chip--sm', f.occasion === o && 'is-on')} aria-pressed={f.occasion === o} onClick={() => set({ occasion: o as Occasion })}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          {f.occasion === 'Otra' && (
            <div className={cx('field', errors.occasionOther && 'field--error')}>
              <label className="field__label" htmlFor="r-other">
                ¿Qué celebran?
              </label>
              <input id="r-other" className="input" value={f.occasionOther} onChange={(e) => set({ occasionOther: e.target.value })} />
            </div>
          )}
          {f.occasion !== 'Ninguna' && (
            <div className="field">
              <label className="field__label" htmlFor="r-notes">
                Instrucciones
              </label>
              <textarea id="r-notes" className="textarea" value={f.occasionNotes} onChange={(e) => set({ occasionNotes: e.target.value })} />
            </div>
          )}
          <div className="form-grid">
            <div className={cx('field', errors.name && 'field--error')}>
              <label className="field__label" htmlFor="r-name">
                Nombre
              </label>
              <input id="r-name" className="input" value={f.name} onChange={(e) => set({ name: e.target.value })} />
              {errors.name && <p className="field__error">{errors.name}</p>}
            </div>
            <div className={cx('field', errors.phone && 'field--error')}>
              <label className="field__label" htmlFor="r-phone">
                Teléfono
              </label>
              <input id="r-phone" className="input tnum" value={f.phone} onChange={(e) => set({ phone: e.target.value })} />
              {errors.phone && <p className="field__error">{errors.phone}</p>}
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="r-comment">
              Comentario
            </label>
            <textarea id="r-comment" className="textarea" value={f.comment} onChange={(e) => set({ comment: e.target.value })} />
          </div>
        </div>
        <div className="redit__side">
          <section className="panel">
            <h2 className="panel__title">Mesa a las {f.slot}</h2>
            <div className="floor-wrap">
              <FloorPlan statuses={statuses} selectedId={f.tableId} onSelect={(id) => set({ tableId: id })} compact />
            </div>
            <FloorLegend />
            <p className={cx('live-check', f.tableId ? 'ok' : 'no')} role="status">
              {f.tableId ? (
                <>
                  <Check aria-hidden /> Disponible: {TABLE_BY_ID[f.tableId].name} a las {f.slot}
                </>
              ) : (
                <>
                  <AlertTriangle aria-hidden /> Elige una mesa disponible.
                </>
              )}
            </p>
          </section>
          <section className="panel">
            <h2 className="panel__title">Antes / Después</h2>
            <table className="ba">
              <thead>
                <tr>
                  <th>Dato</th>
                  <th>Antes</th>
                  <th>Después</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([k, a, b]) => (
                  <tr key={k} className={cx(a !== b && 'is-chg')}>
                    <th scope="row">{k}</th>
                    <td>{a}</td>
                    <td>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {err && (
            <div className="alert alert--error" role="alert">
              <AlertTriangle aria-hidden />
              <p className="alert__title">{err}</p>
            </div>
          )}
          <div className="redit__actions">
            <Link to={`/admin/reservas?fecha=todas&reserva=${r.code}`} className="btn btn--ghost">
              Cancelar edición
            </Link>
            <button className="btn btn--primary" disabled={!valid || !changed || busy} onClick={save}>
              {busy && <span className="spinner" aria-hidden />} Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
