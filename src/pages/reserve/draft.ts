// Borrador del flujo de reserva y validez por paso (FR-025 – FR-039).
import { dayInfo, isCompatible, tableStatus, type AvailabilityData } from '@/domain/availability';
import { MAX_PARTY, TABLE_BY_ID } from '@/domain/constants';
import type { Feature, Occasion, Reservation, TableId } from '@/domain/types';
import { cleanSpaces, formatPhone, maxLen, validateName, validatePhone } from '@/domain/validation';

export interface Draft {
  step: number;
  maxStep: number;
  party: number | null;
  slot: string | null;
  date: string | null;
  tableId: TableId | null;
  prefs: Feature[];
  occasion: Occasion;
  occasionOther: string;
  occasionNotes: string;
  name: string;
  phone: string;
  comment: string;
  suggestionSeen?: string;
}

export const STEPS = [
  { n: 1, key: 'personas', label: 'Personas', title: '¿Cuántas personas vienen?' },
  { n: 2, key: 'horario', label: 'Horario', title: '¿A qué hora?' },
  { n: 3, key: 'fecha', label: 'Fecha', title: '¿Qué día?' },
  { n: 4, key: 'mesa', label: 'Mesa', title: 'Elige tu mesa' },
  { n: 5, key: 'ocasion', label: 'Ocasión', title: '¿Celebran algo?' },
  { n: 6, key: 'datos', label: 'Tus datos', title: '¿A nombre de quién?' },
  { n: 7, key: 'resumen', label: 'Resumen', title: 'Revisa tu reserva' },
] as const;

export function emptyDraft(): Draft {
  return {
    step: 1,
    maxStep: 1,
    party: null,
    slot: null,
    date: null,
    tableId: null,
    prefs: [],
    occasion: 'Ninguna',
    occasionOther: '',
    occasionNotes: '',
    name: '',
    phone: '',
    comment: '',
  };
}

export function draftFromReservation(r: Reservation): Draft {
  return {
    step: 1,
    maxStep: 7,
    party: r.party,
    slot: r.slot,
    date: r.date,
    tableId: r.tableId,
    prefs: [],
    occasion: r.occasion,
    occasionOther: r.occasionOther ?? '',
    occasionNotes: r.occasionNotes ?? '',
    name: r.name,
    phone: formatPhone(r.phone),
    comment: r.comment ?? '',
  };
}

export interface Ctx {
  now: Date;
  data: AvailabilityData;
  excludeId?: string;
}

export function dataErrors(d: Draft): Record<string, string> {
  const e: Record<string, string> = {};
  const n = validateName(d.name);
  if (n) e.name = n;
  const p = validatePhone(d.phone);
  if (p) e.phone = p;
  const c = maxLen(d.comment, 300);
  if (c) e.comment = c;
  return e;
}

export function occasionErrors(d: Draft): Record<string, string> {
  const e: Record<string, string> = {};
  if (d.occasion === 'Otra') {
    const v = cleanSpaces(d.occasionOther);
    if (v.length < 2) e.occasionOther = 'Cuéntanos qué celebran.';
    else if (v.length > 40) e.occasionOther = 'Máximo 40 caracteres.';
  }
  const m = maxLen(d.occasionNotes, 200);
  if (m && d.occasion !== 'Ninguna') e.occasionNotes = m;
  return e;
}

export function stepValid(step: number, d: Draft, ctx: Ctx): boolean {
  switch (step) {
    case 1:
      return !!d.party && d.party >= 1 && d.party <= MAX_PARTY;
    case 2:
      return !!d.slot;
    case 3: {
      if (!d.date || !d.slot || !d.party) return false;
      const s = dayInfo(d.date, d.slot, d.party, ctx.now, ctx.data, ctx.excludeId).state;
      return s === 'disponible' || s === 'pocas';
    }
    case 4: {
      if (!d.tableId || !d.date || !d.slot || !d.party) return false;
      const st = tableStatus(TABLE_BY_ID[d.tableId], { date: d.date, slot: d.slot, party: d.party, excludeId: ctx.excludeId }, ctx.data);
      return st.state === 'Disponible';
    }
    case 5:
      return Object.keys(occasionErrors(d)).length === 0;
    case 6:
      return Object.keys(dataErrors(d)).length === 0;
    case 7:
      return [1, 2, 3, 4, 5, 6].every((s) => stepValid(s, d, ctx));
    default:
      return false;
  }
}

export function firstInvalid(d: Draft, ctx: Ctx): number {
  for (let s = 1; s <= 6; s++) if (!stepValid(s, d, ctx)) return s;
  return 7;
}

/** Limpia la mesa si deja de ser compatible o disponible (FR-039, E-32). */
export function reconcileTable(d: Draft, ctx: Ctx): { draft: Draft; notice: string | null } {
  if (!d.tableId || !d.party) return { draft: d, notice: null };
  const t = TABLE_BY_ID[d.tableId];
  if (!isCompatible(t.capacity, d.party)) {
    return { draft: { ...d, tableId: null }, notice: `Tu mesa ya no coincide con ${d.party} ${d.party === 1 ? 'persona' : 'personas'}. Elige otra.` };
  }
  if (d.date && d.slot) {
    const st = tableStatus(t, { date: d.date, slot: d.slot, party: d.party, excludeId: ctx.excludeId }, ctx.data);
    if (st.state !== 'Disponible') return { draft: { ...d, tableId: null }, notice: 'Tu mesa ya no está disponible en este horario. Elige otra.' };
  }
  return { draft: d, notice: null };
}
