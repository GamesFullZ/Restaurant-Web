# 01 · PRD — Mesa

> Documento de requisitos de producto. Resume y conecta el resto de la documentación; los detalles normativos viven en los documentos referenciados. Proyecto de **portafolio**: restaurante **ficticio**.

| Campo | Valor |
|---|---|
| Producto | Mesa — sitio web y panel de reservas de un restaurante mexicano contemporáneo |
| Tipo | Proyecto de portafolio (demo funcional en navegador) |
| Estado | Planificación (sin código) |
| Idioma | Español (México) |
| Documentos fuente | Especificación de producto “Mesa · Documentos de planificación” (77 puntos) y master prompt |

## 1. Visión

Mesa ofrece una experiencia web premium de principio a fin: **descubrir** el restaurante, consultar **reseñas**, explorar el **menú**, ver **platillos**, elegir una **reserva**, **seleccionar una mesa** en un mapa, recibir **confirmación** y **gestionar** después la reserva; y, del lado del restaurante, **operar** reservas, mesas y menú desde un panel.

## 2. Problema

- Los sitios de restaurantes suelen ser folletos estáticos: fotos, un PDF del menú y un teléfono.
- Las plataformas de reserva genéricas asignan mesas automáticamente, no explican la falta de disponibilidad y obligan a crear cuentas o dar email.
- Cambiar o cancelar una reserva suele requerir llamar.
- Para el restaurante, la información de reservas, mesas y menú está dispersa.

## 3. Oportunidad

Demostrar, en un solo producto de portafolio, capacidad de **producto, UX, UI, frontend y diseño de interacción**: una marca con identidad propia, un flujo de reserva con selección visual de mesa y disponibilidad dinámica real, autogestión sin cuentas y un panel operativo coherente, todo funcionando en el navegador sin servicios externos.

## 4. Objetivos

| ID | Objetivo | Métrica / evidencia |
|---|---|---|
| O-01 | Comunicar identidad y propuesta de Mesa | El evaluador describe el concepto tras recorrer Home (prueba de 5 segundos / entrevista) |
| O-02 | Permitir explorar el menú y cada platillo | 25 platillos accesibles con detalle |
| O-03 | Reservar de forma guiada eligiendo mesa, con disponibilidad dinámica | Reserva completada en < 2 min por un usuario nuevo; 0 reservas solapadas |
| O-04 | Autogestionar la reserva sin cuentas (consultar, modificar, cancelar) | Tareas completadas sin ayuda |
| O-05 | Operar el restaurante desde un panel (reservas, mesas, menú) con efecto inmediato en el sitio | Recorrido admin del guion en < 2 min |
| O-06 | Demostrar calidad de producto: persistencia, responsive, accesibilidad, motion con propósito y demo autoexplicativa | Criterios globales de `20 §8` cumplidos |

## 5. Público

Audiencia general: **familias, parejas, amigos**, personas que buscan una buena experiencia gastronómica y personas que **celebran ocasiones especiales**. Lado operativo: **administrador** del restaurante. Personas: `03-user-personas.md`. Audiencia del portafolio: reclutadores, líderes de producto/diseño/ingeniería (evaluadores).

## 6. Necesidades

| Usuario | Necesidad |
|---|---|
| Visitante | Entender rápido qué es Mesa, ver platillos con fotos y precios, saber dónde está y cuándo abre |
| Cliente | Reservar en minutos, elegir mesa, saber qué pasa si no hay lugar, dejar instrucciones de ocasión, no dar email, modificar/cancelar solo |
| Admin | Ver el día de un vistazo, gestionar reservas y mesas, mantener el menú, corregir errores sin perder datos |
| Evaluador | Recorrer todas las funciones sin instrucciones externas ni servicios externos |

## 7. Propuesta de valor

“Un taco. Una mesa. Un lugar para disfrutar.” — Reserva **tu** mesa, literalmente: eliges la mesa exacta en el plano, con recomendaciones que explican por qué y alternativas cuando no hay lugar; gestionas todo con un código y tu teléfono. Para el restaurante: una sola vista para el día, mesas y menú, con cambios que se reflejan al instante.

## 8. Alcance

**Incluye:** Home (Hero con taco 3D, Concepto, 4 destacados, Reseñas, Restaurante y ubicación, CTA, Footer); Menú (≈25 platillos, 5 categorías); Detalle de platillo; Reserva guiada (personas → horario → fecha → mesa → ocasión → datos → resumen → confirmación); Mis reservas (consultar, modificar, cancelar); Panel admin (login demo, dashboard, reservas, menú con papelera e imágenes, bloqueo de mesas); persistencia local; “Prueba estas funciones”; responsive; accesibilidad; motion.

