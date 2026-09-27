// Indicadores del dashboard. docs/18-admin-specification.md §3.2
import { SLOT_VALUES, TABLES } from './constants';
import { isActive, occupiesTable, slotsOverlap, tableStatus, type AvailabilityData } from './availability';
import type { Reservation } from './types';
import { dateTime, slotToMin, toISODate } from '@/lib/dates';

export interface DayMetrics {
  reservations: number;
  people: number;
  occupied: number;
  available: number;
  pending: number;
  completed: number;
  cancelled: number;
  occupancy: number;
  next?: Reservation;
}

export function defaultSlot(date: string, now: Date, reservations: Reservation[]): string {
  if (date === toISODate(now)) {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const past = SLOT_VALUES.filter((s) => slotToMin(s) <= nowMin);
    const current = past[past.length - 1];
    if (current && nowMin - slotToMin(current) < 90) return current;
    return SLOT_VALUES.find((s) => slotToMin(s) > nowMin) ?? SLOT_VALUES[SLOT_VALUES.length - 1];
  }
  const first = reservations.filter((r) => r.date === date && occupiesTable(r)).sort((a, b) => a.slot.localeCompare(b.slot))[0];
  return first?.slot ?? SLOT_VALUES[0];
}

export function dayMetrics(date: string, slot: string, now: Date, data: AvailabilityData): DayMetrics {
  const dayRes = data.reservations.filter((r) => r.date === date);
  const nonCancelled = dayRes.filter((r) => r.status !== 'Cancelada');
  const statuses = TABLES.map((t) => tableStatus(t, { date, slot }, data));
  const occupied = statuses.filter((s) => s.state === 'Ocupada').length;
  const operational = TABLES.filter((t) => !data.blocks[t.id]);
  const available = statuses.filter((s) => s.state === 'Disponible').length;

  let pairs = 0;
  for (const t of operational) {
    for (const s of SLOT_VALUES) {
      if (nonCancelled.some((r) => r.tableId === t.id && slotsOverlap(r.slot, s))) pairs++;
    }
  }
  const denom = operational.length * SLOT_VALUES.length;
  const occupancy = denom ? Math.round((pairs / denom) * 100) : 0;

  const sorted = dayRes.filter(isActive).sort((a, b) => a.slot.localeCompare(b.slot));
  const next =
    date === toISODate(now) ? sorted.find((r) => dateTime(r.date, r.slot).getTime() >= now.getTime()) : sorted[0];

  return {
    reservations: nonCancelled.length,
    people: nonCancelled.reduce((n, r) => n + r.party, 0),
    occupied,
    available,
    pending: dayRes.filter((r) => r.status === 'Pendiente').length,
    completed: dayRes.filter((r) => r.status === 'Completada').length,
    cancelled: dayRes.filter((r) => r.status === 'Cancelada').length,
    occupancy,
    next,
  };
}
