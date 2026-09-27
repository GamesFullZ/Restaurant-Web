// Datos iniciales. docs/10-data-specification.md §7.5, §8.1, §9
import { SCHEMA_VERSION } from '@/domain/constants';
import type { CategoryId, DBState, Dish, Reservation, Review, Tag, TableId, ReservationStatus, Occasion } from '@/domain/types';
import { slugify } from '@/domain/validation';
import { addDays, isOperatingDay, toISODate } from '@/lib/dates';

type MenuRow = [CategoryId, string, number, string, Tag[], string];

const MENU: MenuRow[] = [
  ['entradas', 'Tostada de Atún', 185, 'Atún fresco, aguacate, chile serrano y cítricos.', ['Recomendado'], 'Tostada crujiente con cubos de atún fresco, aguacate y chile serrano, vista desde arriba.'],
  ['entradas', 'Queso Fundido al Mezcal', 165, 'Queso fundido, mezcal, chile poblano y tortillas.', ['Favorito de la casa'], 'Queso fundido en sartén de hierro con rajas de poblano y tortillas de maíz.'],
  ['entradas', 'Esquites Cremosos', 125, 'Maíz asado, crema de chile ancho, queso fresco y limón.', ['Vegetariano'], 'Tazón de esquites con crema de chile ancho, queso fresco y limón.'],
  ['entradas', 'Coliflor Rostizada', 145, 'Coliflor, mole ligero, semillas tostadas y hierbas.', ['Vegano', 'Sin gluten'], 'Coliflor rostizada sobre mole ligero con semillas tostadas.'],
  ['antojitos', 'Taco de Short Rib', 195, 'Short rib, cebolla encurtida y salsa de chile morita.', ['Favorito de la casa'], 'Taco de short rib con cebolla encurtida y salsa de chile morita.'],
  ['antojitos', 'Taco de Camarón', 175, 'Camarón, crema de aguacate, col y cítricos.', ['Recomendado'], 'Taco de camarón con crema de aguacate y col morada.'],
  ['antojitos', 'Quesadilla de Hongos', 155, 'Hongos, queso Oaxaca y salsa verde.', ['Vegetariano'], 'Quesadilla de maíz azul con hongos, queso Oaxaca y salsa verde.'],
  ['antojitos', 'Sopes de Birria', 165, 'Birria de res, frijoles, queso fresco y cebolla encurtida.', ['Nuevo'], 'Tres sopes de birria con queso fresco y cebolla encurtida.'],
  ['platos-fuertes', 'Mole de Pollo', 265, 'Pollo en mole de la casa, ajonjolí tostado y arroz rojo.', ['Recomendado', 'Sin gluten'], 'Pollo bañado en mole oscuro con ajonjolí y arroz rojo.'],
  ['platos-fuertes', 'Pescado a la Talla', 295, 'Pesca del día a las brasas con adobo rojo y verde.', ['Sin gluten'], 'Filete de pescado a las brasas con adobo rojo y verde.'],
  ['platos-fuertes', 'Costilla de Res', 345, 'Costilla braseada lentamente con jugo de chiles secos.', ['Favorito de la casa'], 'Costilla de res braseada en jugo de chiles secos.'],
  ['platos-fuertes', 'Enchiladas de Mole', 235, 'Enchiladas de queso fresco bañadas en mole poblano.', ['Vegetariano'], 'Tres enchiladas bañadas en mole poblano con ajonjolí.'],
  ['platos-fuertes', 'Pato en Adobo', 325, 'Pato confitado en adobo de chiles secos y camote asado.', ['Nuevo'], 'Pierna de pato confitada en adobo rojo con camote asado.'],
  ['platos-fuertes', 'Arroz Cremoso de Hongos', 225, 'Arroz cremoso con hongos de temporada y epazote.', ['Vegetariano'], 'Arroz cremoso con hongos dorados y epazote.'],
  ['platos-fuertes', 'Cerdo en Salsa de Chile', 255, 'Cerdo cocinado lentamente en salsa de guajillo y árbol.', ['Picante'], 'Cerdo en salsa roja de guajillo y chile de árbol.'],
  ['postres', 'Pastel de Elote', 135, 'Pastel húmedo de elote con cajeta tibia.', ['Favorito de la casa'], 'Rebanada de pastel de elote con cajeta.'],
  ['postres', 'Flan de Cajeta', 125, 'Flan sedoso con cajeta y nuez garapiñada.', ['Recomendado'], 'Flan con cajeta y nuez garapiñada.'],
  ['postres', 'Chocolate y Chile', 145, 'Chocolate oscuro con un final picante de chile ancho.', ['Picante'], 'Postre de chocolate oscuro con polvo de chile ancho.'],
  ['postres', 'Buñuelo de Canela', 115, 'Buñuelo crujiente con azúcar de canela y piloncillo.', ['Vegetariano'], 'Buñuelo crujiente con azúcar de canela.'],
  ['bebidas', 'Agua de Jamaica', 65, 'Infusión fría de flor de jamaica, ligeramente dulce.', ['Vegano'], 'Vaso de agua de jamaica con hielo.'],
  ['bebidas', 'Horchata de Vainilla', 70, 'Horchata tradicional con un toque de vainilla.', ['Vegetariano'], 'Vaso de horchata con canela y vainilla.'],
  ['bebidas', 'Agua de Pepino y Limón', 70, 'Pepino fresco, limón y hierbabuena.', ['Vegano'], 'Vaso de agua de pepino con limón y hierbabuena.'],
  ['bebidas', 'Margarita de la Casa', 155, 'Tequila blanco, cítricos y sal de chile.', [], 'Margarita en vaso bajo con sal de chile.'],
  ['bebidas', 'Cerveza Clara', 85, 'Cerveza artesanal regional, ligera y refrescante.', [], 'Vaso de cerveza clara con espuma.'],
  ['bebidas', 'Cerveza Ámbar', 90, 'Cerveza artesanal regional con notas tostadas.', [], 'Vaso de cerveza ámbar con espuma.'],
];

