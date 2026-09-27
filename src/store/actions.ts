// Acciones puras sobre DBState. Cada una recibe el estado más reciente y devuelve el nuevo.
import { dateSlotValidity, isActive, lastBookableDate, slotsOverlap, tableStatus } from '@/domain/availability';
import { isMonday } from '@/lib/dates';
import { TABLE_BY_ID } from '@/domain/constants';
import { nextPosition } from '@/domain/menu';
import { diffReservation, isFinal } from '@/domain/reservations';
import type {
  Actor,
  BlockType,
  CategoryId,
  DBState,
  Dish,
  DishAvailability,
  Occasion,
  Reservation,
  TableId,
  Tag,
  UploadedImage,
} from '@/domain/types';
import { cleanSpaces, generateCode, normalizePhone, slugify } from '@/domain/validation';

export type Fail = { ok: false; error: 'conflict' | 'no-tables' | 'duplicate' | 'invalid-date' | 'not-found' | 'invalid-state'; duplicateCode?: string; validity?: string };
export type Ok<T> = { ok: true; value: T };
export type Result<T> = Ok<T> | Fail;

export interface ReservationInput {
  date: string;
  slot: string;
  party: number;
  tableId: TableId;
  occasion: Occasion;
  occasionOther?: string;
  occasionNotes?: string;
  name: string;
  phone: string;
  comment?: string;
}

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

function sanitize(input: ReservationInput): ReservationInput {
  const occ = input.occasion;
  return {
    ...input,
    name: cleanSpaces(input.name),
    phone: normalizePhone(input.phone),
    comment: input.comment?.trim() || undefined,
    occasionOther: occ === 'Otra' ? cleanSpaces(input.occasionOther ?? '') || undefined : undefined,
    occasionNotes: occ !== 'Ninguna' ? input.occasionNotes?.trim() || undefined : undefined,
  };
}

/** BR-030 · mismo teléfono con reserva activa solapada */
export function findDuplicate(state: DBState, input: Pick<ReservationInput, 'phone' | 'date' | 'slot'>, excludeId?: string): Reservation | undefined {
  const phone = normalizePhone(input.phone);
  return state.reservations.find(
    (r) => r.id !== excludeId && r.origin !== 'Demo' && r.phone === phone && r.date === input.date && isActive(r) && slotsOverlap(r.slot, input.slot),
  );
}

function checkTable(state: DBState, input: ReservationInput, now: Date, excludeId?: string, admin = false): Fail | null {
  if (admin) {
    // BR-037: el admin no tiene plazo ni anticipación mínima, pero no puede usar lunes ni salir de la ventana.
    if (isMonday(input.date)) return { ok: false, error: 'invalid-date', validity: 'cerrado' };
    if (input.date > lastBookableDate(now)) return { ok: false, error: 'invalid-date', validity: 'fuera' };
  } else {
    const v = dateSlotValidity(input.date, input.slot, now);
    if (v !== 'ok') return { ok: false, error: 'invalid-date', validity: v };
  }
  const table = TABLE_BY_ID[input.tableId];
  if (!table) return { ok: false, error: 'not-found' };
  const st = tableStatus(table, { date: input.date, slot: input.slot, party: input.party, excludeId }, state);
  if (st.state !== 'Disponible') {
    const anyFree = Object.values(TABLE_BY_ID).some(
      (t) => tableStatus(t, { date: input.date, slot: input.slot, party: input.party, excludeId }, state).state === 'Disponible',
    );
    return { ok: false, error: anyFree ? 'conflict' : 'no-tables' };
  }
  return null;
}

