import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DayState } from '@/domain/availability';
import { addDays, formatLong, formatMonth, parseISODate, toISODate } from '@/lib/dates';
import { cx } from '@/lib/cx';

export const DAY_LABEL: Record<DayState, string> = {
  disponible: 'Disponible',
  pocas: 'Pocas mesas',
  sin: 'Sin disponibilidad',
  cerrado: 'Cerrado',
  pasado: 'Horario ya pasado',
  fuera: 'Fuera de ventana',
};

interface Props {
  today: string;
  last: string;
  selected: string | null;
  dayState: (date: string) => DayState;
  onSelect: (date: string) => void;
  loading?: boolean;
  months?: 1 | 2;
}

const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function monthStart(iso: string) {
  return iso.slice(0, 8) + '01';
}
function addMonths(iso: string, n: number) {
  const d = parseISODate(monthStart(iso));
  d.setMonth(d.getMonth() + n);
  return toISODate(d);
}

/** Calendario con estados por día (FR-028) y navegación de rejilla por teclado (docs/14 §2). */
export function Calendar({ today, last, selected, dayState, onSelect, loading, months = 2 }: Props) {
  const [view, setView] = useState(() => monthStart(selected ?? today));
  const [focus, setFocus] = useState(selected ?? today);
  const root = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    root.current?.querySelector<HTMLElement>(`[data-date="${focus}"]`)?.focus();
  }, [focus, view]);

  const monthList = useMemo(() => Array.from({ length: months }, (_, i) => addMonths(view, i)), [view, months]);
  const canPrev = view > monthStart(today);
  const canNext = addMonths(view, months - 1) < monthStart(last);

  const move = (date: string) => {
    if (date < today || date > last) return;
    moved.current = true;
    setFocus(date);
    const vs = view;
    const ve = addMonths(view, months) ;
    if (date < vs) setView(monthStart(date));
    else if (date >= ve) setView(addMonths(monthStart(date), -(months - 1)));
  };

  const onKey = (e: React.KeyboardEvent, date: string) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (map[e.key] !== undefined) {
      e.preventDefault();
      move(addDays(date, map[e.key]));
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      move(addMonths(date, 1).slice(0, 8) + date.slice(8));
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      move(addMonths(date, -1).slice(0, 8) + date.slice(8));
    } else if (e.key === 'Home') {
      e.preventDefault();
      const dow = (parseISODate(date).getDay() + 6) % 7;
      move(addDays(date, -dow));
    } else if (e.key === 'End') {
      e.preventDefault();
      const dow = (parseISODate(date).getDay() + 6) % 7;
      move(addDays(date, 6 - dow));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(date);
    }
  };

  const focusDate = focus >= today && focus <= last ? focus : today;

  return (
    <div className="cal" ref={root}>
      <div className="cal__nav">
        <button className="icon-btn" disabled={!canPrev} onClick={() => setView(addMonths(view, -1))} aria-label="Mes anterior">
          <ChevronLeft aria-hidden />
        </button>
        <button className="icon-btn" disabled={!canNext} onClick={() => setView(addMonths(view, 1))} aria-label="Mes siguiente">
          <ChevronRight aria-hidden />
        </button>
      </div>
      <div className={cx('cal__months', months === 2 && 'cal__months--2')}>
        {monthList.map((m, mi) => {
          const first = parseISODate(m);
          const offset = (first.getDay() + 6) % 7;
          const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
          const cells: (string | null)[] = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => toISODate(new Date(first.getFullYear(), first.getMonth(), i + 1)))];
          return (
            <div key={m} className={cx('cal__month', mi === 1 && 'cal__month--second')}>
              <h3 className="cal__title">{formatMonth(m)}</h3>
              <div className="cal__grid" role="grid" aria-label={formatMonth(m)}>
                <div role="row" className="cal__row cal__row--head">
                  {WEEK.map((w, i) => (
                    <span key={i} role="columnheader" className="cal__wd" aria-hidden>
                      {w}
                    </span>
                  ))}
                </div>
                {Array.from({ length: Math.ceil(cells.length / 7) }).map((_, r) => (
                  <div role="row" className="cal__row" key={r}>
                    {cells.slice(r * 7, r * 7 + 7).map((d, i) => {
                      if (!d) return <span key={i} role="gridcell" className="cal__cell cal__cell--empty" />;
                      const out = d < today || d > last;
                      const st: DayState = out ? 'fuera' : dayState(d);
                      const isSel = d === selected;
                      return (
                        <span role="gridcell" key={d} className="cal__cellwrap">
                          <button
                            data-date={d}
                            className={cx('cal__cell', `is-${st}`, isSel && 'is-selected', d === today && 'is-today', loading && 'is-loading')}
                            disabled={out}
                            tabIndex={d === focusDate ? 0 : -1}
                            aria-selected={isSel}
                            aria-label={`${formatLong(d)}${d === today ? ', hoy' : ''}, ${DAY_LABEL[st].toLowerCase()}`}
                            onClick={() => {
                              setFocus(d);
                              onSelect(d);
                            }}
                            onKeyDown={(e) => onKey(e, d)}
                          >
                            <span className="cal__num tnum">{parseISODate(d).getDate()}</span>
                            {!out && !loading && <span className="cal__mark" aria-hidden />}
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarLegend() {
  const items: DayState[] = ['disponible', 'pocas', 'sin', 'cerrado', 'pasado'];
  return (
    <ul className="legend legend--cal" aria-label="Leyenda del calendario">
      {items.map((s) => (
        <li key={s}>
          <span className={`cal-sw is-${s}`} aria-hidden />
          {DAY_LABEL[s]}
        </li>
      ))}
    </ul>
  );
}