export function seedDishes(nowIso: string): Dish[] {
  const pos: Record<string, number> = {};
  return MENU.map(([cat, name, price, description, tags, alt], i) => {
    pos[cat] = (pos[cat] ?? 0) + 1;
    const slug = slugify(name);
    return {
      id: `d${String(i + 1).padStart(2, '0')}`,
      slug,
      name,
      description,
      price,
      categoryId: cat,
      position: pos[cat],
      tags,
      imageId: `lib:${slug}`,
      imageAlt: alt,
      availability: 'Disponible',
      deletedAt: null,
      updatedAt: nowIso,
    };
  });
}

export const LIBRARY_IMAGES = MENU.map(([, name, , , , alt]) => ({ id: `lib:${slugify(name)}`, name, alt }));

export const REVIEWS: Review[] = [
  { id: 'r1', name: 'Mariana G.', initials: 'MG', stars: 5, daysAgo: 3, tag: 'Aniversario', comment: 'Nos dieron una mesa junto al ventanal y todo fluyó. El taco de short rib es de otro nivel y el servicio estuvo atento sin ser invasivo.' },
  { id: 'r2', name: 'Carlos R.', initials: 'CR', stars: 5, daysAgo: 6, tag: 'Con amigos', comment: 'Fuimos seis y la mesa larga cerca de la barra fue perfecta para compartir. El queso fundido al mezcal desapareció en minutos.' },
  { id: 'r3', name: 'Lucía M.', initials: 'LM', stars: 4, daysAgo: 9, tag: 'En familia', comment: 'Buen ambiente para ir con mis papás. La costilla de res se deshace. Me hubiera gustado un poco más de variedad en postres.' },
  { id: 'r4', name: 'Jorge P.', initials: 'JP', stars: 5, daysAgo: 12, tag: 'Cumpleaños', comment: 'Reservé en dos minutos desde el celular y elegí la mesa en el mapa. Llegamos y todo estaba listo para el festejo.' },
  { id: 'r5', name: 'Ana Sofía T.', initials: 'AT', stars: 4, daysAgo: 16, tag: 'Cena en pareja', comment: 'La tostada de atún es fresquísima y la margarita de la casa está muy bien balanceada. El lugar se llena, conviene reservar.' },
  { id: 'r6', name: 'Roberto V.', initials: 'RV', stars: 3, daysAgo: 21, tag: 'Comida de negocios', comment: 'La comida muy buena, pero en hora pico el servicio fue algo lento. Aun así volvería por el mole de pollo.' },
  { id: 'r7', name: 'Fernanda L.', initials: 'FL', stars: 5, daysAgo: 27, tag: 'Sorpresa', comment: 'Organicé una sorpresa y dejé instrucciones en la reserva; el equipo las siguió al pie de la letra. Muy recomendable.' },
  { id: 'r8', name: 'Diego H.', initials: 'DH', stars: 4, daysAgo: 33, tag: 'Con amigos', comment: 'Los sopes de birria son nuevos y valen totalmente la pena. La terraza de noche tiene muy buena vibra.' },
  { id: 'r9', name: 'Patricia C.', initials: 'PC', stars: 5, daysAgo: 40, tag: 'En familia', comment: 'Fuimos con mi mamá en silla de ruedas y la mesa accesible en la terraza fue muy cómoda. Gracias por el cuidado.' },
  { id: 'r10', name: 'Emilio S.', initials: 'ES', stars: 4, daysAgo: 48, tag: 'Cena en pareja', comment: 'Una cocina mexicana distinta, sin clichés. El pastel de elote cierra perfecto. Volveremos para probar el pato.' },
];

