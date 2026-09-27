import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarX2, Cake, Check, Gift, Heart, LayoutGrid, List, Minus, Moon, Phone, Plus, Sparkles, Sun, Utensils } from 'lucide-react';
import {
  alternatives,
  dayInfo,
  lastBookableDate,
  occasionSuggestion,
  recommendTables,
  slotsForDate,
  tableStatuses,
  todayISO,
  type DayState,
} from '@/domain/availability';
import { FEATURES, OCCASIONS, SLOTS, TABLE_BY_ID } from '@/domain/constants';
import type { Feature, Occasion, TableId } from '@/domain/types';
import { Calendar, CalendarLegend } from '@/components/Calendar';
import { FloorLegend, FloorPlan } from '@/components/FloorPlan';
import { SimPill } from '@/components/Tags';
import { toast } from '@/components/toast';
import { endSlot, formatLong, formatShort, slotToMin } from '@/lib/dates';
import { simulateLatency } from '@/lib/motion';
import { cx } from '@/lib/cx';
import { dataErrors, occasionErrors, type Ctx, type Draft } from './draft';

export interface StepProps {
  d: Draft;
  set: (patch: Partial<Draft>) => void;
  ctx: Ctx;
  mode: 'new' | 'edit';
  goTo: (step: number) => void;
  advance: () => void;
  notice?: string | null;
  clearNotice?: () => void;
  showErrors?: boolean;
  hint?: string | null;
}

const partyLabel = (n: number) => `${n} ${n === 1 ? 'persona' : 'personas'}`;

