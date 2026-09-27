import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, Eye, EyeOff, ImageOff, Pencil, Plus, Search, Trash2, CheckCircle2 } from 'lucide-react';
import { getState, update, useDB } from '@/store/db';
import { setDishAvailability, showDish, trashDish, restoreDish } from '@/store/actions';
import { CATEGORIES, FEATURED_SLUGS } from '@/domain/constants';
import { featuredDishes, sortDishes } from '@/domain/menu';
import type { CategoryId, Dish, DishAvailability } from '@/domain/types';
import { formatPrice, slugify } from '@/domain/validation';
import { DishImage } from '@/components/DishImage';
import { TagBadge } from '@/components/Tags';
import { Dialog } from '@/components/Dialog';
import { toast } from '@/components/toast';
import { useTitle } from '@/lib/useTitle';
import { cx } from '@/lib/cx';

const AV: Record<DishAvailability, string> = { Disponible: 'av--ok', 'Agotado temporalmente': 'av--out', Oculto: 'av--hid' };

export default function MenuAdmin() {
  useTitle('Menú · Admin');
  const db = useDB();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [av, setAv] = useState<DishAvailability | 'all'>('all');
  const [del, setDel] = useState<Dish | null>(null);
  const trashCount = db.dishes.filter((d) => d.deletedAt).length;

  const groups = useMemo(() => {
    const norm = slugify(q);
    const list = sortDishes(db.dishes.filter((d) => !d.deletedAt)).filter(
      (d) => (cat === 'all' || d.categoryId === cat) && (av === 'all' || d.availability === av) && (!norm || slugify(d.name).includes(norm)),
    );
    return CATEGORIES.map((c) => ({ ...c, dishes: list.filter((d) => d.categoryId === c.id) })).filter((g) => g.dishes.length);
  }, [db.dishes, q, cat, av]);

  const set = (d: Dish, a: DishAvailability) => {
    update((s) => setDishAvailability(s, d.id, a, new Date()));
    toast(a === 'Agotado temporalmente' ? `“${d.name}” ahora está agotado.` : a === 'Oculto' ? `“${d.name}” está oculto en el sitio.` : `“${d.name}” está disponible.`);
  };
  const show = (d: Dish) => {
    update((s) => showDish(s, d.id, new Date()));
    toast(`“${d.name}” vuelve a verse en el sitio.`);
  };
  const doTrash = (d: Dish) => {
    const wasFeatured = featuredDishes(getState().dishes).some((x) => x.id === d.id);
    update((s) => trashDish(s, d.id, new Date()));
    setDel(null);
    const sub = wasFeatured ? featuredDishes(getState().dishes).find((x) => !FEATURED_SLUGS.includes(x.slug)) : null;
    toast(`“${d.name}” se envió a la papelera.${sub ? ` Era un destacado de Inicio; lo reemplazamos por ${sub.name}.` : ''}`, {
      action: { label: 'Deshacer', onClick: () => update((s) => restoreDish(s, d.id, new Date())) },
    });
  };

  return (
    <div className="madmin">
      <header className="admin-head">
        <div>
          <p className="eyebrow accent">Gestión</p>
          <h1 className="admin-title display">Menú</h1>
        </div>
        <div className="admin-head__actions">
          <Link to="/admin/menu/papelera" className="btn btn--ghost btn--sm">
            <Trash2 aria-hidden /> Papelera ({trashCount})
          </Link>
          <Link to="/admin/menu/nuevo" className="btn btn--primary btn--sm">
            <Plus aria-hidden /> Nuevo platillo
          </Link>
        </div>
      </header>
      <div className="toolbar">
        <label className="search">
          <Search aria-hidden />
          <span className="sr-only">Buscar platillo</span>
          <input className="input" placeholder="Buscar platillo" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select className="select select--sm" value={cat} onChange={(e) => setCat(e.target.value as CategoryId | 'all')} aria-label="Filtrar por categoría">
          <option value="all">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="select select--sm" value={av} onChange={(e) => setAv(e.target.value as DishAvailability | 'all')} aria-label="Filtrar por disponibilidad">
          <option value="all">Toda disponibilidad</option>
          <option value="Disponible">Disponible</option>
          <option value="Agotado temporalmente">Agotado</option>
          <option value="Oculto">Oculto</option>
        </select>
      </div>
      <p className="count muted">Orden fijo por categoría y posición · sin arrastrar y soltar.</p>
      {groups.length === 0 && (
        <div className="empty">
          <p className="serif-i empty__title">No hay resultados con estos filtros.</p>
        </div>
      )}
      {groups.map((g) => (
        <section key={g.id} className="mgroup" aria-labelledby={`g-${g.id}`}>
          <h2 id={`g-${g.id}`} className="mgroup__title">
            {g.name} <span className="mono muted">{g.dishes.length}</span>
          </h2>
          <ul className="mlist">
            {g.dishes.map((d) => (
              <li key={d.id} className={cx('mrow', d.availability === 'Oculto' && 'is-hidden')}>
                <div className="mrow__thumb">
                  <DishImage imageId={d.imageId} alt="" name={d.name} />
                </div>
                <div className="mrow__info">
                  <strong>{d.name}</strong>
                  <span className="mrow__meta">
                    <span className="tnum">{formatPrice(d.price)}</span> · pos. {d.position}
                    {!d.imageId && (
                      <span className="warn">
                        <ImageOff aria-hidden /> Sin imagen
                      </span>
                    )}
                  </span>
                  <span className="mrow__tags">
                    {d.tags.map((t) => (
                      <TagBadge key={t} tag={t} plain />
                    ))}
                  </span>
                </div>
                <span className={cx('av', AV[d.availability])}>{d.availability === 'Agotado temporalmente' ? 'Agotado' : d.availability}</span>
                <div className="mrow__actions">
                  <Link to={`/admin/menu/${d.id}`} className="icon-btn" aria-label={`Editar ${d.name}`} title="Editar">
                    <Pencil aria-hidden />
                  </Link>
                  {d.availability === 'Agotado temporalmente' ? (
                    <button className="icon-btn" onClick={() => set(d, 'Disponible')} aria-label={`Marcar disponible ${d.name}`} title="Marcar disponible">
                      <CheckCircle2 aria-hidden />
                    </button>
                  ) : (
                    <button className="icon-btn" disabled={d.availability === 'Oculto'} onClick={() => set(d, 'Agotado temporalmente')} aria-label={`Marcar agotado ${d.name}`} title="Marcar agotado">
                      <Clock3 aria-hidden />
                    </button>
                  )}
                  {d.availability === 'Oculto' ? (
                    <button className="icon-btn" onClick={() => show(d)} aria-label={`Mostrar ${d.name}`} title="Mostrar">
                      <Eye aria-hidden />
                    </button>
                  ) : (
                    <button className="icon-btn" onClick={() => set(d, 'Oculto')} aria-label={`Ocultar ${d.name}`} title="Ocultar">
                      <EyeOff aria-hidden />
                    </button>
                  )}
                  <button className="icon-btn icon-btn--danger" onClick={() => setDel(d)} aria-label={`Eliminar ${d.name}`} title="Eliminar">
                    <Trash2 aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <Dialog
        open={!!del}
        onClose={() => setDel(null)}
        title="¿Enviar a la papelera?"
        initialFocus="[data-safe]"
        actions={
          <>
            <button className="btn btn--ghost" data-safe onClick={() => setDel(null)}>
              Cancelar
            </button>
            <button className="btn btn--danger" onClick={() => del && doTrash(del)}>
              <Trash2 aria-hidden /> Enviar a papelera
            </button>
          </>
        }
      >
        <p>“{del?.name}” dejará de verse en el sitio. Podrás restaurarlo.</p>
      </Dialog>
    </div>
  );
}