**Fuera de alcance:** pagos, autenticación de producción, backend/base de datos real, notificaciones reales, integraciones externas indispensables, email del cliente, pedidos, reseñas de usuarios, walk-ins, combinación de mesas. Lista completa: `21-scope-priorities.md §5`.

## 9. Funcionalidades

| Área | Funcionalidad | Prioridad | Detalle |
|---|---|---|---|
| Home | Hero textual + taco 3D, concepto, destacados, reseñas filtrables, ubicación con mapa, CTA | P1 (3D P2) | FR-004 – FR-015 |
| Menú | Tabs + scroll, tarjetas, etiquetas, agotado | P1 | FR-016 – FR-021 |
| Detalle | Página por platillo con animación | P1 (animación P2) | FR-022 – FR-024 |
| Reserva | Flujo guiado, mapa de mesas, recomendación, alternativas, conflicto | P0 | FR-025 – FR-039 |
| Mis reservas | Código + teléfono, modificar, cancelar | P0 | FR-040 – FR-044 |
| Sistema | Disponibilidad dinámica, persistencia, sincronización, restablecer | P0/P1 | FR-045 – FR-048 |
| Admin | Dashboard, reservas, menú, imágenes, papelera, mesas | P0 | FR-049 – FR-065 |
| Transversal | Skeletons, errores, demo helper, reduced motion, responsive, accesibilidad, 404 | P0/P1 | FR-066 – FR-072 |

## 10. Requisitos funcionales

72 requisitos `FR-001` – `FR-072` en `08-functional-requirements.md`, cada uno con actor, precondición, comportamiento, resultado, prioridad y criterio de aceptación.

## 11. Requisitos no funcionales

| ID | Categoría | Requisito |
|---|---|---|
| NFR-01 | Independencia | Todo el núcleo funciona en el navegador sin servicios externos; acciones externas simuladas y etiquetadas |
| NFR-02 | Persistencia | Datos sobreviven a recargas y reinicios del navegador (BR-054) |
| NFR-03 | Rendimiento | Contenido principal ≤ 2.5 s en móvil 4G simulado; animaciones fluidas; 3D diferido (`20 §7`) |
| NFR-04 | Responsive | Mobile-first desde 360 px sin scroll horizontal (`13`) |
| NFR-05 | Accesibilidad | WCAG 2.2 AA (`14`) |
| NFR-06 | Movimiento | *Reduced motion* respetado en todas las animaciones (`17`) |
| NFR-07 | Consistencia | Una sola lógica de disponibilidad para cliente y admin; vocabulario controlado (`05 §6`) |
| NFR-08 | Robustez | Errores comprensibles y accionables; ninguna acción deja la UI congelada (`12`, FR-066) |
| NFR-09 | Honestidad | Contenido ficticio identificado; nada simula ser un servicio real |
| NFR-10 | Mantenibilidad | Datos iniciales y reglas definidos en documentación, trazables a pruebas (`23`) |

## 12. User stories

| ID | Historia | Criterio de aceptación (resumen) | FR |
|---|---|---|---|
| US-01 | Como visitante, quiero entender qué es Mesa en segundos para decidir si me interesa. | Slogan protagonista, CTA visible, concepto sin historia inventada | FR-004, FR-006 |
| US-02 | Como visitante, quiero ver platillos con foto, precio y etiquetas para elegir qué probar. | 25 platillos, etiquetas visibles, agotados marcados | FR-016 – FR-020 |
| US-03 | Como visitante, quiero leer reseñas filtradas por ocasión para confiar en el lugar. | Filtros por estrellas y etiqueta combinables | FR-008 – FR-011 |
| US-04 | Como visitante, quiero saber dónde está y cuándo abre. | Dirección, horarios, abierto/cerrado, mapa, cómo llegar | FR-012 – FR-014 |
| US-05 | Como cliente, quiero reservar en pocos pasos sin crear cuenta ni dar email. | Flujo de 7 pasos, solo nombre y teléfono | FR-025 – FR-035 |
| US-06 | Como cliente, quiero elegir mi mesa en un plano y entender sus características. | Mapa con estados, ficha y recomendación | FR-029 – FR-031 |
| US-07 | Como cliente, quiero alternativas si no hay lugar. | Horarios y fechas alternativos | FR-037, FR-038 |
| US-08 | Como cliente, quiero indicar una ocasión especial e instrucciones. | Ocasión + instrucciones visibles en resumen, confirmación y admin | FR-032 |
| US-09 | Como cliente, quiero recibir un código y consultar mi reserva después. | Código único; Mis reservas con código + teléfono | FR-035, FR-040, FR-041 |
| US-10 | Como cliente, quiero modificar o cancelar mi reserva sin llamar. | Modificar/cancelar con plazo de 2 h | FR-042, FR-043 |
| US-11 | Como cliente, quiero saber si alguien tomó mi mesa mientras reservaba. | “La disponibilidad acaba de cambiar” + regreso al mapa | FR-036 |
| US-12 | Como admin, quiero ver el día de un vistazo. | Indicadores + mapa por horario | FR-051, FR-052 |
| US-13 | Como admin, quiero buscar y gestionar reservas. | Tabla/tarjetas, filtros, acciones por estado | FR-053 – FR-057 |
| US-14 | Como admin, quiero mantener el menú actualizado sin miedo a borrar por error. | CRUD, agotado, oculto, papelera | FR-058 – FR-064 |
| US-15 | Como admin, quiero bloquear una mesa y saber a quién afecta. | Bloqueo con nota y aviso de reservas afectadas | FR-065 |
| US-16 | Como evaluador, quiero probar las funciones clave sin instrucciones externas. | Panel “Prueba estas funciones” y restablecer | FR-048, FR-068 |
| US-17 | Como usuario con discapacidad o sensibilidad al movimiento, quiero usar todo el sitio. | Teclado, lector, reduced motion | FR-069, FR-071 |

