import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CalendarClock, UserPen } from 'lucide-react';
import { mutate, StorageQuotaError, useDB } from '@/store/db';
import { isVerified } from '@/store/session';
import { modifyReservation } from '@/store/actions';
import { clientCanChange, occasionLabel } from '@/domain/reservations';
import { formatPhone, normalizeCode, normalizePhone } from '@/domain/validation';
import { OCCASIONS } from '@/domain/constants';
import type { Occasion } from '@/domain/types';
import { Wizard, type SubmitError } from '../reserve/Wizard';
import { dataErrors, draftFromReservation, occasionErrors, type Draft } from '../reserve/draft';
import { toInput } from '../reserve/ReservePage';
import { toast } from '@/components/toast';
import { useNow } from '@/lib/useNow';
import { useTitle } from '@/lib/useTitle';
import { simulateLatency } from '@/lib/motion';
import { cx } from '@/lib/cx';
import './my.css';

export default function MyModify() {
  const { code = '' } = useParams();
  const db = useDB();
  const nav = useNavigate();
  const now = useNow();
  const r = db.reservations.find((x) => x.code === normalizeCode(code));
  const [mode, setMode] = useState<'choose' | 'flow' | 'data'>('choose');
  const initial = useMemo(() => (r ? draftFromReservation(r) : null), [r?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useTitle('Modificar reserva');
  if (!r || !isVerified(r.id)) return <Navigate to={`/mis-reservas?codigo=${encodeURIComponent(normalizeCode(code))}`} replace />;
  const can = clientCanChange(r, now);
  if (!can.ok) return <Navigate to={`/mis-reservas/${r.code}`} replace />;

  const save = async (d: Draft): Promise<SubmitError | null> => {
    await simulateLatency(400, 800);
    const input = toInput(d);
    try {
      const res = mutate((s) => modifyReservation(s, r.id, input, 'Cliente', new Date()));
      if (!res.ok) return { error: res.error, duplicateCode: res.duplicateCode, validity: res.validity };
      if (normalizePhone(d.phone) !== r.phone) toast('Usa tu nuevo teléfono para consultar esta reserva.', { kind: 'info' });
      toast('Listo, actualizamos tu reserva.');
      nav(`/mis-reservas/${r.code}`);
      return null;
    } catch (e) {
      return { error: e instanceof StorageQuotaError ? 'quota' : 'unknown' };
    }
  };

  if (mode === 'flow' && initial) {
    return <Wizard mode="edit" initial={{ ...initial, step: 1 }} original={r} onSubmit={save} onExit={() => setMode('choose')} />;
  }

  if (mode === 'data' && initial) return <DataForm initial={initial} original={r} onSave={save} onBack={() => setMode('choose')} />;

  return (
    <section className="my-page">
      <div className="container my-choose">
        <Link to={`/mis-reservas/${r.code}`} className="back-link">
          <ArrowLeft aria-hidden /> Volver a mi reserva
        </Link>
        <p className="mono muted">{r.code}</p>
        <h1 className="my-title display">
          ¿Qué quieres <span className="serif-i">cambiar?</span>
        </h1>
        <div className="choose-grid">
          <button className="choose-card" onClick={() => setMode('flow')}>
            <CalendarClock aria-hidden />
            <strong>Fecha, horario, personas o mesa</strong>
            <span>Te llevamos por el flujo guiado con tus datos actuales.</span>
          </button>
          <button className="choose-card" onClick={() => setMode('data')}>
            <UserPen aria-hidden />
            <strong>Datos de contacto y ocasión</strong>
            <span>Nombre, teléfono, ocasión, instrucciones y comentario.</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function DataForm({ initial, original, onSave, onBack }: { initial: Draft; original: NonNullable<ReturnType<typeof useDB>['reservations'][number]>; onSave: (d: Draft) => Promise<SubmitError | null>; onBack: () => void }) {
  const [d, setD] = useState<Draft>(initial);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<SubmitError | null>(null);
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }));
  const errors = { ...dataErrors(d), ...occasionErrors(d) };
  const changed =
    d.name.trim() !== original.name ||
    normalizePhone(d.phone) !== original.phone ||
    (d.comment || '') !== (original.comment || '') ||
    d.occasion !== original.occasion ||
    (d.occasionNotes || '') !== (original.occasionNotes || '') ||
    (d.occasionOther || '') !== (original.occasionOther || '');
  const e = (k: string) => show && errors[k];
  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (Object.keys(errors).length) {
      setShow(true);
      return;
    }
    setBusy(true);
    const res = await onSave(d);
    setBusy(false);
    setErr(res);
  };
  const rows: [string, string, string][] = [
    ['Nombre', original.name, d.name.trim()],
    ['Teléfono', formatPhone(original.phone), formatPhone(normalizePhone(d.phone))],
    ['Ocasión', occasionLabel(original), occasionLabel(d)],
    ['Instrucciones', original.occasionNotes || '—', (d.occasion !== 'Ninguna' && d.occasionNotes) || '—'],
    ['Comentario', original.comment || '—', d.comment || '—'],
  ];
  return (
    <section className="my-page">
      <form className="container my-dataform" onSubmit={submit} noValidate>
        <button type="button" className="back-link text-btn" onClick={onBack}>
          <ArrowLeft aria-hidden /> Volver
        </button>
        <h1 className="my-title display">
          Datos y <span className="serif-i">ocasión</span>
        </h1>
        {err && (
          <div className="alert alert--error" role="alert">
            <AlertTriangle aria-hidden />
            <p className="alert__title">{err.error === 'duplicate' ? `Ya tienes una reserva a esa hora (${err.duplicateCode}).` : 'No pudimos guardar tus cambios.'}</p>
          </div>
        )}
        <div className="form-grid">
          <div className={cx('field', e('name') && 'field--error')}>
            <label className="field__label" htmlFor="e-name">
              Nombre completo
            </label>
            <input id="e-name" className="input" value={d.name} onChange={(x) => set({ name: x.target.value })} aria-invalid={!!e('name')} />
            {e('name') && <p className="field__error">{errors.name}</p>}
          </div>
          <div className={cx('field', e('phone') && 'field--error')}>
            <label className="field__label" htmlFor="e-phone">
              Teléfono (10 dígitos)
            </label>
            <input id="e-phone" className="input tnum" type="tel" inputMode="tel" value={d.phone} onChange={(x) => set({ phone: x.target.value })} aria-invalid={!!e('phone')} />
            {e('phone') && <p className="field__error">{errors.phone}</p>}
          </div>
          <div className="field form-grid__full">
            <span className="field__label">Ocasión</span>
            <div className="chips" role="radiogroup" aria-label="Ocasión">
              {OCCASIONS.map((o) => (
                <button type="button" key={o} role="radio" aria-checked={d.occasion === o} className={cx('chip', d.occasion === o && 'is-on')} onClick={() => set({ occasion: o as Occasion })}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          {d.occasion === 'Otra' && (
            <div className={cx('field', e('occasionOther') && 'field--error')}>
              <label className="field__label" htmlFor="e-other">
                ¿Qué celebran?
              </label>
              <input id="e-other" className="input" value={d.occasionOther} onChange={(x) => set({ occasionOther: x.target.value })} />
              {e('occasionOther') && <p className="field__error">{errors.occasionOther}</p>}
            </div>
          )}
          {d.occasion !== 'Ninguna' && (
            <div className="field form-grid__full">
              <label className="field__label" htmlFor="e-notes">
                Instrucciones para la ocasión <span className="opt">opcional</span>
              </label>
              <textarea id="e-notes" className="textarea" value={d.occasionNotes} onChange={(x) => set({ occasionNotes: x.target.value })} />
              <span className={cx('counter', d.occasionNotes.length > 200 && 'over')}>{d.occasionNotes.length}/200</span>
            </div>
          )}
          <div className="field form-grid__full">
            <label className="field__label" htmlFor="e-comment">
              Comentario <span className="opt">opcional</span>
            </label>
            <textarea id="e-comment" className="textarea" value={d.comment} onChange={(x) => set({ comment: x.target.value })} />
            <span className={cx('counter', d.comment.length > 300 && 'over')}>{d.comment.length}/300</span>
          </div>
        </div>
        <table className="ba">
          <caption className="sr-only">Antes y después</caption>
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
        <div className="my-actions">
          <button className="btn btn--primary btn--lg" disabled={!changed || busy}>
            {busy && <span className="spinner" aria-hidden />} {busy ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {!changed && <span className="muted">Haz algún cambio para guardar.</span>}
        </div>
      </form>
    </section>
  );
}
