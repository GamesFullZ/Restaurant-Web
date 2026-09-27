import { describe, expect, it } from 'vitest';
import {
  alternatives,
  dayInfo,
  isCompatible,
  occasionSuggestion,
  recommendTables,
  tableStatuses,
} from '@/domain/availability';
import { dayMetrics } from '@/domain/metrics';
import { featuredDishes, publicMenu, neighbors } from '@/domain/menu';
import { adminActions, clientCanChange } from '@/domain/reservations';
import { formatPhone, isValidCode, normalizeCode, normalizePhone, validateName, validatePhone, validateDish } from '@/domain/validation';
import { operatingDay, seedState } from '@/data/seed';
import {
  cancelReservation,
  createReservation,
  modifyReservation,
  blockTable,
  setDishAvailability,
  simulateConcurrentBooking,
  trashDish,
  restoreDish,
  createDish,
} from '@/store/actions';
import { addDays, isMonday, toISODate } from '@/lib/dates';

// Viernes 25 de septiembre de 2026, 11:00
const NOW = new Date(2026, 8, 25, 11, 0, 0);
const TODAY = toISODate(NOW);
const DO = (n: number) => operatingDay(TODAY, n);
const fresh = () => seedState(NOW);

describe('datos iniciales', () => {
  it('genera 14 reservas y 25 platillos', () => {
    const s = fresh();
    expect(s.reservations).toHaveLength(14);
    expect(s.dishes).toHaveLength(25);
    expect(Object.keys(s.blocks)).toHaveLength(0);
  });
  it('DO0 es hoy si es día operativo y nunca cae en lunes', () => {
    expect(DO(0)).toBe(TODAY);
    for (let i = -1; i < 10; i++) expect(isMonday(DO(i))).toBe(false);
  });
  it('menú en orden fijo (T-012)', () => {
    const m = publicMenu(fresh().dishes);
    expect(m.map((c) => c.dishes.length)).toEqual([4, 4, 7, 4, 6]);
    expect(m[2].dishes[0].name).toBe('Mole de Pollo');
  });
});

describe('compatibilidad y estados de mesa', () => {
  it('BR-010 (T-025)', () => {
    expect([2, 4, 6].filter((c) => isCompatible(c, 1))).toEqual([2, 4]);
    expect([2, 4, 6].filter((c) => isCompatible(c, 3))).toEqual([4, 6]);
    expect([2, 4, 6].filter((c) => isCompatible(c, 5))).toEqual([6]);
  });
  it('T-024 · DO0 14:00 para 2', () => {
    const st = Object.fromEntries(tableStatuses({ date: DO(0), slot: '14:00', party: 2 }, fresh()).map((s) => [s.table.id, s.state]));
    expect(st.M01).toBe('Ocupada');
    expect(st.M07).toBe('Ocupada');
    expect(st.M09).toBe('No disponible');
    expect(st.M10).toBe('No disponible');
    for (const id of ['M02', 'M03', 'M04', 'M05', 'M06', 'M08']) expect(st[id]).toBe('Disponible');
  });
  it('T-036 · solapamiento de 90 min', () => {
    const s = fresh();
    const at = (slot: string) => tableStatuses({ date: DO(3), slot, party: 4 }, s).find((x) => x.table.id === 'M05')!.state;
    expect(at('18:00')).toBe('Ocupada');
    expect(at('20:00')).toBe('Ocupada');
    expect(at('20:30')).toBe('Disponible');
  });
  it('bloqueo tiene prioridad', () => {
    const s = blockTable(fresh(), 'M06', 'Mantenimiento', 'Silla dañada', NOW);
    const st = tableStatuses({ date: DO(2), slot: '20:00', party: 2 }, s).find((x) => x.table.id === 'M06')!;
    expect(st.state).toBe('Mantenimiento');
  });
});

