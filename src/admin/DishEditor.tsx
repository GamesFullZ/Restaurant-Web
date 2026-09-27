import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Check, ImagePlus, Upload } from 'lucide-react';
import { mutate, StorageQuotaError, update, useDB } from '@/store/db';
import { addImage, createDish, updateDish, type DishFormInput } from '@/store/actions';
import { putImage, processUpload } from '@/store/images';
import { LIBRARY_IMAGES } from '@/data/seed';
import { CATEGORIES, TAGS } from '@/domain/constants';
import type { CategoryId, DishAvailability, Tag } from '@/domain/types';
import { formatPrice, validateDish } from '@/domain/validation';
import { DishImage } from '@/components/DishImage';
import { TagBadge } from '@/components/Tags';
import { Dialog } from '@/components/Dialog';
import { toast } from '@/components/toast';
import { useTitle } from '@/lib/useTitle';
import { simulateLatency } from '@/lib/motion';
import { cx } from '@/lib/cx';

type Form = { name: string; price: string; description: string; categoryId: CategoryId; tags: Tag[]; imageId: string; imageAlt: string; availability: DishAvailability };

const AVS: DishAvailability[] = ['Disponible', 'Agotado temporalmente', 'Oculto'];

export default function DishEditor() {
  const { id } = useParams();
  const db = useDB();
  const nav = useNavigate();
  const editing = id ? db.dishes.find((d) => d.id === id && !d.deletedAt) : undefined;
  useTitle(editing ? `Editar · ${editing.name}` : 'Nuevo platillo');
  const initial = useMemo<Form>(
    () =>
      editing
        ? { name: editing.name, price: String(editing.price), description: editing.description, categoryId: editing.categoryId, tags: editing.tags, imageId: editing.imageId, imageAlt: editing.imageAlt, availability: editing.availability }
        : { name: '', price: '', description: '', categoryId: 'antojitos', tags: [], imageId: '', imageAlt: '', availability: 'Disponible' },
    [editing?.id], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [f, setF] = useState<Form>(initial);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'lib' | 'up'>('lib');
  const [upErr, setUpErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const dirty = JSON.stringify(f) !== JSON.stringify(initial) && !saved;
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', fn);
    return () => window.removeEventListener('beforeunload', fn);
  }, [dirty]);

  if (id && !editing) {
    return (
      <div className="madmin">
        <div className="alert alert--error">
          <AlertTriangle aria-hidden />
          <p className="alert__title">Ese platillo no existe o está en la papelera.</p>
          <div className="alert__actions">
            <Link to="/admin/menu" className="btn btn--sm">
              Volver al menú
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const others = db.dishes.filter((d) => d.id !== editing?.id).map((d) => d.name);
  const errors = validateDish({ ...f, price: f.price }, others);
  const e = (k: string) => (show ? errors[k] : undefined);
  const set = (p: Partial<Form>) => setF((x) => ({ ...x, ...p }));
  const library = [...LIBRARY_IMAGES, ...db.images.map((i) => ({ id: i.id, name: i.name, alt: i.alt }))];
  const dup = errors.name?.startsWith('Ya existe') ? db.dishes.find((d) => d.name.toLowerCase() === f.name.trim().toLowerCase() || errors.name.includes(`“${d.name}”`)) : undefined;

  const onFile = async (file: File | undefined) => {
    setUpErr(null);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setUpErr('Usa una imagen JPG, PNG o WebP de hasta 5 MB.');
      return;
    }
    setUploading(true);
    try {
      const blob = await processUpload(file);
      const imgId = `up:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      await putImage(imgId, blob);
      update((s) => addImage(s, { id: imgId, name: file.name, alt: f.imageAlt || '', createdAt: new Date().toISOString() }));
      set({ imageId: imgId });
      toast('Imagen subida.');
    } catch {
      setUpErr('No hay espacio para guardar esta imagen. Usa una imagen más ligera o elimina imágenes subidas.');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setShow(true);
    if (Object.keys(errors).length) {
      window.setTimeout(() => summaryRef.current?.focus(), 30);
      return;
    }
    setBusy(true);
    await simulateLatency(300, 600);
    const input: DishFormInput = { ...f, price: Number(f.price) };
    try {
      if (editing) {
        mutate((s) => ({ state: updateDish(s, editing.id, input, new Date()), result: null }));
        toast('Platillo guardado.');
      } else {
        mutate((s) => {
          const r = createDish(s, input, new Date());
          return { state: r.state, result: r.dish };
        });
        toast('Platillo guardado.');
      }
      setSaved(true);
      window.setTimeout(() => nav('/admin/menu'), 0);
    } catch (err) {
      setBusy(false);
      setUpErr(err instanceof StorageQuotaError ? 'No hay espacio para guardar. Elimina imágenes subidas.' : 'No se pudo guardar.');
    }
  };

  const labels: Record<string, string> = { name: 'Nombre', price: 'Precio', description: 'Descripción', categoryId: 'Categoría', imageAlt: 'Texto alternativo' };

  return (
    <div className="editor">
      <Link to="/admin/menu" className="back-link">
        <ArrowLeft aria-hidden /> Volver al menú
      </Link>
      <header className="admin-head">
        <div>
          <p className="eyebrow accent">{editing ? 'Editar platillo' : 'Nuevo platillo'}</p>
          <h1 className="admin-title display">{editing ? editing.name : 'Nuevo platillo'}</h1>
          {dirty && <p className="dirty">● Cambios sin guardar</p>}
        </div>
      </header>
      <div className="editor__grid">
        <div className="editor__form panel">
          {show && Object.keys(errors).length > 0 && (
            <div className="alert alert--error" role="alert" tabIndex={-1} ref={summaryRef}>
              <AlertTriangle aria-hidden />
              <p className="alert__title">Revisa los campos marcados: {Object.keys(errors).map((k) => labels[k]).join(', ')}.</p>
            </div>
          )}
          <div className={cx('field', e('name') && 'field--error')}>
            <label className="field__label" htmlFor="d-name">
              Nombre
            </label>
            <input id="d-name" className="input" value={f.name} onChange={(x) => set({ name: x.target.value })} aria-invalid={!!e('name')} />
            {e('name') && (
              <p className="field__error">
                <AlertTriangle aria-hidden /> {errors.name}
                {dup && dup.id !== editing?.id && (
                  <Link to={`/admin/menu/${dup.id}`} className="link">
                    Ir a ese platillo
                  </Link>
                )}
              </p>
            )}
          </div>
          <div className="form-grid">
            <div className={cx('field', e('categoryId') && 'field--error')}>
              <label className="field__label" htmlFor="d-cat">
                Categoría
              </label>
              <select id="d-cat" className="select" value={f.categoryId} onChange={(x) => set({ categoryId: x.target.value as CategoryId })}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {(!editing || editing.categoryId !== f.categoryId) && <p className="field__hint">Se agregará al final de {CATEGORIES.find((c) => c.id === f.categoryId)?.name}.</p>}
            </div>
            <div className={cx('field', e('price') && 'field--error')}>
              <label className="field__label" htmlFor="d-price">
                Precio (MXN)
              </label>
              <div className="prefix">
                <span aria-hidden>$</span>
                <input id="d-price" className="input tnum" inputMode="numeric" value={f.price} onChange={(x) => set({ price: x.target.value.replace(/[^\d]/g, '') })} aria-invalid={!!e('price')} />
              </div>
              {e('price') && <p className="field__error">{errors.price}</p>}
            </div>
          </div>
          <div className={cx('field', e('description') && 'field--error')}>
            <label className="field__label" htmlFor="d-desc">
              Descripción <span className="opt">máx. 160</span>
            </label>
            <textarea id="d-desc" className="textarea" value={f.description} onChange={(x) => set({ description: x.target.value })} aria-describedby="d-desc-h" />
            <p id="d-desc-h" className="field__hint">
              Una línea evocadora. No listes ingredientes. <span className={cx('counter', f.description.length > 160 && 'over')}>{f.description.length}/160</span>
            </p>
            {e('description') && <p className="field__error">{errors.description}</p>}
          </div>
          <fieldset className="field fieldset">
            <legend className="field__label">Etiquetas</legend>
            <div className="chips">
              {TAGS.map((t) => {
                const on = f.tags.includes(t);
                return (
                  <label key={t} className={cx('chip chip--sm chip--check', on && 'is-on')}>
                    <input type="checkbox" checked={on} onChange={() => set({ tags: on ? f.tags.filter((x) => x !== t) : [...f.tags, t] })} />
                    {on && <Check aria-hidden />} {t}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <fieldset className="field fieldset">
            <legend className="field__label">Disponibilidad</legend>
            <div className="seg">
              {AVS.map((a) => (
                <button type="button" key={a} className={cx('seg__btn', f.availability === a && 'is-on')} aria-pressed={f.availability === a} onClick={() => set({ availability: a })}>
                  {a}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="field fieldset">
            <legend className="field__label">Imagen</legend>
            <div className="seg" role="tablist">
              <button type="button" role="tab" aria-selected={tab === 'lib'} className={cx('seg__btn', tab === 'lib' && 'is-on')} onClick={() => setTab('lib')}>
                Biblioteca
              </button>
              <button type="button" role="tab" aria-selected={tab === 'up'} className={cx('seg__btn', tab === 'up' && 'is-on')} onClick={() => setTab('up')}>
                Subir imagen
              </button>
            </div>
            {tab === 'lib' ? (
              <ul className="lib">
                {library.map((img) => (
                  <li key={img.id}>
                    <button type="button" className={cx('lib__item', f.imageId === img.id && 'is-on')} onClick={() => set({ imageId: img.id, imageAlt: f.imageAlt || img.alt })} aria-pressed={f.imageId === img.id} aria-label={`Usar imagen: ${img.name}`}>
                      <DishImage imageId={img.id} alt="" name={img.name} />
                      {img.id.startsWith('up:') && <span className="lib__tag">Subida</span>}
                      {f.imageId === img.id && <Check className="lib__check" aria-hidden />}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className="drop"
                onDragOver={(x) => x.preventDefault()}
                onDrop={(x) => {
                  x.preventDefault();
                  onFile(x.dataTransfer.files[0]);
                }}
              >
                <ImagePlus aria-hidden />
                <p>Arrastra una imagen aquí o</p>
                <button type="button" className="btn btn--sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <span className="spinner" aria-hidden /> : <Upload aria-hidden />} {uploading ? 'Subiendo…' : 'Subir imagen'}
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(x) => onFile(x.target.files?.[0] ?? undefined)} />
                <p className="field__hint">JPG, PNG o WebP · hasta 5 MB · se ajusta a 1600 px · recorte sugerido 4:5</p>
              </div>
            )}
            {upErr && (
              <p className="field__error" role="alert">
                <AlertTriangle aria-hidden /> {upErr}
              </p>
            )}
          </fieldset>
          <div className={cx('field', e('imageAlt') && 'field--error')}>
            <label className="field__label" htmlFor="d-alt">
              Texto alternativo {f.imageId && <span className="opt">obligatorio</span>}
            </label>
            <input id="d-alt" className="input" value={f.imageAlt} onChange={(x) => set({ imageAlt: x.target.value })} placeholder="Describe la foto para lectores de pantalla" />
            {e('imageAlt') && <p className="field__error">{errors.imageAlt}</p>}
          </div>
        </div>
        <aside className="editor__preview">
          <p className="eyebrow">Vista previa</p>
          <div className="dcard dcard--preview">
            <div className="dcard__media">
              <DishImage imageId={f.imageId} alt={f.imageAlt} name={f.name || 'Nuevo platillo'} />
            </div>
            <div className="dcard__body">
              <h3 className="dcard__name">{f.name || 'Nombre del platillo'}</h3>
              <span className="dcard__price tnum">{f.price ? formatPrice(Number(f.price)) : '$—'}</span>
              <p className="dcard__desc">{f.description || 'Una línea evocadora del platillo.'}</p>
              <div className="dcard__tags">
                {f.tags.map((t) => (
                  <TagBadge key={t} tag={t} plain />
                ))}
              </div>
            </div>
          </div>
          <div className="editor__actions">
            <Link to="/admin/menu" className="btn btn--ghost">
              Cancelar
            </Link>
            <button className="btn btn--primary" onClick={save} disabled={busy}>
              {busy && <span className="spinner" aria-hidden />} {busy ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </aside>
      </div>
      <Dialog
        open={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        title="¿Descartar cambios?"
        initialFocus="[data-safe]"
        actions={
          <>
            <button className="btn btn--ghost" onClick={() => blocker.proceed?.()}>
              Descartar
            </button>
            <button className="btn" data-safe onClick={() => blocker.reset?.()}>
              Seguir editando
            </button>
          </>
        }
      >
        <p>Tienes cambios sin guardar en este platillo.</p>
      </Dialog>
    </div>
  );
}
