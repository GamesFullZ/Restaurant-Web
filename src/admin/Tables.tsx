import { useMemo, useState } from 'react';
import { Lock, Unlock, Wrench, Ban } from 'lucide-react';
import { useDB } from '@/store/db';
import { TABLES } from '@/domain/constants';
import { isActive, tableStatuses } from '@/domain/availability';
import type { TableId } from '@/domain/types';
import { FloorLegend, FloorPlan } from '@/components/FloorPlan';
import { toISODate } from '@/lib/dates';
import { useTitle } from '@/lib/useTitle';
import { cx } from '@/lib/cx';
import { BlockDialog } from './BlockDialog';
import { doUnblock } from './ops';

export default function Tables() {
  useTitle('Mesas');
  const db = useDB();
  const [blockId, setBlockId] = useState<TableId | null>(null);
  const [sel, setSel] = useState<TableId | null>(null);
  const today = toISODate(new Date());
  const statuses = useMemo(() => tableStatuses({ date: '1900-01-01', slot: '13:00', selectedId: sel }, { reservations: [], blocks: db.blocks }), [db.blocks, sel]);
  return (
    <div className="tables">
      <header className="admin-head">
        <div>
          <p className="eyebrow accent">Gestión</p>
          <h1 className="admin-title display">Mesas</h1>
          <p className="admin-sub">Capacidad y características son fijas. El bloqueo aplica a todas las fechas hasta desbloquear.</p>
        </div>
      </header>
      <div className="tables__grid">
        <section className="panel">
          <div className="floor-wrap">
            <FloorPlan statuses={statuses} mode="admin" selectedId={sel} onSelect={(id) => setSel(id === sel ? null : id)} label="Plano de mesas y estado de bloqueo" />
          </div>
          <FloorLegend admin />
        </section>
        <ul className="tsched">
          {TABLES.map((t) => {
            const b = db.blocks[t.id];
            const upcoming = db.reservations.filter((r) => r.tableId === t.id && isActive(r) && r.date >= today).length;
            return (
              <li key={t.id} className={cx('tsched__row', sel === t.id && 'is-sel', b && 'is-blocked')} onMouseEnter={() => setSel(t.id)}>
                <div className="tsched__id">
                  <strong className="display">{t.id}</strong>
                  <span className="muted">
                    {t.capacity} pers. · {t.zone}
                  </span>
                </div>
                <div className="tsched__feat">
                  {t.features.map((f) => (
                    <span key={f} className="tag">
                      {f}
                    </span>
                  ))}
                </div>
                <div className="tsched__state">
                  {b ? (
                    <span className="warn">
                      {b.type === 'Mantenimiento' ? <Wrench aria-hidden /> : <Ban aria-hidden />} {b.type}
                      {b.note && ` · “${b.note}”`}
                    </span>
                  ) : (
                    <span className="av av--ok">Activa</span>
                  )}
                  <span className="muted tnum">
                    {upcoming} {upcoming === 1 ? 'reserva próxima' : 'reservas próximas'}
                  </span>
                </div>
                {b ? (
                  <button className="btn btn--sm" onClick={() => doUnblock(t.id)}>
                    <Unlock aria-hidden /> Desbloquear
                  </button>
                ) : (
                  <button className="btn btn--sm btn--ghost" onClick={() => setBlockId(t.id)}>
                    <Lock aria-hidden /> Bloquear
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <BlockDialog tableId={blockId} onClose={() => setBlockId(null)} />
    </div>
  );
}
