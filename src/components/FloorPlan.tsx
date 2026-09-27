import { useRef } from 'react';
import type { TableStatus } from '@/domain/availability';
import type { TableId } from '@/domain/types';
import { cx } from '@/lib/cx';

export interface FloorPlanProps {
  statuses: TableStatus[];
  selectedId?: TableId | null;
  recommended?: Partial<Record<TableId, string[]>>;
  onSelect?: (id: TableId) => void;
  onFocusTable?: (id: TableId) => void;
  mode?: 'client' | 'admin';
  /** Mesa que acaba de cambiar a ocupada (animación de conflicto) */
  flashId?: TableId | null;
  compact?: boolean;
  label?: string;
}

const STATE_CLASS: Record<string, string> = {
  Disponible: 'is-free',
  Seleccionada: 'is-selected',
  Ocupada: 'is-busy',
  'No disponible': 'is-off',
  Mantenimiento: 'is-maint',
};

function chairs(shape: string, w: number, h: number, capacity: number) {
  const pts: [number, number][] = [];
  const g = 14;
  if (capacity === 2) {
    pts.push([-w / 2 - g, 0], [w / 2 + g, 0]);
  } else if (capacity === 4) {
    pts.push([0, -h / 2 - g], [0, h / 2 + g], [-w / 2 - g, 0], [w / 2 + g, 0]);
  } else {
    const horizontal = w >= h;
    for (const k of [-1, 0, 1]) {
      if (horizontal) pts.push([k * (w / 3), -h / 2 - g], [k * (w / 3), h / 2 + g]);
      else pts.push([-w / 2 - g, k * (h / 3)], [w / 2 + g, k * (h / 3)]);
    }
  }
  void shape;
  return pts;
}

