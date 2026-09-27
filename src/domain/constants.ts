// Catálogos fijos. Fuente: docs/09-business-rules.md y docs/10-data-specification.md
import type { CategoryId, Feature, Occasion, ReviewTag, Table, Tag } from './types';

export const RESTAURANT = {
  name: 'Mesa',
  slogan: 'Un taco. Una mesa. Un lugar para disfrutar.',
  short: 'Cocina mexicana contemporánea en el corazón de Monterrey.',
  address: 'Calle Padre Mier 1047 Ote., Barrio Antiguo, Centro, 64000 Monterrey, N.L.',
  reference: 'A dos cuadras de la Macroplaza, frente a la plaza del Barrio Antiguo.',
  phone: '81 5550 1947',
  social: '@mesa.mty',
};

export const DURATION_MIN = 90;
export const WINDOW_DAYS = 60;
export const MIN_ADVANCE_MIN = 60;
export const CLIENT_CHANGE_MIN = 120;
export const MAX_PARTY = 6;
export const SCHEMA_VERSION = 1;

export type Turn = 'Comida' | 'Cena';
export const SLOTS: { slot: string; turn: Turn }[] = [
  { slot: '13:00', turn: 'Comida' },
  { slot: '13:30', turn: 'Comida' },
  { slot: '14:00', turn: 'Comida' },
  { slot: '14:30', turn: 'Comida' },
  { slot: '18:00', turn: 'Cena' },
  { slot: '18:30', turn: 'Cena' },
  { slot: '19:00', turn: 'Cena' },
  { slot: '19:30', turn: 'Cena' },
  { slot: '20:00', turn: 'Cena' },
  { slot: '20:30', turn: 'Cena' },
  { slot: '21:00', turn: 'Cena' },
];
export const SLOT_VALUES = SLOTS.map((s) => s.slot);

export const SERVICE = {
  Comida: { from: '13:00', to: '17:00' },
  Cena: { from: '18:00', to: '22:30' },
} as const;

export const FEATURES: Feature[] = [
  'Cerca de ventana',
  'Terraza',
  'Tranquila',
  'Zona social',
  'Más privada',
  'Cerca de barra',
  'Accesible',
  'Ideal para grupos',
];

export const TABLES: Table[] = [
  {
    id: 'M01',
    name: 'Mesa 01',
    capacity: 2,
    zone: 'Ventanal',
    features: ['Cerca de ventana', 'Tranquila'],
    description: 'Rincón junto al ventanal, ideal para conversar.',
    plan: { x: 120, y: 118, w: 70, h: 70, shape: 'round' },
  },
  {
    id: 'M02',
    name: 'Mesa 02',
    capacity: 2,
    zone: 'Barra',
    features: ['Zona social', 'Cerca de barra'],
    description: 'Frente a la barra, con vista a la coctelería.',
    plan: { x: 640, y: 440, w: 70, h: 70, shape: 'round' },
  },
  {
    id: 'M03',
    name: 'Mesa 03',
    capacity: 2,
    zone: 'Interior',
    features: ['Más privada', 'Interior'],
    description: 'Mesa resguardada al fondo del salón.',
    plan: { x: 110, y: 300, w: 70, h: 70, shape: 'round' },
  },
  {
    id: 'M04',
    name: 'Mesa 04',
    capacity: 2,
    zone: 'Terraza',
    features: ['Terraza', 'Cerca de ventana'],
    description: 'En el borde de la terraza, junto al ventanal.',
    plan: { x: 872, y: 118, w: 70, h: 70, shape: 'round' },
  },
  {
    id: 'M05',
    name: 'Mesa 05',
    capacity: 4,
    zone: 'Barra',
    features: ['Zona social', 'Interior'],
    description: 'En el centro del salón, cerca del ambiente.',
    plan: { x: 380, y: 300, w: 100, h: 100, shape: 'square' },
  },
  {
    id: 'M06',
    name: 'Mesa 06',
    capacity: 4,
    zone: 'Ventanal',
    features: ['Tranquila', 'Cerca de ventana'],
    description: 'Junto al ventanal, lejos del paso.',
    plan: { x: 400, y: 118, w: 100, h: 100, shape: 'square' },
  },
  {
    id: 'M07',
    name: 'Mesa 07',
    capacity: 4,
    zone: 'Terraza',
    features: ['Terraza', 'Accesible'],
    description: 'Acceso sin escalones y espacio para silla de ruedas.',
    plan: { x: 872, y: 305, w: 100, h: 100, shape: 'square' },
  },
  {
    id: 'M08',
    name: 'Mesa 08',
    capacity: 4,
    zone: 'Interior',
    features: ['Más privada', 'Interior'],
    description: 'Mesa semiprivada con biombo de celosía.',
    plan: { x: 128, y: 478, w: 100, h: 100, shape: 'square' },
  },
  {
    id: 'M09',
    name: 'Mesa 09',
    capacity: 6,
    zone: 'Barra',
    features: ['Ideal para grupos', 'Zona social'],
    description: 'Mesa larga para compartir cerca de la barra.',
    plan: { x: 610, y: 285, w: 200, h: 90, shape: 'rect' },
  },
  {
    id: 'M10',
    name: 'Mesa 10',
    capacity: 6,
    zone: 'Terraza',
    features: ['Más privada', 'Terraza'],
    description: 'Esquina reservada de la terraza.',
    plan: { x: 872, y: 500, w: 200, h: 90, shape: 'rect' },
  },
];