describe('fechas y alternativas', () => {
  it('lunes cerrado, anticipación, sin disponibilidad', () => {
    const s = fresh();
    const monday = [1, 2, 3, 4, 5, 6, 7].map((i) => addDays(TODAY, i)).find(isMonday)!;
    expect(dayInfo(monday, '14:00', 2, NOW, s).state).toBe('cerrado');
    expect(dayInfo(TODAY, '14:00', 2, NOW, s).state).not.toBe('pasado');
    const at1310 = new Date(2026, 8, 25, 13, 10);
    expect(dayInfo(TODAY, '14:00', 2, at1310, s).state).toBe('pasado');
    expect(dayInfo(TODAY, '14:30', 2, at1310, s).state).not.toBe('pasado');
    expect(dayInfo(DO(4), '20:00', 6, NOW, s).state).toBe('sin');
  });
  it('T-033 · alternativas del escenario sin disponibilidad', () => {
    const alt = alternatives(DO(4), '20:00', 6, NOW, fresh());
    expect(alt.slots).toEqual(['21:00', '18:30', '18:00']);
    expect(alt.dates).toHaveLength(3);
  });
  it('T-034 · lunes ofrece domingo y martes', () => {
    const monday = [1, 2, 3, 4, 5, 6, 7].map((i) => addDays(TODAY, i)).find(isMonday)!;
    const alt = alternatives(monday, '20:00', 2, NOW, fresh());
    expect(alt.dates.slice(0, 2)).toEqual([addDays(monday, -1), addDays(monday, 1)]);
  });
});

describe('recomendación', () => {
  it('T-026', () => {
    const s = fresh();
    const date = addDays(TODAY, 20);
    const d = isMonday(date) ? addDays(date, 1) : date;
    const st = tableStatuses({ date: d, slot: '20:00', party: 2 }, s);
    expect(recommendTables(st, 2, []).map((r) => r.tableId)).toEqual(['M01', 'M02']);
    expect(recommendTables(st, 2, ['Terraza']).map((r) => r.tableId)).toEqual(['M04', 'M07']);
  });
  it('T-027 · sugerencia por ocasión', () => {
    const s = fresh();
    const d = operatingDay(TODAY, 10);
    expect(occasionSuggestion('M02', 'Aniversario', d, '20:30', 2, s)?.id).toBe('M01');
    expect(occasionSuggestion('M01', 'Aniversario', d, '20:30', 2, s)).toBeNull();
  });
});

describe('validación', () => {
  it('T-028', () => {
    expect(validatePhone('81-1234-567')).not.toBeNull();
    expect(validatePhone('0112345678')).not.toBeNull();
    expect(validatePhone('+52 (81) 1234 5678')).toBeNull();
    expect(normalizePhone('+52 (81) 1234 5678')).toBe('8112345678');
    expect(formatPhone('8112345678')).toBe('81 1234 5678');
    expect(validateName('A')).not.toBeNull();
    expect(validateName('Ana Martínez')).toBeNull();
  });
  it('códigos', () => {
    expect(normalizeCode('mesa-4f7k')).toBe('MESA-4F7K');
    expect(normalizeCode('4F7K')).toBe('MESA-4F7K');
    expect(isValidCode('MESA-4F7K')).toBe(true);
    expect(isValidCode('MESA-ABC')).toBe(false);
    expect(isValidCode('MESA-0OIL')).toBe(false);
  });
  it('platillo duplicado', () => {
    const e = validateDish({ name: 'taco de short rib', price: 100, description: 'Una descripción válida.', categoryId: 'antojitos', imageId: '', imageAlt: '' }, ['Taco de Short Rib']);
    expect(e.name).toMatch(/Ya existe/);
  });
});

