# 20 · Pruebas y criterios de aceptación

> Estrategia de pruebas y casos comprobables para todos los flujos importantes. Cada prueba `T-xxx` referencia requisitos (`FR`), reglas (`BR`) y casos límite (`EC`). Los datos de prueba provienen de `10-data-specification.md §9` (notación DO). La matriz completa está en `23-traceability.md`.

## 1. Estrategia

| Nivel | Qué cubre | Cuándo | Criterio de salida |
|---|---|---|---|
| **Reglas de negocio (unitarias)** | Cálculo de disponibilidad, solapamiento, compatibilidad, recomendación, validaciones, generación de código, transiciones de estado, normalización de teléfono | Durante la implementación de cada regla | 100 % de BR-001 – BR-039 con al menos un caso positivo y uno negativo |
| **Componentes / integración** | Pasos del flujo, mapa de mesas, calendario, formularios, admin (listas, editor) con datos persistidos | Por pantalla | Estados de `11` verificados por pantalla |
| **Extremo a extremo (E2E)** | Recorrido cliente y admin completos en navegador real | Al cerrar cada flujo P0 y antes de la demo | T-020 – T-063 en verde |
| **Accesibilidad** | Auditoría automática + teclado + lector de pantalla | Por pantalla y al final | `14 §11` completo, 0 errores críticos |
| **Responsive** | Matriz de dispositivos §5 | Al cerrar cada pantalla y al final | Sin scroll horizontal ni funciones perdidas |
| **Rendimiento y motion** | Fluidez de animaciones, carga del 3D, reduced motion | Fase de motion/polish | §7 cumplido |
| **Exploratoria / demo** | Guion `19-demo-script.md` completo | Antes de publicar | Guion ejecutado 2 veces sin incidencias desde datos restablecidos |

Principios:

- Las pruebas usan un **reloj controlado** (fecha y hora fijas) para resultados deterministas; los casos indican la hora supuesta cuando importa.
- Antes de cada prueba E2E se **restablecen los datos** (BR-056).
- Una funcionalidad P0 no se considera terminada sin su prueba E2E en verde (definition of done, `01-PRD.md §17`).

## 2. Casos de prueba · Público

| ID | Requisitos | Precondición | Pasos | Resultado esperado |
|---|---|---|---|---|
| T-001 | FR-001 | Desktop 1280 px | Navegar por `/`, `/menu`, `/menu/tostada-de-atun`, `/mis-reservas` | Header con 4 enlaces + CTA; activo correcto (Menú en detalle) |
| T-002 | FR-002 | Móvil 375 px | Abrir menú, Tab por enlaces, Escape | Panel abre, foco atrapado, Escape cierra y devuelve foco |
| T-003 | FR-003 | — | Buscar CTA en S-01, S-02, S-03, S-06, S-07; entrar a `/reservar` | CTA presente y lleva a paso 1; oculto dentro del flujo |
| T-004 | FR-004 | — | Cargar `/`; medir contraste del H1 en varios momentos de la animación | H1 es el primer encabezado; contraste ≥ 4.5:1; CTAs funcionan |
| T-005 | FR-005, FR-069 | Simular sin WebGL; luego reduced motion | Cargar `/` y hacer scroll | Imagen estática sin error visible; con reduced motion, sin movimiento |
| T-006 | FR-006 | — | Leer Concepto | Texto de `15 §3.2`, sin historia personal |
| T-007 | FR-007, BR-047 | — | Ver destacados; en admin ocultar Pato en Adobo; volver | 4 tarjetas (2 Favorito, 1 Nuevo, 1 Recomendado); Pato sustituido por Sopes de Birria |
| T-008 | FR-008 – FR-011, BR-052 | — | Filtrar 5 ★; “Con amigos”; ambos; “3 ★ o menos” + “Aniversario”; navegar con teclado | 5; 2; 1; vacío con “Quitar filtros”; indicador y anuncio actualizados |
| T-009 | FR-012 | Reloj: lunes 15:00; martes 15:00; martes 17:30 | Ver indicador | Cerrado ahora; Abierto ahora; “Abrimos a las 18:00” |
| T-010 | FR-013, FR-014, BR-057 | — | Zoom/arrastre con teclado; “Abrir en Google Maps”; “Copiar dirección” | Mapa operable; etiqueta “Simulado” y diálogo; dirección exacta copiada |
| T-011 | FR-015 | — | Revisar footer en todas las rutas públicas | Nota de proyecto ficticio y acceso admin presentes |
| T-012 | FR-016, BR-040, BR-041 | Datos iniciales | Abrir `/menu` | 25 platillos en 5 categorías en el orden de `10 §7.5` |
| T-013 | FR-017 | Móvil | Scroll hasta Postres; tocar “Antojitos”; abrir `/menu#postres` | Tab activa sigue al scroll y se centra; desplazamiento correcto |
| T-014 | FR-018, BR-043, BR-049 | — | Inspeccionar tarjeta de Costilla de Res | Foto, nombre, $345, descripción, etiqueta; sin lista de ingredientes |
| T-015 | FR-020, BR-045 | Admin marca Flan de Cajeta agotado | Ver menú, detalle y destacados | Insignia “Agotado temporalmente”, imagen atenuada, sigue visible |
| T-016 | FR-021 | Admin oculta Esquites Cremosos | Ver `/menu`; abrir `/menu/esquites-cremosos` | No aparece; S-10 con E-24 |
| T-017 | FR-022, FR-023 | — | Abrir Coliflor Rostizada (último de Entradas); “Siguiente” | Detalle completo; lleva a Taco de Short Rib |
| T-018 | FR-024 | Móvil + reduced motion | Abrir detalle | Toda la información visible sin depender del scroll |
| T-019 | FR-019, BR-044 | Escala de grises | Revisar etiquetas | Todas distinguibles por icono + texto |