/** Simulación de reserva simultánea (FR-068): ocupa la mesa elegida con una reserva “Demo”. */
export function simulateConcurrentBooking(state: DBState, input: ReservationInput, now: Date): DBState {
  const existing = new Set(state.reservations.map((r) => r.code));
  const at = now.toISOString();
  const demo: Reservation = {
    id: uid('r'),
    code: generateCode(existing),
    date: input.date,
    slot: input.slot,
    party: Math.min(input.party, TABLE_BY_ID[input.tableId].capacity),
    tableId: input.tableId,
    occasion: 'Ninguna',
    name: 'Reserva simultánea (demo)',
    phone: '8100000000',
    status: 'Pendiente',
    origin: 'Demo',
    createdAt: at,
    updatedAt: at,
    history: [{ at, actor: 'Sistema', action: 'Creada' }],
  };
  return { ...state, meta: { ...state.meta, simulateConflict: false }, reservations: [...state.reservations, demo] };
}

export function createReservation(state: DBState, raw: ReservationInput, now: Date): { state: DBState; result: Result<Reservation> } {
  const input = sanitize(raw);
  const dup = findDuplicate(state, input);
  if (dup) return { state, result: { ok: false, error: 'duplicate', duplicateCode: dup.code } };
  const fail = checkTable(state, input, now);
  if (fail) return { state, result: fail };
  const at = now.toISOString();
  const res: Reservation = {
    id: uid('r'),
    code: generateCode(new Set(state.reservations.map((r) => r.code))),
    ...input,
    status: 'Pendiente',
    origin: 'Cliente',
    createdAt: at,
    updatedAt: at,
    history: [{ at, actor: 'Cliente', action: 'Creada' }],
  };
  return { state: { ...state, reservations: [...state.reservations, res] }, result: { ok: true, value: res } };
}

export function modifyReservation(
  state: DBState,
  id: string,
  patchRaw: Partial<ReservationInput>,
  actor: Actor,
  now: Date,
): { state: DBState; result: Result<Reservation> } {
  const current = state.reservations.find((r) => r.id === id);
  if (!current) return { state, result: { ok: false, error: 'not-found' } };
  if (isFinal(current)) return { state, result: { ok: false, error: 'invalid-state' } };
  const merged = sanitize({ ...current, ...patchRaw } as ReservationInput);
  const affectsAvailability =
    merged.date !== current.date || merged.slot !== current.slot || merged.party !== current.party || merged.tableId !== current.tableId;
  const dup = findDuplicate(state, merged, id);
  if (dup) return { state, result: { ok: false, error: 'duplicate', duplicateCode: dup.code } };
  if (affectsAvailability) {
    const fail = checkTable(state, merged, now, id, actor === 'Admin');
    if (fail) return { state, result: fail };
  }
  const changes = diffReservation(current, merged);
  if (!changes.length) return { state, result: { ok: true, value: current } };
  const at = now.toISOString();
  const updated: Reservation = {
    ...current,
    ...merged,
    status: 'Modificada',
    updatedAt: at,
    history: [...current.history, { at, actor, action: 'Modificada', changes }],
  };
  return {
    state: { ...state, reservations: state.reservations.map((r) => (r.id === id ? updated : r)) },
    result: { ok: true, value: updated },
  };
}

function setStatus(
  state: DBState,
  id: string,
  status: 'Confirmada' | 'Cancelada' | 'Completada',
  actor: Actor,
  now: Date,
): { state: DBState; result: Result<Reservation> } {
  const current = state.reservations.find((r) => r.id === id);
  if (!current) return { state, result: { ok: false, error: 'not-found' } };
  if (isFinal(current)) return { state, result: { ok: false, error: 'invalid-state' } };
  if (status === 'Confirmada' && current.status === 'Confirmada') return { state, result: { ok: false, error: 'invalid-state' } };
  const at = now.toISOString();
  const updated: Reservation = {
    ...current,
    status,
    updatedAt: at,
    history: [...current.history, { at, actor, action: status }],
  };
  return {
    state: { ...state, reservations: state.reservations.map((r) => (r.id === id ? updated : r)) },
    result: { ok: true, value: updated },
  };
}

export const confirmReservation = (s: DBState, id: string, now: Date) => setStatus(s, id, 'Confirmada', 'Admin', now);
export const cancelReservation = (s: DBState, id: string, actor: Actor, now: Date) => setStatus(s, id, 'Cancelada', actor, now);
export const completeReservation = (s: DBState, id: string, now: Date) => setStatus(s, id, 'Completada', 'Admin', now);