describe('reservas', () => {
  const input = (over = {}) => ({
    date: DO(2),
    slot: '20:00',
    party: 2,
    tableId: 'M01' as const,
    occasion: 'Ninguna' as const,
    name: 'Ana Martínez',
    phone: '81 9999 0000',
    ...over,
  });
  it('T-030 · crea Pendiente con código', () => {
    const { state, result } = createReservation(fresh(), input(), NOW);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe('Pendiente');
    expect(isValidCode(result.value.code)).toBe(true);
    expect(state.reservations).toHaveLength(15);
  });
  it('T-031/T-032 · conflicto', () => {
    const s = simulateConcurrentBooking(fresh(), input(), NOW);
    const { result } = createReservation(s, input(), NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('conflict');
  });
  it('conflicto sin mesas restantes', () => {
    const s0 = fresh();
    const i = input({ date: DO(4), slot: '21:00', party: 6, tableId: 'M10' });
    const s = simulateConcurrentBooking(s0, i, NOW);
    const { result } = createReservation(s, i, NOW);
    expect(!result.ok && result.error).toBe('no-tables');
  });
  it('T-037 · duplicado por teléfono', () => {
    const { result } = createReservation(fresh(), input({ slot: '19:00', phone: '8112345678', tableId: 'M02' }), NOW);
    expect(!result.ok && result.error).toBe('duplicate');
  });
  it('T-042 · modificar mantiene código y cambia a Modificada', () => {
    const s = fresh();
    const r = s.reservations.find((x) => x.code === 'MESA-4F7K')!;
    const { result, state } = modifyReservation(s, r.id, { slot: '21:00' }, 'Cliente', NOW);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.code).toBe('MESA-4F7K');
    expect(result.value.status).toBe('Modificada');
    const st = (slot: string) => tableStatuses({ date: DO(2), slot, party: 2 }, state).find((x) => x.table.id === 'M06')!.state;
    expect(st('19:00')).toBe('Disponible');
    expect(st('21:00')).toBe('Ocupada');
  });
  it('T-044 · cancelar libera la mesa', () => {
    const s = fresh();
    const r = s.reservations.find((x) => x.code === 'MESA-9QX2')!;
    const { state } = cancelReservation(s, r.id, 'Cliente', NOW);
    const st = tableStatuses({ date: DO(3), slot: '19:00', party: 4 }, state).find((x) => x.table.id === 'M05')!;
    expect(st.state).toBe('Disponible');
  });
  it('T-041 · plazo de 2 horas', () => {
    const r = fresh().reservations.find((x) => x.code === 'MESA-H3N8')!; // hoy 13:30
    expect(clientCanChange(r, NOW).ok).toBe(true);
    expect(clientCanChange(r, new Date(2026, 8, 25, 12, 0)).ok).toBe(false);
  });
  it('T-056 · completar solo tras el inicio', () => {
    const r = fresh().reservations.find((x) => x.code === 'MESA-H3N8')!;
    expect(adminActions(r, NOW).complete).toBe(false);
    expect(adminActions(r, new Date(2026, 8, 25, 13, 35)).complete).toBe(true);
  });
});

describe('dashboard', () => {
  it('T-052 · indicadores de DO0', () => {
    const m = dayMetrics(DO(0), '14:00', NOW, fresh());
    expect(m.reservations).toBe(7);
    expect(m.people).toBe(26);
    expect(m.pending).toBe(2);
    expect(m.completed).toBe(0);
    expect(m.cancelled).toBe(0);
    expect(m.occupancy).toBe(25);
    expect(m.occupied).toBe(3);
    expect(m.available).toBe(7);
    expect(m.next?.code).toBe('MESA-H3N8');
  });
});

describe('menú', () => {
  it('destacados y sustitución (T-007)', () => {
    let s = fresh();
    expect(featuredDishes(s.dishes).map((d) => d.slug)).toEqual(['taco-de-short-rib', 'costilla-de-res', 'pato-en-adobo', 'tostada-de-atun']);
    const pato = s.dishes.find((d) => d.slug === 'pato-en-adobo')!;
    s = setDishAvailability(s, pato.id, 'Oculto', NOW);
    expect(featuredDishes(s.dishes).map((d) => d.slug)).toContain('sopes-de-birria');
  });
  it('papelera y restaurar al final de su categoría (T-061)', () => {
    let s = fresh();
    const b = s.dishes.find((d) => d.slug === 'bunuelo-de-canela')!;
    const first = s.dishes.find((d) => d.slug === 'pastel-de-elote')!;
    s = trashDish(s, first.id, NOW);
    expect(publicMenu(s.dishes)[3].dishes.map((d) => d.slug)).not.toContain('pastel-de-elote');
    s = restoreDish(s, first.id, NOW);
    const postres = publicMenu(s.dishes)[3].dishes.map((d) => d.slug);
    expect(postres[postres.length - 1]).toBe('pastel-de-elote');
    expect(postres).toContain(b.slug);
  });
  it('nuevo platillo al final (T-059)', () => {
    const { state } = createDish(fresh(), { name: 'Tamal de Elote', price: 95, description: 'Tamal suave de elote.', categoryId: 'antojitos', tags: ['Vegetariano'], imageId: '', imageAlt: '', availability: 'Disponible' }, NOW);
    const ant = publicMenu(state.dishes)[1].dishes;
    expect(ant[ant.length - 1].name).toBe('Tamal de Elote');
  });
  it('siguiente cruza categorías (T-017)', () => {
    const s = fresh();
    const coliflor = s.dishes.find((d) => d.slug === 'coliflor-rostizada')!;
    expect(neighbors(s.dishes, coliflor.id).next?.slug).toBe('taco-de-short-rib');
  });
});
