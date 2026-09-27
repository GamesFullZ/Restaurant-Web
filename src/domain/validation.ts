// Validaciones y formatos. BR-025, BR-026, BR-027, BR-031, BR-042.

export const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_RE = new RegExp(`^MESA-[${CODE_ALPHABET}]{4}$`);

export function cleanSpaces(s: string): string {
  return s.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

export function validateName(raw: string): string | null {
  const v = cleanSpaces(raw);
  if (v.length < 2) return 'Escribe tu nombre (mínimo 2 letras).';
  if (v.length > 60) return 'Máximo 60 caracteres.';
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(v)) return 'Usa solo letras, espacios, apóstrofo o guion.';
  if ((v.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/g) ?? []).length < 2) return 'Escribe tu nombre (mínimo 2 letras).';
  return null;
}

/** Quita espacios, guiones, paréntesis y prefijo +52 / 52. */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+52')) digits = digits.slice(3);
  digits = digits.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('52')) digits = digits.slice(2);
  return digits;
}

export function validatePhone(raw: string): string | null {
  const d = normalizePhone(raw);
  if (!/^[2-9]\d{9}$/.test(d)) return 'Escribe un teléfono de 10 dígitos, por ejemplo 81 1234 5678.';
  return null;
}

export function formatPhone(d: string): string {
  if (d.length !== 10) return d;
  return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}`;
}

export function maskPhone(d: string): string {
  if (d.length !== 10) return d;
  return `${d.slice(0, 2)} •••• ${d.slice(6)}`;
}

export function maxLen(value: string | undefined, max: number): string | null {
  return (value ?? '').length > max ? `Máximo ${max} caracteres.` : null;
}

/** Acepta “mesa-4f7k”, “4F7K”, “MESA 4F7K”. */
export function normalizeCode(raw: string): string {
  const v = raw.toUpperCase().replace(/\s+/g, '').replace(/^MESA-?/, '');
  return `MESA-${v}`;
}

export function isValidCode(code: string): boolean {
  return CODE_RE.test(code);
}

export function generateCode(existing: Set<string>, rand: () => number = Math.random): string {
  for (let i = 0; i < 10_000; i++) {
    let s = '';
    for (let j = 0; j < 4; j++) s += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)];
    const code = `MESA-${s}`;
    if (!existing.has(code)) return code;
  }
  throw new Error('No fue posible generar un código único');
}

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function comparableName(name: string): string {
  return slugify(cleanSpaces(name));
}

export function formatPrice(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

export interface DishInput {
  name: string;
  price: string | number;
  description: string;
  categoryId: string;
  imageId: string;
  imageAlt: string;
}

export function validateDish(input: DishInput, otherNames: string[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = cleanSpaces(input.name);
  if (name.length < 2 || name.length > 60) errors.name = 'El nombre debe tener entre 2 y 60 caracteres.';
  else if (otherNames.map(comparableName).includes(comparableName(name)))
    errors.name = `Ya existe un platillo llamado “${otherNames.find((n) => comparableName(n) === comparableName(name))}”.`;
  const price = Number(input.price);
  if (!Number.isInteger(price) || price < 1 || price > 9999) errors.price = 'El precio debe ser un número entre 1 y 9 999.';
  const desc = cleanSpaces(input.description);
  if (desc.length < 10 || desc.length > 160) errors.description = 'La descripción debe tener entre 10 y 160 caracteres.';
  if (!input.categoryId) errors.categoryId = 'Elige una categoría.';
  if (input.imageId) {
    const alt = cleanSpaces(input.imageAlt);
    if (alt.length < 5 || alt.length > 120) errors.imageAlt = 'El texto alternativo debe tener entre 5 y 120 caracteres.';
  }
  return errors;
}