/** Plano del restaurante visto desde arriba (FR-029, FR-052). Mismo lenguaje en cliente y admin. */
export function FloorPlan({ statuses, selectedId, recommended = {}, onSelect, onFocusTable, mode = 'client', flashId, compact, label }: FloorPlanProps) {
  const svg = useRef<SVGSVGElement>(null);
  const order = statuses.map((s) => s.table.id);

  const onKey = (e: React.KeyboardEvent, id: TableId, selectable: boolean) => {
    const i = order.indexOf(id);
    let j = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % order.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + order.length) % order.length;
    if (j >= 0) {
      e.preventDefault();
      svg.current?.querySelectorAll<SVGGElement>('[data-table]')[j]?.focus();
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
      e.preventDefault();
      if (selectable || mode === 'admin') onSelect(id);
      else onFocusTable?.(id);
    }
  };

  return (
    <svg
      ref={svg}
      className={cx('floor', compact && 'floor--compact', mode === 'admin' && 'floor--admin')}
      viewBox="0 0 1000 620"
      role="group"
      aria-label={label ?? 'Plano del restaurante. Usa las flechas para recorrer las mesas y Enter para elegir.'}
    >
      <defs>
        <pattern id="busy-stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#DCCFBE" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#8C7E6E" strokeWidth="3" />
        </pattern>
        <pattern id="terrace-tiles" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#E6DCCB" />
          <path d="M0 0 H40 M0 0 V40" stroke="#D6C8B4" strokeWidth="1.5" />
        </pattern>
        <pattern id="floor-grain" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="#F1EBE0" />
          <circle cx="4" cy="6" r="0.8" fill="#DDD2C2" />
          <circle cx="16" cy="18" r="0.7" fill="#DDD2C2" />
        </pattern>
      </defs>

      {/* salón */}
      <rect x="0" y="0" width="1000" height="620" rx="18" fill="url(#floor-grain)" />
      <rect x="760" y="0" width="240" height="620" fill="url(#terrace-tiles)" />
      <rect x="0" y="210" width="236" height="410" fill="#EAE1D3" />
      {/* ventanal */}
      <rect x="0" y="0" width="1000" height="26" fill="#C9D6D3" />
      {Array.from({ length: 20 }).map((_, i) => (
        <rect key={i} x={i * 50} y="0" width="3" height="26" fill="#F4EFE6" />
      ))}
      <line x1="760" y1="26" x2="760" y2="620" stroke="#BFB09C" strokeWidth="3" strokeDasharray="10 8" />
      {/* celosía M08 */}
      <g stroke="#B7A48C" strokeWidth="2">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={210} y1={410 + i * 14} x2={226} y2={404 + i * 14} />
        ))}
      </g>
      {/* barra */}
      <rect x="320" y="532" width="360" height="34" rx="6" fill="#3A332D" />
      <rect x="320" y="532" width="360" height="6" rx="3" fill="#5A5047" />
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={345 + i * 44} cy={518} r="7" fill="#CFC2AF" />
      ))}
      <rect x="380" y="582" width="240" height="38" fill="#D8CCBB" />
      {/* etiquetas de zona */}
      <text x="24" y="54" className="floor__zone">
        Ventanal
      </text>
      <text x="24" y="244" className="floor__zone">
        Interior
      </text>
      <text x="786" y="54" className="floor__zone">
        Terraza
      </text>
      <text x="330" y="505" className="floor__zone">
        Barra
      </text>
      <text x="500" y="606" className="floor__ref" textAnchor="middle">
        Cocina
      </text>
      <g className="floor__ref">
        <path d="M18 612 H120" stroke="#F4EFE6" strokeWidth="8" />
        <text x="24" y="600">
          ▸ Entrada
        </text>
      </g>

      {statuses.map((s) => {
        const t = s.table;
        const { x, y, w, h, shape } = t.plan;
        const rec = recommended[t.id];
        const selectable = s.selectable;
        const cls = STATE_CLASS[s.state];
        const name =
          mode === 'admin'
            ? `${t.name}, para ${t.capacity}, ${s.state}${s.reservation ? `, ${s.reservation.name}` : ''}${s.block?.note ? `, nota: ${s.block.note}` : ''}`
            : `${t.name}, para ${t.capacity}, ${t.features.join(', ')}. ${s.state === 'Disponible' || s.state === 'Seleccionada' ? s.state : s.reasonText}${rec ? '. Recomendada.' : ''}`;
        return (
          <g
            key={t.id}
            data-table={t.id}
            className={cx('tbl', cls, rec && 'is-rec', flashId === t.id && 'is-flash')}
            transform={`translate(${x} ${y})`}
            role="button"
            tabIndex={0}
            aria-label={name}
            aria-pressed={s.state === 'Seleccionada' || selectedId === t.id}
            aria-disabled={!selectable && mode === 'client'}
            onClick={() => (selectable || mode === 'admin' ? onSelect?.(t.id) : onFocusTable?.(t.id))}
            onFocus={() => onFocusTable?.(t.id)}
            onMouseEnter={() => onFocusTable?.(t.id)}
            onKeyDown={(e) => onKey(e, t.id, selectable)}
          >
            <g className="tbl__lift">
              {rec && <circle r={Math.max(w, h) / 2 + 30} className="tbl__halo" />}
              {chairs(shape, w, h, t.capacity).map(([cx2, cy2], i) => (
                <circle key={i} cx={cx2} cy={cy2} r="9" className="tbl__chair" />
              ))}
              {shape === 'round' ? (
                <circle r={w / 2} className="tbl__top" />
              ) : (
                <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="8" className="tbl__top" />
              )}
              <text className="tbl__id" y={mode === 'admin' && s.reservation ? -4 : 5} textAnchor="middle">
                {t.id}
              </text>
              {mode === 'admin' && s.reservation && (
                <text className="tbl__who" y="14" textAnchor="middle">
                  {s.reservation.name.split(' ')[0]}
                </text>
              )}
              {s.state === 'Seleccionada' && (
                <g transform={`translate(${Math.max(w, h) / 2 - 2} ${-h / 2 - 2})`} className="tbl__check">
                  <circle r="13" />
                  <path d="M-5 0 L-1 4 L6 -4" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}
              {s.state === 'Ocupada' && (
                <g transform={`translate(${w / 2 - 4} ${-h / 2 + 4})`} className="tbl__icon">
                  <circle r="11" />
                  <path d="M0 -5 V0 L3.5 2.5" fill="none" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}
              {s.state === 'Mantenimiento' && (
                <g transform={`translate(${w / 2 - 4} ${-h / 2 + 4})`} className="tbl__icon">
                  <circle r="11" />
                  <path d="M-4 4 L3 -3 M1 -5 A3 3 0 1 0 5 -1" fill="none" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}
              {s.state === 'No disponible' && (
                <g transform={`translate(${w / 2 - 4} ${-h / 2 + 4})`} className="tbl__icon">
                  <circle r="11" />
                  <path d="M-5 5 L5 -5" fill="none" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}
              {rec && s.state !== 'Seleccionada' && (
                <g transform={`translate(${-Math.max(w, h) / 2 + 2} ${-h / 2 - 4})`} className="tbl__rec">
                  <circle r="12" />
                  <path d="M0 -6 L1.8 -1.9 L6 -1.6 L2.8 1.2 L3.8 5.4 L0 3.2 L-3.8 5.4 L-2.8 1.2 L-6 -1.6 L-1.8 -1.9 Z" />
                </g>
              )}
              {t.features.includes('Accesible') && (
                <text className="tbl__a11y" x={-w / 2 + 12} y={h / 2 - 8} aria-hidden>
                  ♿
                </text>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

export function FloorLegend({ admin }: { admin?: boolean }) {
  const items = [
    ['is-free', 'Disponible'],
    ['is-selected', admin ? 'Seleccionada' : 'Seleccionada'],
    ['is-busy', 'Ocupada'],
    ['is-off', 'No disponible'],
    ['is-maint', 'Mantenimiento'],
  ];
  return (
    <ul className="legend" aria-label="Leyenda de estados">
      {items.map(([c, l]) => (
        <li key={c}>
          <span className={`legend__sw ${c}`} aria-hidden />
          {l}
        </li>
      ))}
      {!admin && (
        <li>
          <span className="legend__sw is-rec" aria-hidden>
            ★
          </span>
          Recomendada
        </li>
      )}
    </ul>
  );
}