## 3. Casos de prueba · Reserva y disponibilidad

Reloj por defecto: DO0 a las 11:00.

| ID | Requisitos | Precondición | Pasos | Resultado esperado |
|---|---|---|---|---|
| T-020 | FR-025 | — | Intentar abrir el paso Mesa por URL sin completar pasos; completar 1–3 y volver atrás | Redirige al primer paso incompleto; valores conservados |
| T-021 | FR-026, BR-008, BR-009 | — | Elegir “Más de 6” | Mensaje E-13 con “Llamar [Simulado]”; no avanza |
| T-022 | FR-027, BR-003 | — | Ver paso Horario | Exactamente 11 horarios en 2 grupos |
| T-023 | FR-028, BR-001, BR-006, BR-007 | 2 personas, 14:00 | Revisar calendario | Lunes “Cerrado”; hoy 14:00 disponible (11:00 + 60 min ≤ 14:00); días > hoy+60 no seleccionables |
| T-024 | FR-029, FR-030, BR-013, BR-014 | DO0, 14:00, 2 personas | Ver mapa | M01 Ocupada (reserva 13:30), M07 Ocupada (reserva 14:00), M09 y M10 No disponible (capacidad; la prioridad de BR-013 muestra capacidad antes que ocupación); M02–M06 y M08 Disponibles; tocar M01 no selecciona y muestra motivo |
| T-025 | BR-010 | — | 1, 3 y 5 personas en un horario libre | 1: mesas de 2 y 4; 3: mesas de 4 y 6; 5: solo de 6 |
| T-026 | FR-031, BR-016 | Horario libre, 2 personas | Sin preferencias; luego “Terraza”; elegir M03 | Recomendadas M01, M02; luego M04, M07; M03 elegible |
| T-027 | FR-032, BR-017, BR-018, BR-026 | Mesa M02 elegida, M01 libre | Ocasión Aniversario; “Mantener mi mesa”; repetir y “Cambiar a Mesa 01”; probar Otra sin motivo | Sugerencia visible; mantener conserva M02; cambiar asigna M01; E-31 |
| T-028 | FR-033, BR-025 | — | Teléfonos “81-1234-567”, “0112345678”, “+52 (81) 1234 5678”; nombre “A”; comentario de 301 caracteres | E-08; E-08; aceptado como 8112345678; E-09; E-27 |
| T-029 | FR-034 | Flujo completo | En Resumen “Editar” horario a uno donde la mesa está ocupada | Vuelve con mesa limpiada (E-32) y pide elegir mesa; datos restantes intactos |
| T-030 | FR-035, BR-027, BR-028 | Flujo completo | Confirmar | Código `MESA-XXXX` válido y único; estado Pendiente; visible en admin y Mis reservas |
| T-031 | FR-036, BR-022, BR-023 | Dos pestañas en Resumen con misma mesa/horario/fecha | Confirmar en A; luego en B | A éxito; B E-05, vuelve a Mesa con la mesa Ocupada y datos conservados |
| T-032 | FR-036, FR-068 | Activar “Simular reserva simultánea” | Completar flujo y confirmar | E-05; reserva “Demo” creada en admin; interruptor se desactiva |
| T-033 | FR-037, BR-024 | 6 personas, 20:00 | Elegir DO+4 | “Sin disponibilidad”; alternativas: 21:00, 18:30, 18:00 esa fecha; fechas próximas a las 20:00; elegir 21:00 → Mesa con M10 disponible |
| T-034 | FR-038, BR-001 | — | Elegir un lunes | E-02 con domingo anterior (si válido) y martes siguiente |
| T-035 | FR-038, BR-007 | Reloj DO0 13:10 | Elegir hoy con horario 14:00; luego hoy con 14:30 | 14:00 → “Horario ya pasado” (13:10 + 60 min = 14:10 > 14:00) con alternativas 14:30 hoy y el siguiente día operativo a las 14:00; 14:30 → permitido |
| T-036 | BR-005, FR-045 | MESA-9QX2 ocupa M05 en DO+3 a las 19:00 | Flujo con 4 personas en DO+3 a las 18:00, 20:00 y 20:30; ver M05 | 18:00 Ocupada (60 min); 20:00 Ocupada (60 min); 20:30 Disponible (90 min) |
| T-037 | BR-030 | Existe MESA-4F7K (DO+2 20:00, tel 8112345678) | Nueva reserva DO+2 19:00 con ese teléfono | E-15 |
| T-038 | FR-039 | En paso Datos | Recargar; volver a Personas y cambiar de 2 a 5 con M01 elegida | Pasos 1–5 conservados; M01 limpiada con aviso E-32 |
| T-039 | FR-035, EC-22, EC-23 | — | Doble clic en Confirmar; recargar S-05; abrir S-05 directo | 1 reserva; S-05 igual; redirección a `/reservar` |