// ------------------------------------------------------------ 1 · Personas
export function StepParty({ d, set }: StepProps) {
  const [more, setMore] = useState(false);
  const choose = (n: number) => {
    setMore(false);
    set({ party: n });
  };
  return (
    <div className="step">
      <p className="step__help">Reservas en línea para 1 a 6 personas.</p>
      <div className="party" role="radiogroup" aria-label="Número de personas">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={d.party === n && !more}
            className={cx('party__tile', d.party === n && !more && 'is-on')}
            onClick={() => choose(n)}
          >
            <span className="party__n display">{n}</span>
            <svg viewBox="0 0 60 40" className="party__plan" aria-hidden>
              <rect x="16" y="10" width="28" height="20" rx="3" />
              {Array.from({ length: n }).map((_, i) => {
                const pos = [
                  [8, 20],
                  [52, 20],
                  [30, 3],
                  [30, 37],
                  [20, 3],
                  [40, 37],
                ][i];
                return <circle key={i} cx={pos[0]} cy={pos[1]} r="3.2" />;
              })}
            </svg>
            {d.party === n && !more && <Check className="party__check" aria-hidden />}
          </button>
        ))}
        <button role="radio" aria-checked={more} className={cx('party__tile party__tile--more', more && 'is-on')} onClick={() => setMore(true)}>
          <span className="party__more">Más de 6</span>
        </button>
      </div>
      <div className="stepper" aria-label="Ajustar personas">
        <button className="icon-btn" aria-label="Una persona menos" disabled={!d.party || d.party <= 1} onClick={() => choose(Math.max(1, (d.party ?? 2) - 1))}>
          <Minus aria-hidden />
        </button>
        <output className="stepper__val tnum" aria-live="polite">
          {d.party && !more ? partyLabel(d.party) : '—'}
        </output>
        <button className="icon-btn" aria-label="Una persona más" disabled={(d.party ?? 0) >= 6} onClick={() => choose(Math.min(6, (d.party ?? 0) + 1))}>
          <Plus aria-hidden />
        </button>
      </div>
      {more && (
        <div className="alert alert--info" role="alert">
          <Phone aria-hidden />
          <p className="alert__title">Para grupos de más de 6 personas, llámanos y armamos tu mesa: 81 5550 1947.</p>
          <div className="alert__actions">
            <button className="btn btn--sm" onClick={() => toast('Llamada simulada: en un restaurante real se abriría tu marcador.', { kind: 'info' })}>
              <Phone aria-hidden /> Llamar <SimPill />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------ 2 · Horario
export function StepSlot({ d, set, ctx, mode }: StepProps) {
  const avail = useMemo(
    () => (mode === 'edit' && d.date && d.party ? Object.fromEntries(slotsForDate(d.date, d.party, ctx.now, ctx.data, ctx.excludeId).map((s) => [s.slot, s.bookable])) : null),
    [mode, d.date, d.party, ctx],
  );
  const groups = (['Comida', 'Cena'] as const).map((turn) => ({ turn, slots: SLOTS.filter((s) => s.turn === turn) }));
  const sel = d.slot;
  return (
    <div className="step">
      <p className="step__help">
        Tu mesa es tuya por <strong>1 h 30 min</strong>. {mode === 'new' ? 'Confirmamos la disponibilidad al elegir la fecha.' : `Disponibilidad para el ${d.date ? formatLong(d.date) : ''}.`}
      </p>
      {groups.map((g) => (
        <fieldset key={g.turn} className="slots">
          <legend className="slots__legend">
            {g.turn === 'Comida' ? <Sun aria-hidden /> : <Moon aria-hidden />}
            <strong>{g.turn}</strong>
            <span className="muted">{g.turn === 'Comida' ? '13:00–17:00' : '18:00–22:30'}</span>
          </legend>
          <div className="slots__grid" role="radiogroup" aria-label={`Horarios de ${g.turn.toLowerCase()}`}>
            {g.slots.map(({ slot }) => {
              const ok = avail ? avail[slot] : true;
              return (
                <button
                  key={slot}
                  role="radio"
                  aria-checked={sel === slot}
                  className={cx('slot', sel === slot && 'is-on', avail && !ok && sel !== slot && 'is-na')}
                  onClick={() => set({ slot })}
                  aria-label={`${slot}${avail ? (ok ? ', disponible' : ', sin disponibilidad') : ''}`}
                >
                  <span className="tnum">{slot}</span>
                  {avail && <span className={cx('slot__dot', ok ? 'ok' : 'no')} aria-hidden />}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {sel && (
        <div className="timeline" aria-hidden>
          <div className="timeline__bar">
            {['13:00', '17:00', '18:00', '22:30'].map((t) => (
              <span key={t} className="timeline__tick" style={{ left: `${((slotToMin(t) - 780) / (1350 - 780)) * 100}%` }}>
                {t}
              </span>
            ))}
            <span className="timeline__svc" style={{ left: 0, width: `${(240 / 570) * 100}%` }} />
            <span className="timeline__svc" style={{ left: `${(300 / 570) * 100}%`, width: `${(270 / 570) * 100}%` }} />
            <span className="timeline__res" style={{ left: `${((slotToMin(sel) - 780) / 570) * 100}%`, width: `${(90 / 570) * 100}%` }}>
              {sel}–{endSlot(sel)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------ 3 · Fecha
const REASON: Record<Exclude<DayState, 'disponible' | 'pocas'>, { title: (d: Draft) => string; text: string; icon: typeof AlertTriangle }> = {
  sin: {
    title: (d) => `No quedan mesas para ${d.party} personas el ${formatLong(d.date!)} a las ${d.slot}.`,
    text: 'Prueba otro horario u otra fecha.',
    icon: Utensils,
  },
  cerrado: { title: () => 'Los lunes descansamos.', text: 'Abrimos de martes a domingo.', icon: CalendarX2 },
  pasado: { title: () => 'Este horario ya pasó o está muy próximo.', text: 'Reserva con al menos 1 hora de anticipación.', icon: AlertTriangle },
  fuera: { title: () => 'Esa fecha está fuera de la ventana de reserva.', text: 'Puedes reservar hasta 60 días adelante.', icon: CalendarX2 },
};

function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1100px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1100px)');
    const fn = () => setWide(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return wide;
}

export function StepDate({ d, set, ctx, goTo, advance, hint, notice }: StepProps) {
  const [loading, setLoading] = useState(true);
  const wide = useWide();
  const today = todayISO(ctx.now);
  const last = lastBookableDate(ctx.now);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    simulateLatency(300, 700).then(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [d.party, d.slot]);

  const stateOf = (date: string) => dayInfo(date, d.slot!, d.party!, ctx.now, ctx.data, ctx.excludeId).state;
  const sel = d.date ? stateOf(d.date) : null;
  const bad = sel && sel !== 'disponible' && sel !== 'pocas' ? sel : null;
  const alt = bad && d.date ? alternatives(d.date, d.slot!, d.party!, ctx.now, ctx.data, ctx.excludeId) : null;
  const info = bad ? REASON[bad] : null;

  // Horarios válidos de hoy para “Horario ya pasado”
  return (
    <div className="step">
      <p className="step__help">
        Te mostramos los días con mesa para <strong>{partyLabel(d.party!)}</strong> a las <strong className="tnum">{d.slot}</strong>.{' '}
        <button className="text-btn" onClick={() => goTo(2)}>
          Cambiar horario
        </button>
      </p>
      {hint && (
        <p className="hint-chip" role="note">
          <Sparkles aria-hidden /> {hint}
        </p>
      )}
      {notice && (
        <div className="alert alert--dark" role="alert">
          <AlertTriangle aria-hidden />
          <p className="alert__title">La disponibilidad acaba de cambiar.</p>
          <p className="alert__text">{notice}</p>
        </div>
      )}
      <div className="date-layout">
        <div className="date-cal">
          <Calendar today={today} last={last} selected={d.date} dayState={stateOf} onSelect={(date) => set({ date })} loading={loading} months={wide ? 2 : 1} />
          <CalendarLegend />
        </div>
        {info && alt && (
          <div className="dpanel" role="alert" aria-live="assertive">
            <info.icon className="dpanel__icon" aria-hidden />
            <h3 className="dpanel__title">{info.title(d)}</h3>
            <p className="muted">{info.text}</p>
            {alt.slots.length > 0 && (
              <div className="dpanel__group">
                <h4>Otros horarios ese día</h4>
                <div className="chips">
                  {alt.slots.map((s) => (
                    <button
                      key={s}
                      className="chip chip--alt"
                      onClick={() => {
                        set({ slot: s });
                        advance();
                      }}
                    >
                      <span className="tnum">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {alt.dates.length > 0 && (
              <div className="dpanel__group">
                <h4>La misma hora, otro día</h4>
                <div className="chips">
                  {alt.dates.map((x) => (
                    <button
                      key={x}
                      className="chip chip--alt"
                      onClick={() => {
                        set({ date: x });
                        advance();
                      }}
                    >
                      {formatShort(x)} · <span className="tnum">{d.slot}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!alt.slots.length && !alt.dates.length && <p>No encontramos alternativas cercanas.</p>}
            <div className="dpanel__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => set({ date: null })}>
                Cambiar fecha
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => goTo(1)}>
                Cambiar número de personas
              </button>
            </div>
          </div>
        )}
        {!info && d.date && (
          <div className="dpanel dpanel--ok">
            <Check className="dpanel__icon" aria-hidden />
            <h3 className="dpanel__title">{formatLong(d.date)}</h3>
            <p className="muted">
              {sel === 'pocas' ? 'Quedan pocas mesas a esta hora.' : 'Hay mesas disponibles.'} {d.slot}–{endSlot(d.slot!)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 4 · Mesa
export function StepTable({ d, set, ctx, mode, goTo, notice, clearNotice }: StepProps) {
  const [view, setView] = useState<'map' | 'list'>(() => (window.innerWidth < 400 ? 'list' : 'map'));
  const [focusId, setFocusId] = useState<TableId | null>(d.tableId);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<TableId | null>(null);
  const [live, setLive] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    simulateLatency(300, 600).then(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const statuses = useMemo(
    () => tableStatuses({ date: d.date!, slot: d.slot!, party: d.party!, selectedId: d.tableId, excludeId: ctx.excludeId }, ctx.data),
    [d.date, d.slot, d.party, d.tableId, ctx],
  );
  const recs = useMemo(() => recommendTables(statuses, d.party!, d.prefs, mode === 'edit' ? d.occasion : null), [statuses, d.party, d.prefs, mode, d.occasion]);
  const recMap = Object.fromEntries(recs.map((r) => [r.tableId, r.reasons])) as Partial<Record<TableId, string[]>>;
  const free = statuses.filter((s) => s.state === 'Disponible' || s.state === 'Seleccionada');

  // EC-18 · la mesa elegida deja de estar disponible mientras se ve el mapa
  useEffect(() => {
    if (!d.tableId) return;
    const st = statuses.find((s) => s.table.id === d.tableId);
    if (st && st.state !== 'Seleccionada' && st.state !== 'Disponible') {
      setFlash(d.tableId);
      setLive(`Alguien más apartó la ${TABLE_BY_ID[d.tableId].name} a esta hora. Elige otra; guardamos el resto de tu reserva.`);
      set({ tableId: null });
    }
  }, [statuses, d.tableId, set]);

  const focused = statuses.find((s) => s.table.id === (focusId ?? d.tableId ?? recs[0]?.tableId)) ?? null;
  const togglePref = (f: Feature) => set({ prefs: d.prefs.includes(f) ? d.prefs.filter((x) => x !== f) : [...d.prefs, f] });
  const choose = (id: TableId) => {
    const st = statuses.find((s) => s.table.id === id);
    setFocusId(id);
    if (!st?.selectable) return;
    set({ tableId: id });
    clearNotice?.();
    setLive(null);
  };
  const conflictMsg = notice ?? live;

  if (!loading && free.length === 0) {
    return (
      <div className="step">
        <div className="alert alert--error" role="alert">
          <AlertTriangle aria-hidden />
          <p className="alert__title">No quedan mesas para {partyLabel(d.party!)} a esta hora.</p>
          <p className="alert__text">Prueba otro horario u otra fecha.</p>
          <div className="alert__actions">
            <button className="btn btn--sm" onClick={() => goTo(3)}>
              Ver alternativas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="step">
      <p className="step__help">Toca una mesa disponible para ver sus detalles. No asignamos mesas: tú eliges.</p>
      {conflictMsg && (
        <div className="alert alert--dark" role="alert">
          <AlertTriangle aria-hidden />
          <p className="alert__title">La disponibilidad acaba de cambiar.</p>
          <p className="alert__text">{conflictMsg}</p>
        </div>
      )}
      <div className="table-tools">
        <div className="table-prefs">
          <span className="table-prefs__label">¿Qué te gustaría?</span>
          <div className="chips chips--scroll" role="group" aria-label="Preferencias de mesa">
            {FEATURES.map((f) => (
              <button key={f} className={cx('chip chip--sm', d.prefs.includes(f) && 'is-on')} aria-pressed={d.prefs.includes(f)} onClick={() => togglePref(f)}>
                {d.prefs.includes(f) && <Check aria-hidden />}
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="seg seg--sm" role="group" aria-label="Vista">
          <button className={cx('seg__btn', view === 'map' && 'is-on')} aria-pressed={view === 'map'} onClick={() => setView('map')}>
            <LayoutGrid aria-hidden /> Ver como mapa
          </button>
          <button className={cx('seg__btn', view === 'list' && 'is-on')} aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <List aria-hidden /> Ver como lista
          </button>
        </div>
      </div>

      <div className="table-layout">
        <div className="table-main">
          {loading ? (
            <div className="skeleton floor-sk" aria-busy="true" aria-label="Cargando el plano" />
          ) : view === 'map' ? (
            <>
              <div className="floor-wrap">
                <FloorPlan statuses={statuses} selectedId={d.tableId} recommended={recMap} onSelect={choose} onFocusTable={setFocusId} flashId={flash} />
              </div>
              <FloorLegend />
            </>
          ) : (
            <ul className="tlist">
              {[...statuses]
                .sort((a, b) => {
                  const rank = (s: typeof a) => (recMap[s.table.id] ? 0 : s.selectable ? 1 : 2);
                  return rank(a) - rank(b) || a.table.id.localeCompare(b.table.id);
                })
                .map((s) => (
                  <li key={s.table.id} className={cx('tlist__row', s.state === 'Seleccionada' && 'is-on', !s.selectable && 'is-off')}>
                    <div className="tlist__id">
                      <strong>{s.table.name}</strong>
                      <span className="muted">
                        {s.table.capacity} personas · {s.table.zone}
                      </span>
                    </div>
                    <div className="tlist__feat">
                      {s.table.features.map((f) => (
                        <span key={f} className="tag">
                          {f}
                        </span>
                      ))}
                      {recMap[s.table.id] && <span className="tag tag--recomendado">★ Recomendada</span>}
                    </div>
                    <div className="tlist__state">
                      <span className={`tstate tstate--${s.state === 'Seleccionada' ? 'sel' : s.selectable ? 'free' : 'off'}`}>{s.selectable ? s.state : s.reasonText}</span>
                      {s.selectable && s.state !== 'Seleccionada' && (
                        <button className="btn btn--sm btn--ghost" onClick={() => choose(s.table.id)} aria-label={`Elegir ${s.table.name}`}>
                          Elegir
                        </button>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
        {focused && (
          <aside className={cx('tcard', focused.state === 'Seleccionada' && 'is-on')} aria-live="polite">
            <p className="eyebrow">{focused.table.zone}</p>
            <h3 className="tcard__name display">{focused.table.name}</h3>
            <p className="tcard__cap">
              Para {focused.table.capacity} personas · {focused.state === 'Seleccionada' ? 'Seleccionada' : focused.selectable ? 'Disponible' : focused.reasonText}
            </p>
            <p>{focused.table.description}</p>
            <div className="tcard__feat">
              {focused.table.features.map((f) => (
                <span key={f} className="tag">
                  {f}
                </span>
              ))}
            </div>
            {recMap[focused.table.id] && (
              <div className="tcard__rec">
                <strong>★ Recomendada</strong>
                {recMap[focused.table.id]!.map((r) => (
                  <span key={r}>{r}</span>
                ))}
              </div>
            )}
            {focused.selectable && focused.state !== 'Seleccionada' && (
              <button className="btn btn--primary btn--block" onClick={() => choose(focused.table.id)}>
                Elegir esta mesa
              </button>
            )}
            {focused.state === 'Seleccionada' && (
              <p className="tcard__ok">
                <Check aria-hidden /> {focused.table.name} seleccionada
              </p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 5 · Ocasión
const OCC_ICON: Record<Occasion, typeof Heart> = { Ninguna: Utensils, Cumpleaños: Cake, Aniversario: Heart, Sorpresa: Gift, Otra: Sparkles };

export function StepOccasion({ d, set, ctx, showErrors }: StepProps) {
  const errors = occasionErrors(d);
  const suggestion = d.tableId && d.date && d.slot && d.party ? occasionSuggestion(d.tableId, d.occasion, d.date, d.slot, d.party, ctx.data, ctx.excludeId) : null;
  const sKey = `${d.occasion}-${d.tableId}`;
  const showSuggestion = suggestion && d.suggestionSeen !== sKey;
  return (
    <div className="step">
      <p className="step__help">Opcional: cuéntanos cómo podemos ayudar.</p>
      <div className="occ" role="radiogroup" aria-label="Ocasión">
        {OCCASIONS.map((o) => {
          const Icon = OCC_ICON[o];
          return (
            <button key={o} role="radio" aria-checked={d.occasion === o} className={cx('occ__opt', d.occasion === o && 'is-on')} onClick={() => set({ occasion: o })}>
              <Icon aria-hidden />
              {o}
            </button>
          );
        })}
      </div>
      {d.occasion === 'Otra' && (
        <div className={cx('field', showErrors && errors.occasionOther && 'field--error')}>
          <label className="field__label" htmlFor="occ-other">
            ¿Qué celebran? <span className="opt">obligatorio</span>
          </label>
          <input id="occ-other" className="input" maxLength={60} value={d.occasionOther} onChange={(e) => set({ occasionOther: e.target.value })} aria-invalid={!!(showErrors && errors.occasionOther)} aria-describedby="occ-other-e" />
          {showErrors && errors.occasionOther && (
            <p id="occ-other-e" className="field__error">
              <AlertTriangle aria-hidden />
              {errors.occasionOther}
            </p>
          )}
        </div>
      )}
      {d.occasion !== 'Ninguna' && (
        <div className={cx('field', errors.occasionNotes && 'field--error')}>
          <label className="field__label" htmlFor="occ-notes">
            Instrucciones para la ocasión <span className="opt">opcional</span>
          </label>
          <textarea id="occ-notes" className="textarea" placeholder="Ej.: traeremos un pastel pequeño." value={d.occasionNotes} onChange={(e) => set({ occasionNotes: e.target.value })} aria-describedby="occ-notes-c" />
          <span id="occ-notes-c" className={cx('counter', d.occasionNotes.length > 200 && 'over')}>
            {d.occasionNotes.length}/200
          </span>
        </div>
      )}
      {showSuggestion && suggestion && (
        <div className="suggest" role="status">
          <svg viewBox="0 0 1000 620" className="suggest__mini" aria-hidden>
            <rect width="1000" height="620" rx="30" fill="#EAE1D3" />
            {Object.values(TABLE_BY_ID).map((t) => (
              <circle key={t.id} cx={t.plan.x} cy={t.plan.y} r={t.plan.shape === 'rect' ? 60 : 44} fill={t.id === suggestion.id ? 'var(--chile)' : '#CDBFAB'} />
            ))}
          </svg>
          <div>
            <p className="suggest__text">
              Para {d.occasion === 'Aniversario' ? 'un aniversario' : d.occasion === 'Cumpleaños' ? 'un cumpleaños' : 'una sorpresa'}, la <strong>{suggestion.name}</strong> ({suggestion.features.join(' · ')}) está libre. ¿Quieres cambiarla?
            </p>
            <div className="suggest__actions">
              <button className="btn btn--primary btn--sm" onClick={() => set({ tableId: suggestion.id, suggestionSeen: `${d.occasion}-${suggestion.id}` })}>
                Cambiar a {suggestion.name}
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => set({ suggestionSeen: sKey })}>
                Mantener mi mesa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------ 6 · Datos
export function StepData({ d, set, showErrors }: StepProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const errors = dataErrors(d);
  const show = (k: string) => (showErrors || touched[k]) && errors[k];
  const visible = Object.keys(errors).filter((k) => showErrors && errors[k]);
  const labels: Record<string, string> = { name: 'Nombre', phone: 'Teléfono', comment: 'Comentario' };
  return (
    <div className="step">
      <p className="step__help">Solo necesitamos tu nombre y teléfono. No pedimos correo.</p>
      {visible.length > 0 && (
        <div className="alert alert--error" role="alert" tabIndex={-1} id="err-summary">
          <AlertTriangle aria-hidden />
          <p className="alert__title">Revisa los campos marcados: {visible.map((k) => labels[k]).join(', ')}.</p>
        </div>
      )}
      <div className="form-grid">
        <div className={cx('field', show('name') && 'field--error')}>
          <label className="field__label" htmlFor="f-name">
            Nombre completo <span className="opt">obligatorio</span>
          </label>
          <input id="f-name" className="input" autoComplete="name" value={d.name} onChange={(e) => set({ name: e.target.value })} onBlur={() => setTouched((t) => ({ ...t, name: true }))} aria-invalid={!!show('name')} aria-describedby="f-name-e" />
          {show('name') && (
            <p id="f-name-e" className="field__error">
              <AlertTriangle aria-hidden />
              {errors.name}
            </p>
          )}
        </div>
        <div className={cx('field', show('phone') && 'field--error')}>
          <label className="field__label" htmlFor="f-phone">
            Teléfono (10 dígitos) <span className="opt">obligatorio</span>
          </label>
          <input id="f-phone" className="input tnum" type="tel" inputMode="tel" autoComplete="tel" placeholder="81 1234 5678" value={d.phone} onChange={(e) => set({ phone: e.target.value })} onBlur={() => setTouched((t) => ({ ...t, phone: true }))} aria-invalid={!!show('phone')} aria-describedby="f-phone-h f-phone-e" />
          <p id="f-phone-h" className="field__hint">
            Lo usarás junto con tu código para consultar tu reserva.
          </p>
          {show('phone') && (
            <p id="f-phone-e" className="field__error">
              <AlertTriangle aria-hidden />
              {errors.phone}
            </p>
          )}
        </div>
        <div className={cx('field form-grid__full', errors.comment && 'field--error')}>
          <label className="field__label" htmlFor="f-comment">
            Comentario o instrucciones especiales <span className="opt">opcional</span>
          </label>
          <textarea id="f-comment" className="textarea" value={d.comment} onChange={(e) => set({ comment: e.target.value })} aria-describedby="f-comment-c" />
          <span id="f-comment-c" className={cx('counter', d.comment.length > 300 && 'over')}>
            {d.comment.length}/300
          </span>
          {errors.comment && (
            <p className="field__error">
              <AlertTriangle aria-hidden />
              {errors.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
