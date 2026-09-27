// Motor de disponibilidad. Reglas BR-001 – BR-024 (docs/09-business-rules.md).
import {
  DURATION_MIN,
  MIN_ADVANCE_MIN,
  OCCASION_AFFINITY,
  SLOT_VALUES,
  TABLES,
  WINDOW_DAYS,
} from './constants';
import type { Feature, Occasion, Reservation, Table, TableBlock, TableId } from './types';
import { addDays, dateTime, isMonday, slotToMin, toISODate } from '@/lib/dates';

export interface AvailabilityData {
  reservations: Reservation[];
  blocks: Partial<Record<TableId, TableBlock>>;
}

/** BR-005 · se solapan si la diferencia de inicios es menor a 90 min */
export function slotsOverlap(a: string, b: string): boolean {
  return Math.abs(slotToMin(a) - slotToMin(b)) < DURATION_MIN;
}

/** BR-010 · compatibilidad mesa–grupo */
export function isCompatible(capacity: number, party: number): boolean {
  if (party <= 2) return capacity === 2 || capacity === 4;
  if (party <= 4) return capacity === 4 || capacity === 6;
  return capacity === 6;
}

export function minFitCapacity(party: number): number {
  if (party <= 2) return 2;
  if (party <= 4) return 4;
  return 6;
}

/** BR-019 · reservas que ocupan mesa */
export function occupiesTable(r: Reservation): boolean {
  return r.status !== 'Cancelada';
}

export function isActive(r: Reservation): boolean {
  return r.status === 'Pendiente' || r.status === 'Confirmada' || r.status === 'Modificada';
}

export function blockingReservation(
  tableId: TableId,
  date: string,
  slot: string,
  reservations: Reservation[],
  excludeId?: string,
): Reservation | undefined {
  return reservations.find(
    (r) =>
      r.tableId === tableId &&
      r.date === date &&
      r.id !== excludeId &&
      occupiesTable(r) &&
      slotsOverlap(r.slot, slot),
  );
}

export type TableState = 'Disponible' | 'Seleccionada' | 'Ocupada' | 'No disponible' | 'Mantenimiento';
export type TableReason = 'mantenimiento' | 'bloqueo' | 'capacidad' | 'ocupada' | null;

export interface TableStatus {
  table: Table;
  state: TableState;
  reason: TableReason;
  reasonText: string;
  reservation?: Reservation;
  block?: TableBlock;
  selectable: boolean;
}

export interface TableContext {
  date: string;
  slot: string;
  /** Si se omite (admin) no se filtra por capacidad. */
  party?: number;
  selectedId?: TableId | null;
  /** Reserva en modificación: no cuenta como ocupación (BR-034). */
  excludeId?: string;
}

/** BR-013 · estado derivado por prioridad */
export function tableStatus(table: Table, ctx: TableContext, data: AvailabilityData): TableStatus {
  const block = data.blocks[table.id];
  if (block?.type === 'Mantenimiento') {
    return { table, state: 'Mantenimiento', reason: 'mantenimiento', reasonText: 'En mantenimiento', block, selectable: false };
  }
  if (block?.type === 'No disponible') {
    return { table, state: 'No disponible', reason: 'bloqueo', reasonText: 'No disponible por el momento', block, selectable: false };
  }
  if (ctx.party != null && !isCompatible(table.capacity, ctx.party)) {
    return {
      table,
      state: 'No disponible',
      reason: 'capacidad',
      reasonText: `Mesa para ${table.capacity}: tu grupo es de ${ctx.party}`,
      selectable: false,
    };
  }
  const res = blockingReservation(table.id, ctx.date, ctx.slot, data.reservations, ctx.excludeId);
  if (res) {
    return { table, state: 'Ocupada', reason: 'ocupada', reasonText: 'Ocupada a esta hora', reservation: res, selectable: false };
  }
  if (ctx.selectedId === table.id) {
    return { table, state: 'Seleccionada', reason: null, reasonText: 'Seleccionada', selectable: true };
  }
  return { table, state: 'Disponible', reason: null, reasonText: 'Disponible', selectable: true };
}

export function tableStatuses(ctx: TableContext, data: AvailabilityData): TableStatus[] {
  return TABLES.map((t) => tableStatus(t, ctx, data));
}

export function freeCompatibleTables(date: string, slot: string, party: number, data: AvailabilityData, excludeId?: string): Table[] {
  return tableStatuses({ date, slot, party, excludeId }, data)
    .filter((s) => s.state === 'Disponible')
    .map((s) => s.table);
}

export type DayState = 'fuera' | 'cerrado' | 'pasado' | 'sin' | 'pocas' | 'disponible';

export function todayISO(now: Date): string {
  return toISODate(now);
}

export function lastBookableDate(now: Date): string {
  return addDays(todayISO(now), WINDOW_DAYS);
}

/** BR-006 · ventana de reserva */
export function inWindow(date: string, now: Date): boolean {
  const today = todayISO(now);
  return date >= today && date <= lastBookableDate(now);
}

/** BR-007 · anticipación mínima */
export function slotTooSoon(date: string, slot: string, now: Date): boolean {
  return dateTime(date, slot).getTime() < now.getTime() + MIN_ADVANCE_MIN * 60_000;
}

