import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import { update, useDB } from '@/store/db';
import { deleteDishForever, restoreDish } from '@/store/actions';
import { CATEGORY_BY_ID } from '@/domain/constants';
import type { Dish } from '@/domain/types';
import { DishImage } from '@/components/DishImage';
import { Dialog } from '@/components/Dialog';
import { toast } from '@/components/toast';
import { formatDateTimeShort } from '@/lib/dates';
import { useTitle } from '@/lib/useTitle';

export default function Trash() {
  useTitle('Papelera');
  const db = useDB();
  const list = db.dishes.filter((d) => d.deletedAt).sort((a, b) => (b.deletedAt ?? '').localeCompare(a.deletedAt ?? ''));
  const [kill, setKill] = useState<Dish | null>(null);
  return (
    <div className="madmin">
      <Link to="/admin/menu" className="back-link">
        <ArrowLeft aria-hidden /> Volver al menú
      </Link>
      <header className="admin-head">
        <div>
          <p className="eyebrow accent">Menú</p>
          <h1 className="admin-title display">Papelera</h1>
        </div>
      </header>
      {list.length === 0 ? (
        <div className="empty">
          <Trash2 className="empty__art" aria-hidden />
          <p className="serif-i empty__title">La papelera está vacía.</p>
        </div>
      ) : (
        <ul className="mlist">
          {list.map((d) => (
            <li key={d.id} className="mrow">
              <div className="mrow__thumb">
                <DishImage imageId={d.imageId} alt="" name={d.name} />
              </div>
              <div className="mrow__info">
                <strong>{d.name}</strong>
                <span className="mrow__meta">
                  {CATEGORY_BY_ID[d.categoryId].name} · Eliminado {formatDateTimeShort(d.deletedAt!)}
                </span>
              </div>
              <div className="mrow__actions">
                <button
                  className="btn btn--sm"
                  onClick={() => {
                    update((s) => restoreDish(s, d.id, new Date()));
                    toast(`“${d.name}” se restauró al final de ${CATEGORY_BY_ID[d.categoryId].name}.`);
                  }}
                >
                  <RotateCcw aria-hidden /> Restaurar
                </button>
                <button className="btn btn--sm btn--danger" onClick={() => setKill(d)}>
                  Eliminar definitivamente
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dialog
        open={!!kill}
        onClose={() => setKill(null)}
        title="¿Eliminar definitivamente?"
        initialFocus="[data-safe]"
        actions={
          <>
            <button className="btn" data-safe onClick={() => setKill(null)}>
              Cancelar
            </button>
            <button
              className="btn btn--danger"
              onClick={() => {
                if (!kill) return;
                update((s) => deleteDishForever(s, kill.id));
                toast(`“${kill.name}” se eliminó definitivamente.`);
                setKill(null);
              }}
            >
              Eliminar definitivamente
            </button>
          </>
        }
      >
        <p>
          “{kill?.name}”: <strong>esta acción no se puede deshacer.</strong> Si tenía una imagen subida, se conserva en la biblioteca.
        </p>
      </Dialog>
    </div>
  );
}