## 4. Casos de prueba · Mis reservas, persistencia y admin

| ID | Requisitos | Precondición | Pasos | Resultado esperado |
|---|---|---|---|---|
| T-040 | FR-040, BR-031 | — | `mesa-4f7k` + `81 1234 5678`; `4F7K` + `8112345678`; `MESA-4F7K` + `8100000000`; `ABC` | Abre; abre; E-06; E-07 |
| T-041 | FR-041, BR-032 | Reloj a 1 h 30 de una reserva; otra Cancelada | Abrir ambas | Acciones deshabilitadas con E-14; Cancelada solo “Reservar de nuevo” |
| T-042 | FR-042, BR-033 – BR-035 | MESA-4F7K | Modificar horario 20:00 → 21:00 (misma mesa M06) | Estado Modificada; código igual; historial; M06 libre a 20:00 y ocupada a 21:00 en admin |
| T-043 | FR-042 | MESA-4F7K | Cambiar teléfono a 8199998888 | Aviso EC-48; acceso con nuevo teléfono funciona y con el anterior da E-06 |
| T-044 | FR-043, BR-036 | MESA-9QX2 | Cancelar | Diálogo con foco en mantener; Cancelada; M05 disponible DO+3 19:00 |
| T-045 | FR-044 | T-044 | “Reservar de nuevo” | Paso 1 con 4 personas |
| T-046 | FR-046, BR-054 | — | Crear reserva, marcar agotado, bloquear mesa; recargar y reabrir navegador | Todo persiste |
| T-047 | FR-047 | Admin y sitio en dos pestañas | Crear reserva en sitio | Dashboard actualizado ≤ 2 s |
| T-048 | FR-048, BR-055, BR-056 | Datos modificados | Restablecer demo | 14 reservas, 25 platillos, 0 bloqueos, sesión admin cerrada |
| T-049 | FR-046, EC-60, EC-63 | Almacenamiento deshabilitado; luego datos dañados | Cargar sitio | Aviso E-16 y funcionamiento en memoria; pantalla E-18 con restablecer |
| T-050 | FR-049, BR-053 | — | `ADMIN`/`mesa-demo`; `admin`/`Mesa-demo` | Entra; E-19 |
| T-051 | FR-050 | Sin sesión | Abrir `/admin/reservas`; iniciar sesión | Login; luego `/admin/reservas` |
| T-052 | FR-051 | Reloj DO0 11:00 | Ver dashboard | 7 reservas · 26 personas; 2 Pendientes; 0 Completadas; 0 Canceladas; ocupación 25 %; próxima MESA-H3N8 13:30 |
| T-053 | FR-052 | — | Horario 14:00; tocar M09 | M01, M07, M09 Ocupadas; panel de M09 con MESA-T2MV |
| T-054 | FR-053 | — | Buscar “garza”; buscar “cantu” (sin acento); filtro Todas + Cancelada | MESA-9QX2; MESA-H3N8; MESA-N7YB |
| T-055 | FR-054 | — | Abrir MESA-Z8CE | Historial Creada + Modificada (19:30 → 20:00) |
| T-056 | FR-055, BR-037 | Reloj DO0 11:00 | Confirmar MESA-T2MV; intentar completar MESA-H3N8; reloj 13:35 y completar | Confirmada; deshabilitado con motivo; Completada |
| T-057 | FR-056 | — | Mover MESA-H3N8 de M01 a M06 | Modificada; mapa 13:30: M01 libre, M06 ocupada |
| T-058 | FR-057 | — | Cancelar MESA-P4JS | Reservas del día 6; Canceladas 1 |
| T-059 | FR-058 – FR-060, BR-041, BR-042 | — | Crear “Tamal de Elote” en Antojitos $95 con imagen de biblioteca; editar precio de Taco de Short Rib a $199; crear con nombre “taco de short rib” | Aparece al final de Antojitos; precio actualizado en menú, detalle y destacado; E-22 |
| T-060 | FR-061, FR-062 | — | Ocultar y mostrar Horchata; agotar y reactivar Pastel de Elote | Desaparece/reaparece en su posición; insignia aparece/desaparece |
| T-061 | FR-063, BR-046 | — | Eliminar Buñuelo de Canela; Deshacer; eliminar de nuevo; restaurar desde papelera; eliminar definitivamente otro | Papelera correcta; restaurado al final de Postres; confirmación doble |
| T-062 | FR-064, BR-051 | — | Subir PNG 2 MB; subir GIF; subir JPG 8 MB; recargar | PNG visible y persistente; E-23; E-23 |
| T-063 | FR-065, BR-015, BR-038 | — | Bloquear M06 Mantenimiento “Silla dañada”; abrir flujo 2 personas DO+2 20:00; revisar MESA-4F7K en admin; desbloquear | M06 Mantenimiento en flujo; aviso “Mesa bloqueada — reasignar”; tras desbloquear, estado calculado |