export const TABLE_BY_ID = Object.fromEntries(TABLES.map((t) => [t.id, t])) as Record<string, Table>;

export const CATEGORIES: { id: CategoryId; name: string; blurb: string }[] = [
  { id: 'entradas', name: 'Entradas', blurb: 'Para abrir la mesa.' },
  { id: 'antojitos', name: 'Antojitos', blurb: 'Maíz, comal y salsa.' },
  { id: 'platos-fuertes', name: 'Platos fuertes', blurb: 'Fuego lento, al centro.' },
  { id: 'postres', name: 'Postres', blurb: 'El final dulce.' },
  { id: 'bebidas', name: 'Bebidas y cervezas', blurb: 'Aguas, coctel y cerveza regional.' },
];
export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, (typeof CATEGORIES)[number]>;

export const TAGS: Tag[] = ['Vegetariano', 'Picante', 'Vegano', 'Sin gluten', 'Recomendado', 'Nuevo', 'Favorito de la casa'];
export const DIET_TAGS: Tag[] = ['Vegetariano', 'Vegano', 'Sin gluten', 'Picante'];

export const OCCASIONS: Occasion[] = ['Ninguna', 'Cumpleaños', 'Aniversario', 'Sorpresa', 'Otra'];

/** BR-017 · afinidad ocasión → características */
export const OCCASION_AFFINITY: Record<Occasion, Feature[]> = {
  Ninguna: [],
  Otra: [],
  Aniversario: ['Tranquila', 'Más privada', 'Cerca de ventana'],
  Cumpleaños: ['Zona social', 'Ideal para grupos', 'Terraza'],
  Sorpresa: ['Más privada', 'Tranquila'],
};

export const REVIEW_TAGS: ReviewTag[] = [
  'Cena en pareja',
  'Aniversario',
  'Cumpleaños',
  'Con amigos',
  'En familia',
  'Comida de negocios',
  'Sorpresa',
];

/** BR-047 · destacados fijos */
export const FEATURED_SLUGS = ['taco-de-short-rib', 'costilla-de-res', 'pato-en-adobo', 'tostada-de-atun'];
export const FEATURED_RULE: Record<string, Tag> = {
  'taco-de-short-rib': 'Favorito de la casa',
  'costilla-de-res': 'Favorito de la casa',
  'pato-en-adobo': 'Nuevo',
  'tostada-de-atun': 'Recomendado',
};

export const DEMO = {
  code: 'MESA-4F7K',
  phone: '81 1234 5678',
  adminUser: 'admin',
  adminPass: 'mesa-demo',
};
