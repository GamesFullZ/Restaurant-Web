// Tipos del dominio de Mesa. Fuente: docs/10-data-specification.md

export type TableId = 'M01' | 'M02' | 'M03' | 'M04' | 'M05' | 'M06' | 'M07' | 'M08' | 'M09' | 'M10';
export type Zone = 'Ventanal' | 'Interior' | 'Barra' | 'Terraza';
export type Feature =
  | 'Cerca de ventana'
  | 'Terraza'
  | 'Tranquila'
  | 'Zona social'
  | 'Más privada'
  | 'Cerca de barra'
  | 'Interior'
  | 'Accesible'
  | 'Ideal para grupos';

export interface TablePlan {
  /** Centro en el viewBox del plano (1000 × 620). */
  x: number;
  y: number;
  w: number;
  h: number;
  shape: 'round' | 'square' | 'rect';
}

export interface Table {
  id: TableId;
  name: string;
  capacity: 2 | 4 | 6;
  zone: Zone;
  features: Feature[];
  description: string;
  plan: TablePlan;
}

export type BlockType = 'Mantenimiento' | 'No disponible';

export interface TableBlock {
  type: BlockType;
  note: string;
  createdAt: string;
}

export type ReservationStatus = 'Pendiente' | 'Confirmada' | 'Modificada' | 'Cancelada' | 'Completada';
export type Occasion = 'Ninguna' | 'Cumpleaños' | 'Aniversario' | 'Sorpresa' | 'Otra';
export type Actor = 'Cliente' | 'Admin' | 'Sistema';
export type HistoryAction = 'Creada' | 'Confirmada' | 'Modificada' | 'Cancelada' | 'Completada';

export interface FieldChange {
  field: string;
  before: string;
  after: string;
}

export interface HistoryEvent {
  at: string;
  actor: Actor;
  action: HistoryAction;
  changes?: FieldChange[];
}

export type ReservationOrigin = 'Cliente' | 'Datos iniciales' | 'Demo';

export interface Reservation {
  id: string;
  code: string;
  /** Fecha local AAAA-MM-DD */
  date: string;
  /** Horario HH:MM (uno de los 11) */
  slot: string;
  party: number;
  tableId: TableId;
  occasion: Occasion;
  occasionOther?: string;
  occasionNotes?: string;
  name: string;
  /** Teléfono normalizado, 10 dígitos */
  phone: string;
  comment?: string;
  status: ReservationStatus;
  origin: ReservationOrigin;
  createdAt: string;
  updatedAt: string;
  history: HistoryEvent[];
}

export type CategoryId = 'entradas' | 'antojitos' | 'platos-fuertes' | 'postres' | 'bebidas';

export type Tag =
  | 'Vegetariano'
  | 'Picante'
  | 'Vegano'
  | 'Sin gluten'
  | 'Recomendado'
  | 'Nuevo'
  | 'Favorito de la casa';

export type DishAvailability = 'Disponible' | 'Agotado temporalmente' | 'Oculto';

export interface Dish {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  categoryId: CategoryId;
  position: number;
  tags: Tag[];
  /** 'lib:<slug>' imagen inicial · 'up:<id>' imagen subida · '' sin imagen */
  imageId: string;
  imageAlt: string;
  availability: DishAvailability;
  /** Estado previo a ocultar (para “Mostrar”). */
  prevAvailability?: Exclude<DishAvailability, 'Oculto'>;
  deletedAt?: string | null;
  updatedAt: string;
}

export interface UploadedImage {
  id: string;
  name: string;
  alt: string;
  createdAt: string;
}

export type ReviewTag =
  | 'Cena en pareja'
  | 'Aniversario'
  | 'Cumpleaños'
  | 'Con amigos'
  | 'En familia'
  | 'Comida de negocios'
  | 'Sorpresa';

export interface Review {
  id: string;
  name: string;
  initials: string;
  stars: number;
  daysAgo: number;
  tag: ReviewTag;
  comment: string;
}

export interface DBState {
  version: number;
  meta: {
    seededAt: string;
    simulateConflict: boolean;
  };
  reservations: Reservation[];
  blocks: Partial<Record<TableId, TableBlock>>;
  dishes: Dish[];
  images: UploadedImage[];
}
