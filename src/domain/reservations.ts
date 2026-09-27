// Estados y permisos de reserva. BR-028 – BR-039.
import { CLIENT_CHANGE_MIN, TABLE_BY_ID } from './constants';
import type { FieldChange, Reservation, ReservationStatus } from './types';
import { dateTime, endSlot, formatLong } from '@/lib/dates';
import { formatPhone } from './validation';
import { isActive } from './availability';

export const STATUS_INFO: Record<ReservationStatus, { client: string; tone: string }> = {
  Pendiente: { client: 'Tu mesa está apartada; el restaurante la confirmará en breve.', tone: 'pending' },
  Confirmada: { client: 'Todo listo. Te esperamos.', tone: 'confirmed' },
  Modificada: { client: 'Guardamos tus cambios. Tu mesa está apartada.', tone: 'modified' },
  Cancelada: { client: 'Esta reserva fue cancelada.', tone: 'cancelled' },
  Completada: { client: 'Gracias por visitarnos.', tone: 'completed' },
};

export function isFinal(r: Reservation): boolean {
  return r.status === 'Cancelada' || r.status === 'Completada';
}

/** BR-032 */
export function clientCanChange(r: Reservation, now: Date): { ok: boolean; reason?: string } {
  if (isFinal(r)) return { ok: false, reason: r.status === 'Cancelada' ? 'Esta reserva fue cancelada.' : 'Esta reserva ya se completó.' };
  const start = dateTime(r.date, r.slot).getTime();
  if (start - now.getTime() < CLIENT_CHANGE_MIN * 60_000) {
    return { ok: false, reason: 'Faltan menos de 2 horas para tu reserva. Para cambios, llámanos al 81 5550 1947.' };
  }
  return { ok: true };
}

/** BR-037 */
export function adminActions(r: Reservation, now: Date) {
  const started = dateTime(r.date, r.slot).getTime() <= now.getTime();
  return {
    confirm: r.status === 'Pendiente' || r.status === 'Modificada',
    modify: isActive(r),
    cancel: isActive(r),
    complete: isActive(r) && started,
    completeReason: isActive(r) && !started ? `Podrás completarla a partir de las ${r.slot} del ${formatLong(r.date)}.` : undefined,
  };
}

export function isPendingClose(r: Reservation, now: Date): boolean {
  if (!isActive(r)) return false;
  const end = dateTime(r.date, endSlot(r.slot)).getTime();
  return end < now.getTime();
}

export function occasionLabel(r: Pick<Reservation, 'occasion' | 'occasionOther'>): string {
  if (r.occasion === 'Otra' && r.occasionOther) return `Otra: ${r.occasionOther}`;
  return r.occasion;
}

const FIELD_LABELS: Record<string, string> = {
  date: 'Fecha',
  slot: 'Horario',
  party: 'Personas',
  tableId: 'Mesa',
  occasion: 'Ocasión',
  occasionOther: 'Qué celebran',
  occasionNotes: 'Instrucciones',
  name: 'Nombre',
  phone: 'Teléfono',
  comment: 'Comentario',
};

function display(field: string, v: unknown): string {
  if (v === undefined || v === null || v === '') return '—';
  if (field === 'date') return formatLong(String(v));
  if (field === 'phone') return formatPhone(String(v));
  if (field === 'tableId') return TABLE_BY_ID[String(v)]?.name ?? String(v);
  if (field === 'party') return `${v} ${Number(v) === 1 ? 'persona' : 'personas'}`;
  return String(v);
}

export function diffReservation(before: Reservation, after: Partial<Reservation>): FieldChange[] {
  const changes: FieldChange[] = [];
  for (const key of Object.keys(FIELD_LABELS)) {
    if (!(key in after)) continue;
    const a = (before as unknown as Record<string, unknown>)[key] ?? '';
    const b = (after as unknown as Record<string, unknown>)[key] ?? '';
    if (String(a) !== String(b)) changes.push({ field: FIELD_LABELS[key], before: display(key, a), after: display(key, b) });
  }
  return changes;
}

export function partyLabel(n: number): string {
  return `${n} ${n === 1 ? 'persona' : 'personas'}`;
}