## 5. Transversales

| ID | Requisitos | Prueba | Resultado esperado |
|---|---|---|---|
| T-064 | FR-066 | Red/latencia simulada activa; navegar menú, calendario, mapa, admin | Skeletons con forma final; sin saltos de layout; botones con estado de progreso |
| T-065 | FR-067 | Provocar cada EC de `12` | Texto del catálogo `15 §9` y acción de salida |
| T-066 | FR-068 | Ejecutar cada elemento del panel “Prueba estas funciones” | Cada uno lleva al estado descrito |
| T-067 | FR-069 | Activar reduced motion (sistema y conmutador del footer) | Sin animaciones > 150 ms; taco estático |
| T-068 | FR-070 | Matriz de dispositivos (abajo) | Sin scroll horizontal; funciones completas |
| T-069 | FR-071 | Checklist `14 §11` | Completo; 0 errores críticos |
| T-070 | FR-072 | `/xyz`, `/menu/no-existe` | S-10 con navegación |

### Matriz de dispositivos (T-068)

| Dispositivo / ancho | Navegador | Pantallas a verificar |
|---|---|---|
| 360 × 740 (Android gama media) | Chrome | Todas |
| 390 × 844 (iPhone) | Safari | Todas |
| 768 × 1024 (tablet vertical) | Safari / Chrome | Todas |
| 1024 × 768 (tablet horizontal / laptop pequeña) | Chrome | Todas |
| 1440 × 900 | Chrome, Firefox, Safari | Todas |
| 1920 × 1080 | Chrome | Home, Menú, Detalle, Admin |

## 6. Accesibilidad (resumen de pruebas)

- Automática en cada pantalla (0 errores críticos/serios).
- Teclado: recorridos cliente y admin completos (`14 §11`).
- Lector de pantalla: flujo de reserva completo con VoiceOver iOS y NVDA; anuncios de `14 §6`.
- Contraste: paleta y estados medidos.
- Zoom 200 % y 320 px.

## 7. Rendimiento y motion

| Métrica | Objetivo |
|---|---|
| Contenido principal visible (Home, móvil 4G simulado) | ≤ 2.5 s |
| Estabilidad visual | Sin desplazamientos de layout perceptibles al cargar |
| Respuesta a interacción | ≤ 200 ms percibidos |
| Animaciones | 60 fps en desktop; sin tirones notables en móvil de gama media |
| Modelo 3D | Carga diferida; no bloquea el texto; respaldo si > 5 s |

## 8. Criterios de aceptación globales del producto

El producto se acepta cuando un evaluador, **sin ayuda externa y sin servicios externos**, puede:

1. Entender qué es Mesa desde Home (identidad, menú, reseñas, ubicación).
2. Completar una reserva eligiendo mesa en el mapa y recibir un código.
3. Comprobar la disponibilidad dinámica (la mesa reservada aparece Ocupada; el escenario sin disponibilidad ofrece alternativas; el conflicto simultáneo se maneja).
4. Consultar, modificar y cancelar la reserva en Mis reservas.
5. Entrar al admin, ver el dashboard, modificar una reserva y ver el mapa actualizado, gestionar un platillo y bloquear una mesa.
6. Recargar el navegador y encontrar todo persistido.
7. Hacer todo lo anterior en móvil y con teclado.
