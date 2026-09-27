import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Ban, Wrench } from 'lucide-react';
import { Dialog } from '@/components/Dialog';
import { useDB } from '@/store/db';
import { TABLE_BY_ID } from '@/domain/constants';
import type { BlockType, TableId } from '@/domain/types';
import { isActive } from '@/domain/availability';
import { formatLong, toISODate } from '@/lib/dates';
import { cx } from '@/lib/cx';
import { doBlock } from './ops';

/** A-10 · bloqueo con aviso de reservas afectadas (FR-065, BR-015, BR-038). */
export function BlockDialog({ tableId, onClose }: { tableId: TableId | null; onClose: () => void }) {
  const db = useDB();
  const [type, setType] = useState<BlockType>('Mantenimiento');
  const [note, setNote] = useState('');
  useEffect(() => {
    setType('Mantenimiento');
    setNote('');
  }, [tableId]);
  const t = tableId ? TABLE_BY_ID[tableId] : null;
  const today = toISODate(new Date());
  const affected = t ? db.reservations.filter((r) => r.tableId === t.id && isActive(r) && r.date >= today).sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot)) : [];
  return (
    <Dialog
      open={!!tableId}
      onClose={onClose}
      title={t ? `Bloquear ${t.name}` : ''}
      initialFocus="[data-safe]"
      actions={
        <>
          <button className="btn btn--ghost" data-safe onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn--primary"
            onClick={() => {
              if (!t) return;
              doBlock(t.id, type, note);
              onClose();
            }}
          >
            Bloquear
          </button>
        </>
      }
    >
      {t && (
        <>
          <p className="muted">
            {t.capacity} personas · {t.zone} · {t.features.join(' · ')}
          </p>
          <div className="seg" role="radiogroup" aria-label="Tipo de bloqueo">
            {(['Mantenimiento', 'No disponible'] as BlockType[]).map((b) => (
              <button key={b} role="radio" aria-checked={type === b} className={cx('seg__btn', type === b && 'is-on')} onClick={() => setType(b)}>
                {b === 'Mantenimiento' ? <Wrench aria-hidden width={15} /> : <Ban aria-hidden width={15} />} {b}
              </button>
            ))}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="b-note">
              Nota <span className="opt">opcional</span>
            </label>
            <input id="b-note" className="input" maxLength={140} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej.: Silla dañada" />
            <span className="counter">{note.length}/140</span>
          </div>
          {affected.length > 0 && (
            <div className="alert alert--soft">
              <AlertTriangle aria-hidden />
              <p className="alert__title">
                Esta mesa tiene {affected.length} {affected.length === 1 ? 'reserva activa próxima' : 'reservas activas próximas'}. Se mantendrán, pero deberás reasignarlas.
              </p>
              <ul className="affected">
                {affected.map((r) => (
                  <li key={r.id}>
                    <span className="mono">{r.code}</span> · {formatLong(r.date)} · {r.slot} · {r.name} · {r.party} pers.
                    <Link to={`/admin/reservas/${r.code}/modificar`} className="link" onClick={onClose}>
                      Modificar
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Dialog>
  );
}
