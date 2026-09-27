import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarDays, ChevronUp, Clock3, FlaskConical, Heart, LogOut, Table2, User, Users } from 'lucide-react';
import { TABLE_BY_ID } from '@/domain/constants';
import type { Reservation } from '@/domain/types';
import { useDB } from '@/store/db';
import { endSlot, formatLong } from '@/lib/dates';
import { useNow } from '@/lib/useNow';
import { announce } from '@/lib/announce';
import { cx } from '@/lib/cx';
import { Dialog } from '@/components/Dialog';
import { formatPhone, normalizePhone } from '@/domain/validation';
import { occasionLabel, partyLabel } from '@/domain/reservations';
import { firstInvalid, reconcileTable, sameAsOriginal, STEPS, stepValid, type Ctx, type Draft } from './draft';
import { StepData, StepDate, StepOccasion, StepParty, StepSlot, StepTable } from './steps';
import './reserve.css';

export type SubmitError = { error: string; duplicateCode?: string; validity?: string };

interface Props {
  mode: 'new' | 'edit';
  initial: Draft;
  original?: Reservation;
  onChange?: (d: Draft) => void;
  onSubmit: (d: Draft) => Promise<SubmitError | null>;
  onExit: () => void;
  hint?: string | null;
  simulate?: boolean;
}

const HELP_DISABLED: Record<number, string> = {
  1: 'Elige cuántas personas vienen.',
  2: 'Elige un horario para continuar.',
  3: 'Elige una fecha disponible para continuar.',
  4: 'Elige una mesa disponible para continuar.',
  5: 'Cuéntanos qué celebran para continuar.',
  6: 'Completa tu nombre y teléfono.',
  7: '',
};