## 13. Criterios de aceptación

Criterios por requisito en `08`; casos de prueba en `20 §2–§5`; criterios globales del producto en `20 §8`.

## 14. Flujos

Flujos UF-01 – UF-14 en `07-user-flows.md`; journeys J-01 – J-06 en `04-user-journeys.md`. Flujo principal: Home → Menú → Detalle → Reserva (personas → horario → fecha → mesa → ocasión → datos → resumen) → Confirmación → Mis reservas → Modificar/Cancelar. Admin: Login → Dashboard → Reservas → Modificar → comprobar mapa → Gestionar platillo → Bloquear mesa.

## 15. Reglas, restricciones, supuestos y dependencias

- **Reglas de negocio:** BR-001 – BR-057 en `09-business-rules.md` (horarios fijos, duración 1 h 30, 10 mesas, compatibilidad, estados, plazos, menú).
- **Restricciones:** sin backend; sin servicios externos obligatorios; sin email; sin pagos; horarios y mesas fijos; menú sin drag & drop; sin ingredientes visibles.
- **Supuestos:** SU-01 – SU-26 en `22-risks-assumptions.md`.
- **Dependencias:** 25 fotografías generadas con IA; modelo 3D del taco (con respaldo estático); tipografías con licencia web libre; navegador moderno con almacenamiento local; herramienta de ideación (Excalidraw) antes del diseño visual.

## 16. Métricas

Como es un proyecto de portafolio sin usuarios reales, se miden durante pruebas con 5 participantes y en la evaluación:

| Métrica | Objetivo |
|---|---|
| Tasa de éxito en “reservar una mesa para 2” sin ayuda | ≥ 90 % |
| Tiempo medio para completar una reserva | < 2 min |
| Tasa de éxito en “modificar tu reserva” | ≥ 90 % |
| Tasa de éxito en “encontrar una alternativa cuando no hay lugar” | ≥ 80 % |
| Tarea admin “mover una reserva y verificar el mapa” | < 60 s |
| Errores críticos de accesibilidad | 0 |
| Recorrido del guion de demo | ≤ 5 min sin incidencias |

## 17. Definition of Done

Una funcionalidad está terminada cuando:

1. Cumple su(s) requisito(s) FR y las reglas BR relacionadas.
2. Sus criterios de aceptación y pruebas `T-xxx` pasan (E2E en verde para P0).
3. Implementa todos sus estados (`11`): carga, vacío, error, éxito.
4. Usa los textos del catálogo (`15`).
5. Funciona en la matriz responsive (`20 §5`).
6. Es operable con teclado y lector de pantalla; respeta *reduced motion*.
7. Persiste correctamente y se sincroniza entre pestañas si aplica.
8. No introduce contradicciones con la documentación; si cambia una regla, se actualizan los documentos afectados y la matriz de trazabilidad.

## 18. Riesgos

Resumen de `22-risks-assumptions.md §3`: rendimiento del 3D (R-01), consistencia de fotos IA (R-03), límite de almacenamiento (R-04), demostrar la concurrencia (R-05), envejecimiento de datos (R-06), mesa accesible para grupos (R-07), orden horario→fecha (R-08), sobrealcance de motion (R-09), accesibilidad del mapa (R-10), descubrimiento de funciones (R-12).