export function blockTable(state: DBState, id: TableId, type: BlockType, note: string, now: Date): DBState {
  return { ...state, blocks: { ...state.blocks, [id]: { type, note: note.trim().slice(0, 140), createdAt: now.toISOString() } } };
}

export function unblockTable(state: DBState, id: TableId): DBState {
  const blocks = { ...state.blocks };
  delete blocks[id];
  return { ...state, blocks };
}

export interface DishFormInput {
  name: string;
  price: number;
  description: string;
  categoryId: CategoryId;
  tags: Tag[];
  imageId: string;
  imageAlt: string;
  availability: DishAvailability;
}

export function createDish(state: DBState, input: DishFormInput, now: Date): { state: DBState; dish: Dish } {
  const at = now.toISOString();
  const dish: Dish = {
    id: uid('d'),
    slug: slugify(input.name),
    name: cleanSpaces(input.name),
    description: cleanSpaces(input.description),
    price: input.price,
    categoryId: input.categoryId,
    position: nextPosition(state.dishes, input.categoryId),
    tags: input.tags,
    imageId: input.imageId,
    imageAlt: cleanSpaces(input.imageAlt),
    availability: input.availability,
    prevAvailability: input.availability === 'Oculto' ? 'Disponible' : undefined,
    deletedAt: null,
    updatedAt: at,
  };
  return { state: { ...state, dishes: [...state.dishes, dish] }, dish };
}

export function updateDish(state: DBState, id: string, input: DishFormInput, now: Date): DBState {
  return {
    ...state,
    dishes: state.dishes.map((d) => {
      if (d.id !== id) return d;
      const categoryChanged = d.categoryId !== input.categoryId;
      return {
        ...d,
        slug: slugify(input.name),
        name: cleanSpaces(input.name),
        description: cleanSpaces(input.description),
        price: input.price,
        categoryId: input.categoryId,
        position: categoryChanged ? nextPosition(state.dishes, input.categoryId) : d.position,
        tags: input.tags,
        imageId: input.imageId,
        imageAlt: cleanSpaces(input.imageAlt),
        availability: input.availability,
        prevAvailability:
          input.availability === 'Oculto' ? (d.availability === 'Oculto' ? d.prevAvailability : d.availability) : undefined,
        updatedAt: now.toISOString(),
      };
    }),
  };
}

export function setDishAvailability(state: DBState, id: string, availability: DishAvailability, now: Date): DBState {
  return {
    ...state,
    dishes: state.dishes.map((d) => {
      if (d.id !== id) return d;
      if (availability === 'Oculto') {
        return { ...d, availability, prevAvailability: d.availability === 'Oculto' ? d.prevAvailability : d.availability, updatedAt: now.toISOString() };
      }
      return { ...d, availability, prevAvailability: undefined, updatedAt: now.toISOString() };
    }),
  };
}

/** “Mostrar” → estado anterior */
export function showDish(state: DBState, id: string, now: Date): DBState {
  const d = state.dishes.find((x) => x.id === id);
  return setDishAvailability(state, id, d?.prevAvailability ?? 'Disponible', now);
}

export function trashDish(state: DBState, id: string, now: Date): DBState {
  return { ...state, dishes: state.dishes.map((d) => (d.id === id ? { ...d, deletedAt: now.toISOString() } : d)) };
}

export function restoreDish(state: DBState, id: string, now: Date): DBState {
  const d = state.dishes.find((x) => x.id === id);
  if (!d) return state;
  const position = nextPosition(state.dishes, d.categoryId);
  return {
    ...state,
    dishes: state.dishes.map((x) => (x.id === id ? { ...x, deletedAt: null, position, updatedAt: now.toISOString() } : x)),
  };
}

export function deleteDishForever(state: DBState, id: string): DBState {
  return { ...state, dishes: state.dishes.filter((d) => d.id !== id) };
}

export function addImage(state: DBState, img: UploadedImage): DBState {
  return { ...state, images: [...state.images, img] };
}