function SummaryRows({ d, onEdit, maxStep, original }: { d: Draft; onEdit: (s: number) => void; maxStep: number; original?: Reservation }) {
  const t = d.tableId ? TABLE_BY_ID[d.tableId] : null;
  const rows = [
    { s: 1, icon: Users, label: 'Personas', value: d.party ? partyLabel(d.party) : null },
    { s: 2, icon: Clock3, label: 'Horario', value: d.slot ? `${d.slot}–${endSlot(d.slot)}` : null },
    { s: 3, icon: CalendarDays, label: 'Fecha', value: d.date ? formatLong(d.date) : null },
    { s: 4, icon: Table2, label: 'Mesa', value: t ? `${t.name} · ${t.features.join(' · ')}` : null },
    { s: 5, icon: Heart, label: 'Ocasión', value: d.occasion !== 'Ninguna' ? occasionLabel(d) : maxStep > 5 ? 'Ninguna' : null },
    { s: 6, icon: User, label: 'A nombre de', value: d.name ? `${d.name}${d.phone ? ` · ${d.phone}` : ''}` : null },
  ];
  return (
    <ul className="sum-rows">
      {rows.map((r) => (
        <li key={r.s} className={cx(!r.value && 'is-empty')}>
          <r.icon aria-hidden />
          <div>
            <span className="sum-rows__label">{r.label}</span>
            <span className="sum-rows__value">{r.value ?? '—'}</span>
            {original && r.value && changed(r.s, d, original) && <span className="sum-rows__chg">Cambió</span>}
          </div>
          {r.s <= maxStep && (
            <button className="text-btn" onClick={() => onEdit(r.s)} aria-label={`Editar ${r.label.toLowerCase()}`}>
              Editar
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function changed(step: number, d: Draft, o: Reservation) {
  switch (step) {
    case 1:
      return d.party !== o.party;
    case 2:
      return d.slot !== o.slot;
    case 3:
      return d.date !== o.date;
    case 4:
      return d.tableId !== o.tableId;
    case 5:
      return d.occasion !== o.occasion || (d.occasionNotes || '') !== (o.occasionNotes || '') || (d.occasionOther || '') !== (o.occasionOther || '');
    case 6:
      return d.name.trim() !== o.name || normalizePhone(d.phone) !== o.phone || (d.comment || '') !== (o.comment || '');
  }
  return false;
}

function BeforeAfter({ d, o }: { d: Draft; o: Reservation }) {
  const rows = [
    ['Fecha', formatLong(o.date), d.date ? formatLong(d.date) : '—'],
    ['Horario', `${o.slot}–${endSlot(o.slot)}`, d.slot ? `${d.slot}–${endSlot(d.slot)}` : '—'],
    ['Personas', partyLabel(o.party), d.party ? partyLabel(d.party) : '—'],
    ['Mesa', TABLE_BY_ID[o.tableId].name, d.tableId ? TABLE_BY_ID[d.tableId].name : '—'],
    ['Ocasión', occasionLabel(o), occasionLabel(d)],
    ['Nombre', o.name, d.name.trim()],
    ['Teléfono', formatPhone(o.phone), formatPhone(normalizePhone(d.phone))],
  ];
  return (
    <table className="ba">
      <caption className="sr-only">Antes y después</caption>
      <thead>
        <tr>
          <th scope="col">Dato</th>
          <th scope="col">Antes</th>
          <th scope="col">Después</th>
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
  );
}

export function Wizard({ mode, initial, original, onChange, onSubmit, onExit, hint, simulate }: Props) {
  const db = useDB();
  const now = useNow(60_000);
  const ctx: Ctx = useMemo(() => ({ now, data: db, excludeId: original?.id }), [now, db, original?.id]);
  const [d, setD] = useState<Draft>(initial);
  const [notice, setNotice] = useState<string | null>(null);
  const [dateNotice, setDateNotice] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<SubmitError | null>(null);
  const returnTo = useRef(false);
  const [exitAsk, setExitAsk] = useState(false);
  const [sumOpen, setSumOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => onChange?.(d), [d, onChange]);

  const set = useCallback(
    (patch: Partial<Draft>) =>
      setD((prev) => {
        let next = { ...prev, ...patch };
        if ('party' in patch || 'slot' in patch || 'date' in patch) {
          const r = reconcileTable(next, ctx);
          next = r.draft;
          if (r.notice) setNotice(r.notice);
        }
        return next;
      }),
    [ctx],
  );

  const step = d.step;
  const meta = STEPS[step - 1];
  const prevStep = useRef(step);
  const dirRef = useRef<1 | -1>(1);
  if (prevStep.current !== step) {
    dirRef.current = step > prevStep.current ? 1 : -1;
    prevStep.current = step;
  }
  const dir = dirRef.current;

  useEffect(() => {
    document.title = `Paso ${step} de 7: ${meta.label} · ${mode === 'edit' ? 'Modificar reserva' : 'Reservar'} · Mesa`;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    titleRef.current?.focus();
    announce(`Paso ${step} de 7: ${meta.title}`);
    window.scrollTo({ top: 0 });
  }, [step, meta, mode]);

  const goTo = (s: number) => {
    setShowErrors(false);
    setError(null);
    if (step === 7 && s < 7) returnTo.current = true;
    setD((p) => ({ ...p, step: s }));
  };

  const advance = () => {
    setD((p) => {
      const base = { ...p };
      if (!stepValid(p.step, base, ctx)) return p;
      let next = p.step + 1;
      if (returnTo.current) next = firstInvalid(base, ctx);
      return { ...base, step: next, maxStep: Math.max(p.maxStep, next) };
    });
    setShowErrors(false);
  };

  const next = () => {
    if (!stepValid(step, d, ctx)) {
      setShowErrors(true);
      if (step === 6) window.setTimeout(() => document.getElementById('err-summary')?.focus(), 30);
      return;
    }
    advance();
  };
  useEffect(() => {
    if (step === 7) returnTo.current = false;
  }, [step]);

  const back = () => {
    if (step === 1) return setExitAsk(true);
    goTo(step - 1);
  };

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await onSubmit(d);
    setBusy(false);
    if (!res) return;
    if (res.error === 'conflict') {
      const lost = d.tableId ? TABLE_BY_ID[d.tableId].name : 'tu mesa';
      setNotice(`Alguien más apartó la ${lost} a esta hora. Elige otra; guardamos el resto de tu reserva.`);
      announce('La disponibilidad acaba de cambiar.', 'assertive');
      setD((p) => ({ ...p, tableId: null, step: 4 }));
      returnTo.current = true;
    } else if (res.error === 'no-tables') {
      setDateNotice('Ya no quedan mesas compatibles a esta hora. Elige una alternativa.');
      announce('La disponibilidad acaba de cambiar.', 'assertive');
      setD((p) => ({ ...p, tableId: null, step: 3 }));
      returnTo.current = true;
    } else if (res.error === 'invalid-date') {
      setDateNotice(res.validity === 'pasado' ? 'Este horario ya pasó o está muy próximo. Reserva con al menos 1 hora de anticipación.' : 'Esa fecha ya no se puede reservar.');
      setD((p) => ({ ...p, step: 3 }));
      returnTo.current = true;
    } else setError(res);
  };

  const exit = () => {
    const dirty = d.party || d.slot || d.date || d.name;
    if (dirty && mode === 'new') setExitAsk(true);
    else onExit();
  };

  const valid = stepValid(step, d, ctx);
  const unchanged = mode === 'edit' && !!original && sameAsOriginal(d, original);
  const stepProps = { d, set, ctx, mode, goTo, advance, notice, clearNotice: () => setNotice(null), showErrors, hint };

  return (
    <div className="flow">
      <div className="flow-head">
        <div className="container flow-head__inner">
          <div className="flow-head__title">
            <p className="mono">{mode === 'edit' ? `Modificando ${original?.code}` : 'Reservar mesa'}</p>
            <h1 className="flow-head__h1 display">{mode === 'edit' ? 'Modificar reserva' : 'Reservar mesa'}</h1>
          </div>
          <button className="btn btn--quiet btn--sm" onClick={exit}>
            <LogOut aria-hidden /> Salir
          </button>
        </div>
        <div className="container">
          <ol className="progress" aria-label={`Paso ${step} de 7: ${meta.label}`}>
            {STEPS.map((s) => {
              const done = s.n < step || (s.n <= d.maxStep && s.n !== step && stepValid(s.n, d, ctx));
              const can = s.n <= d.maxStep && s.n !== step;
              return (
                <li key={s.n} className={cx('progress__item', s.n === step && 'is-current', done && 'is-done')}>
                  <button disabled={!can} onClick={() => goTo(s.n)} aria-current={s.n === step ? 'step' : undefined} aria-label={`Paso ${s.n}: ${s.label}`}>
                    <span className="progress__bar" aria-hidden />
                    <span className="progress__label">
                      <span className="mono">{String(s.n).padStart(2, '0')}</span> {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="progress__mobile mono" aria-hidden>
            Paso {step} de 7 · {meta.label}
          </p>
        </div>
      </div>

      <div className="container flow-grid">
        <section className="flow-main" aria-labelledby="step-title">
          <div key={step} className={cx('step-anim', dir === 1 ? 'fwd' : 'bwd')}>
            <h2 id="step-title" ref={titleRef} tabIndex={-1} className="step-title">
              {meta.title}
            </h2>
            {notice && step !== 4 && (
              <div className="alert alert--soft wizard-notice" role="status">
                <AlertTriangle aria-hidden />
                <p className="alert__title">{notice}</p>
              </div>
            )}
            {step === 1 && <StepParty {...stepProps} />}
            {step === 2 && <StepSlot {...stepProps} />}
            {step === 3 && <StepDate {...stepProps} notice={dateNotice} />}
            {step === 4 && <StepTable {...stepProps} />}
            {step === 5 && <StepOccasion {...stepProps} />}
            {step === 6 && <StepData {...stepProps} />}
            {step === 7 && (
              <div className="step">
                <p className="step__help">Puedes editar cualquier dato antes de confirmar.</p>
                {simulate && (
                  <p className="hint-chip hint-chip--warn">
                    <FlaskConical aria-hidden /> Simulación activa: alguien reservará tu mesa al confirmar.
                  </p>
                )}
                <div className="ticket">
                  <div className="ticket__head">
                    <span className="mono">Mesa · Reserva</span>
                    <span className="mono">{mode === 'edit' ? original?.code : 'MESA-····'}</span>
                  </div>
                  <SummaryRows d={d} onEdit={goTo} maxStep={7} original={original} />
                  {d.occasion !== 'Ninguna' && d.occasionNotes && <p className="ticket__note">“{d.occasionNotes}”</p>}
                  {d.comment && <p className="ticket__note">Comentario: “{d.comment}”</p>}
                  <svg className="ticket__tile" viewBox="0 0 100 100" aria-hidden>
                    <path d="M0 0 H50 A50 50 0 0 1 0 50 Z" fill="var(--chile)" />
                    <path d="M100 100 H50 A50 50 0 0 1 100 50 Z" fill="var(--maiz)" />
                    <circle cx="75" cy="25" r="14" fill="var(--obsidiana)" />
                  </svg>
                </div>
                {mode === 'edit' && original && <BeforeAfter d={d} o={original} />}
                {error && (
                  <div className="alert alert--error" role="alert">
                    <AlertTriangle aria-hidden />
                    {error.error === 'duplicate' ? (
                      <>
                        <p className="alert__title">Ya tienes una reserva a esa hora.</p>
                        <p className="alert__text">Tu reserva {error.duplicateCode} coincide con este horario.</p>
                        <div className="alert__actions">
                          <a className="btn btn--sm" href={`${import.meta.env.BASE_URL}${import.meta.env.VITE_ROUTER === 'hash' ? '#/' : ''}mis-reservas?codigo=${error.duplicateCode}`}>
                            Ver mi reserva
                          </a>
                          <button className="btn btn--sm btn--ghost" onClick={() => goTo(2)}>
                            Elegir otro horario
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="alert__title">No pudimos guardar tu reserva. Inténtalo de nuevo.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className={cx('flow-aside', sumOpen && 'is-open')} aria-label="Tu reserva">
          <button className="flow-aside__toggle" aria-expanded={sumOpen} onClick={() => setSumOpen((o) => !o)}>
            <span>
              <strong>Tu reserva</strong>
              <span className="flow-aside__peek">
                {[d.party && partyLabel(d.party), d.slot, d.date && formatLong(d.date).split(' ').slice(0, 3).join(' ')].filter(Boolean).join(' · ') || 'Aquí verás lo que vas eligiendo.'}
              </span>
            </span>
            <ChevronUp aria-hidden />
          </button>
          <div className="flow-aside__body">
            <h2 className="flow-aside__title">Tu reserva</h2>
            {!d.party && !d.slot ? <p className="muted">Aquí verás lo que vas eligiendo.</p> : <SummaryRows d={d} onEdit={goTo} maxStep={d.maxStep} />}
          </div>
        </aside>
      </div>

      <div className="flow-bar">
        <div className="container flow-bar__inner">
          <button className="btn btn--ghost" onClick={back}>
            <ArrowLeft aria-hidden /> {step === 1 ? 'Salir' : 'Atrás'}
          </button>
          {!valid && step !== 7 && <p className="flow-bar__why">{HELP_DISABLED[step]}</p>}
          {step === 7 && unchanged && <p className="flow-bar__why">Aún no hay cambios: edita el dato que quieras cambiar.</p>}
          {step < 7 ? (
            <button className={cx('btn btn--primary', !valid && 'is-soft')} onClick={next} aria-disabled={!valid && step !== 6 && step !== 5}>
              {step === 4 && d.tableId ? `Continuar con ${TABLE_BY_ID[d.tableId].name}` : step === 6 ? 'Revisar reserva' : 'Continuar'}
              <ArrowRight className="arrow" aria-hidden />
            </button>
          ) : (
            <button className="btn btn--primary btn--lg" onClick={submit} disabled={busy || !valid || unchanged}>
              {busy ? (
                <>
                  <span className="spinner" aria-hidden /> {mode === 'edit' ? 'Guardando…' : 'Confirmando…'}
                </>
              ) : mode === 'edit' ? (
                'Guardar cambios'
              ) : (
                'Confirmar reserva'
              )}
            </button>
          )}
        </div>
      </div>

      <Dialog
        open={exitAsk}
        onClose={() => setExitAsk(false)}
        title="¿Salir de la reserva?"
        initialFocus="[data-safe]"
        actions={
          <>
            <button className="btn btn--ghost" onClick={onExit}>
              Salir
            </button>
            <button className="btn" data-safe onClick={() => setExitAsk(false)}>
              Seguir reservando
            </button>
          </>
        }
      >
        <p>Perderás lo que has elegido.</p>
      </Dialog>
    </div>
  );
}