/** BR-001, BR-006, BR-007 */
export function dateSlotValidity(date: string, slot: string, now: Date): 'ok' | 'fuera' | 'cerrado' | 'pasado' {
  if (!inWindow(date, now)) return 'fuera';
  if (isMonday(date)) return 'cerrado';
  if (slotTooSoon(date, slot, now)) return 'pasado';
  return 'ok';
}

export interface DayInfo {
  state: DayState;
  free: number;
}

/** Estado del día para horario + personas (docs/11 §4.1) */
export function dayInfo(date: string, slot: string, party: number, now: Date, data: AvailabilityData, excludeId?: string): DayInfo {
  const v = dateSlotValidity(date, slot, now);
  if (v !== 'ok') return { state: v, free: 0 };
  const free = freeCompatibleTables(date, slot, party, data, excludeId).length;
  if (free === 0) return { state: 'sin', free };
  if (free <= 2) return { state: 'pocas', free };
  return { state: 'disponible', free };
}

/** BR-020 */
export function isBookable(date: string, slot: string, party: number, now: Date, data: AvailabilityData, excludeId?: string): boolean {
  const s = dayInfo(date, slot, party, now, data, excludeId).state;
  return s === 'disponible' || s === 'pocas';
}

export interface Alternatives {
  slots: string[];
  dates: string[];
}

/** BR-024 · hasta 3 horarios la misma fecha y hasta 3 fechas con el mismo horario */
export function alternatives(date: string, slot: string, party: number, now: Date, data: AvailabilityData, excludeId?: string): Alternatives {
  const base = slotToMin(slot);
  const slots = isMonday(date) || !inWindow(date, now)
    ? []
    : SLOT_VALUES.filter((s) => s !== slot && isBookable(date, s, party, now, data, excludeId))
        .sort((a, b) => Math.abs(slotToMin(a) - base) - Math.abs(slotToMin(b) - base) || slotToMin(b) - slotToMin(a))
        .slice(0, 3);

  const dates: string[] = [];
  if (isMonday(date)) {
    for (const d of [addDays(date, -1), addDays(date, 1)]) {
      if (isBookable(d, slot, party, now, data, excludeId)) dates.push(d);
    }
  }
  let cursor = date;
  const last = lastBookableDate(now);
  while (dates.length < 3) {
    cursor = addDays(cursor, 1);
    if (cursor > last) break;
    if (dates.includes(cursor)) continue;
    if (isBookable(cursor, slot, party, now, data, excludeId)) dates.push(cursor);
  }
  return { slots, dates: dates.slice(0, 3) };
}

/** Horarios de un día con su disponibilidad (modo edición). */
export function slotsForDate(date: string, party: number, now: Date, data: AvailabilityData, excludeId?: string) {
  return SLOT_VALUES.map((slot) => ({ slot, bookable: isBookable(date, slot, party, now, data, excludeId) }));
}

export interface Recommendation {
  tableId: TableId;
  score: number;
  reasons: string[];
}

/** BR-016 · recomendación explicable (máximo 2) */
export function recommendTables(
  statuses: TableStatus[],
  party: number,
  prefs: Feature[],
  occasion?: Occasion | null,
): Recommendation[] {
  const affinity = occasion ? OCCASION_AFFINITY[occasion] : [];
  const scored = statuses
    .filter((s) => s.state === 'Disponible' || s.state === 'Seleccionada')
    .map((s) => {
      const t = s.table;
      let score = 0;
      const reasons: string[] = [];
      if (t.capacity === minFitCapacity(party)) {
        score += 2;
        reasons.push(`A tu medida: mesa para ${t.capacity}`);
      }
      const prefMatches = prefs.filter((p) => t.features.includes(p));
      if (prefMatches.length) {
        score += 3 * prefMatches.length;
        reasons.push(`Coincide con: ${prefMatches.join(', ')}`);
      }
      const occMatches = affinity.filter((f) => t.features.includes(f));
      if (occMatches.length && occasion) {
        score += occMatches.length;
        reasons.push(`Ideal para ${occasion.toLowerCase()}: ${occMatches.join(', ')}`);
      }
      if (party >= 5 && t.features.includes('Ideal para grupos')) {
        score += 1;
        reasons.push('Ideal para grupos');
      }
      return { tableId: t.id, score, reasons };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.tableId.localeCompare(b.tableId));
  return scored.slice(0, 2);
}

/** BR-018 · sugerencia no bloqueante en el paso Ocasión */
export function occasionSuggestion(
  selected: TableId | null,
  occasion: Occasion,
  date: string,
  slot: string,
  party: number,
  data: AvailabilityData,
  excludeId?: string,
): Table | null {
  const affinity = OCCASION_AFFINITY[occasion];
  if (!selected || !affinity.length) return null;
  const current = TABLES.find((t) => t.id === selected);
  if (!current || current.features.some((f) => affinity.includes(f))) return null;
  const candidates = freeCompatibleTables(date, slot, party, data, excludeId)
    .filter((t) => t.id !== selected)
    .map((t) => ({ t, n: t.features.filter((f) => affinity.includes(f)).length }))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n || a.t.id.localeCompare(b.t.id));
  return candidates[0]?.t ?? null;
}