/** DO0 = primer día operativo ≥ hoy; DO+n = n-ésimo día operativo posterior; DO-1 = anterior. */
export function operatingDay(today: string, offset: number): string {
  let d = today;
  while (!isOperatingDay(d)) d = addDays(d, 1);
  let n = offset;
  while (n > 0) {
    d = addDays(d, 1);
    if (isOperatingDay(d)) n--;
  }
  while (n < 0) {
    d = addDays(d, -1);
    if (isOperatingDay(d)) n++;
  }
  return d;
}

type ResRow = [string, string, string, number, number, string, TableId, Occasion, ReservationStatus, string?];

const RES: ResRow[] = [
  ['MESA-4F7K', 'Valeria Treviño', '8112345678', 2, 2, '20:00', 'M06', 'Aniversario', 'Confirmada'],
  ['MESA-9QX2', 'Rodrigo Garza', '8123456789', 4, 3, '19:00', 'M05', 'Ninguna', 'Pendiente'],
  ['MESA-H3N8', 'Mariana Cantú', '8134567890', 2, 0, '13:30', 'M01', 'Ninguna', 'Confirmada'],
  ['MESA-K7PW', 'Luis Villarreal', '8145678901', 4, 0, '14:00', 'M07', 'Ninguna', 'Confirmada'],
  ['MESA-T2MV', 'Sofía Salinas', '8156789012', 6, 0, '14:30', 'M09', 'Cumpleaños', 'Pendiente'],
  ['MESA-B6RD', 'Andrés Leal', '8167890123', 2, 0, '19:00', 'M02', 'Ninguna', 'Confirmada'],
  ['MESA-Z8CE', 'Daniela Elizondo', '8178901234', 4, 0, '20:00', 'M08', 'Sorpresa', 'Modificada'],
  ['MESA-P4JS', 'Jorge Martínez', '8189012345', 6, 0, '20:30', 'M10', 'Ninguna', 'Pendiente'],
  ['MESA-W5GA', 'Paulina Montemayor', '8190123456', 2, 0, '21:00', 'M04', 'Aniversario', 'Confirmada'],
  ['MESA-C9UF', 'Emilio Zambrano', '8101234567', 3, -1, '14:00', 'M06', 'Ninguna', 'Completada'],
  ['MESA-R3XH', 'Carla Ibarra', '8111223344', 2, -1, '20:00', 'M03', 'Cumpleaños', 'Completada'],
  ['MESA-N7YB', 'Héctor Sepúlveda', '8122334455', 4, 1, '13:00', 'M05', 'Ninguna', 'Cancelada'],
  ['MESA-D2KT', 'Fernanda Rocha', '8133445566', 6, 4, '20:00', 'M09', 'Cumpleaños', 'Confirmada'],
  ['MESA-G8VM', 'Ricardo Guajardo', '8144556677', 5, 4, '19:30', 'M10', 'Ninguna', 'Confirmada'],
];

export function seedReservations(now: Date): Reservation[] {
  const today = toISODate(now);
  const created = new Date(now.getTime() - 2 * 86_400_000).toISOString();
  return RES.map(([code, name, phone, party, offset, slot, tableId, occasion, status], i) => {
    const history: Reservation['history'] = [{ at: created, actor: 'Sistema', action: 'Creada' }];
    if (code === 'MESA-Z8CE') {
      history.push({
        at: new Date(now.getTime() - 86_400_000).toISOString(),
        actor: 'Cliente',
        action: 'Modificada',
        changes: [{ field: 'Horario', before: '19:30', after: '20:00' }],
      });
    }
    if (status === 'Completada') history.push({ at: created, actor: 'Admin', action: 'Completada' });
    if (status === 'Cancelada') history.push({ at: created, actor: 'Cliente', action: 'Cancelada' });
    if (status === 'Confirmada') history.push({ at: created, actor: 'Admin', action: 'Confirmada' });
    return {
      id: `r_${String(i + 1).padStart(3, '0')}`,
      code,
      date: operatingDay(today, offset),
      slot,
      party,
      tableId,
      occasion,
      occasionNotes: code === 'MESA-4F7K' ? 'Traeremos un pastel pequeño.' : undefined,
      name,
      phone,
      comment: undefined,
      status,
      origin: 'Datos iniciales',
      createdAt: created,
      updatedAt: code === 'MESA-Z8CE' ? new Date(now.getTime() - 86_400_000).toISOString() : created,
      history,
    };
  });
}

export function seedState(now: Date): DBState {
  const iso = now.toISOString();
  return {
    version: SCHEMA_VERSION,
    meta: { seededAt: iso, simulateConflict: false },
    reservations: seedReservations(now),
    blocks: {},
    dishes: seedDishes(iso),
    images: [],
  };
}
