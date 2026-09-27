// Utilidades de fecha en hora local (interpretada como America/Monterrey, SU-23).

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, n: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function diffDays(a: string, b: string): number {
  const ms = parseISODate(a).getTime() - parseISODate(b).getTime();
  return Math.round(ms / 86_400_000);
}

export function isMonday(iso: string): boolean {
  return parseISODate(iso).getDay() === 1;
}

export function isOperatingDay(iso: string): boolean {
  return !isMonday(iso);
}

export function slotToMin(slot: string): number {
  const [h, m] = slot.split(':').map(Number);
  return h * 60 + m;
}

export function minToSlot(min: number): string {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
}

export function dateTime(iso: string, slot: string): Date {
  const d = parseISODate(iso);
  const min = slotToMin(slot);
  d.setHours(Math.floor(min / 60), min % 60, 0, 0);
  return d;
}

export function endSlot(slot: string, duration = 90): string {
  return minToSlot(slotToMin(slot) + duration);
}

const longFmt = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
const shortFmt = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
const monthFmt = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' });

/** “domingo 27 de septiembre” */
export function formatLong(iso: string): string {
  return longFmt.format(parseISODate(iso));
}

/** “dom 27 sep” */
export function formatShort(iso: string): string {
  return shortFmt.format(parseISODate(iso)).replace(/\./g, '').replace(',', '');
}

/** “sáb 03/10/2026” */
export function formatAdmin(iso: string): string {
  const d = parseISODate(iso);
  const wd = new Intl.DateTimeFormat('es-MX', { weekday: 'short' }).format(d).replace('.', '');
  return `${wd} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatMonth(iso: string): string {
  const s = monthFmt.format(parseISODate(iso));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDateTimeShort(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function relativeFrom(isoDateTime: string, now: Date): string {
  const diff = now.getTime() - new Date(isoDateTime).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'hace 1 día' : `hace ${d} días`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
