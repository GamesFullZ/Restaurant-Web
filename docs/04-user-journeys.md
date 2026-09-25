# 04 · User journeys

> Journeys de cliente y admin con objetivo, pasos, acciones, información, decisiones, estados, errores y resultado. Se apoyan en las personas (`03`) y se concretan en flujos (`07`). Las fechas usan la notación DO de `10-data-specification.md §9`.

| ID | Journey | Persona | Flujos |
|---|---|---|---|
| J-01 | Descubrir y reservar una cena para dos | P-01 | UF-01, UF-02, UF-03, UF-04, UF-05, UF-06 |
| J-02 | Grupo de 6 sin disponibilidad inicial | P-02 | UF-04, UF-05, UF-06 |
| J-03 | Reserva familiar accesible y modificación | P-03 | UF-04, UF-07, UF-08 |
| J-04 | Aniversario sorpresa con instrucciones | P-04 | UF-01, UF-04, UF-06 |
| J-05 | Cancelar y volver a reservar | P-04 | UF-07, UF-09, UF-04 |
| J-06 | Jornada del administrador | P-05 | UF-10 – UF-13 |

---

## J-01 · Ana y Diego descubren y reservan

**Objetivo:** cena para 2 el viernes a las 20:00 en una mesa tranquila.

| # | Etapa | Acción | Información que ve | Decisión | Estado / pantalla | Posibles errores |
|---|---|---|---|---|---|---|
| 1 | Descubrir | Abre el sitio desde un enlace | Slogan, taco 3D, CTA | Seguir explorando | S-01.1 | 3D no carga → imagen (EC-90) |
| 2 | Explorar | Scroll por concepto y destacados | 4 platillos | Abrir Taco de Short Rib | S-01.3 → S-03 | — |
| 3 | Validar | Revisa reseñas con filtro “Cena en pareja” | 2 reseñas | Confía en el lugar | S-01.4 | Filtro vacío (E-28) |
| 4 | Reservar | “Reservar mesa” | Paso 1 | 2 personas | S-04.1 | — |
| 5 | Horario | Elige 20:00 | 11 horarios | 20:00 | S-04.2 | — |
| 6 | Fecha | Elige viernes | Estados por día | Viernes (Disponible) | S-04.3 | Día lleno (E-01) |
| 7 | Mesa | Marca preferencia “Tranquila” | Recomendadas M01, M06 | M01 | S-04.4 | Mesa ocupada (E-10) |
| 8 | Ocasión | Deja “Ninguna” | — | — | S-04.5 | — |
| 9 | Datos | Nombre y teléfono | Aviso “No pedimos correo” | — | S-04.6 | Teléfono inválido (E-08) |
| 10 | Resumen | Revisa | Todos los datos | Confirmar | S-04.7 | Conflicto (E-05) |
| 11 | Confirmación | Copia código | Código, datos, estado Pendiente | Guardar código | S-05 | — |

**Resultado:** reserva Pendiente con código; M01 queda Ocupada ese viernes para los horarios de 19:00 a 21:00 (BR-005).

## J-02 · Iván busca mesa para 6

**Objetivo:** 6 personas, DO+4 a las 20:00.

1. S-04.1 → 6 personas. S-04.2 → 20:00. S-04.3 → elige DO+4.
2. **Estado:** DO+4 aparece “Sin disponibilidad” (M09 y M10 ocupadas, `10 §9`).
3. **Error E-01** con alternativas: esa fecha a las 21:00, 18:30 y 18:00; fechas próximas con 20:00.
4. **Decisión:** elige 21:00 en DO+4 → paso Mesa: M10 disponible (M09 sigue ocupada a las 21:00 por su reserva de 20:00).
5. M10 aparece Recomendada (capacidad exacta). Elige M10.
6. Ocasión Ninguna → datos → resumen → confirma.

**Información clave:** motivo claro de no disponibilidad, alternativas concretas. **Resultado:** reserva para 6 en DO+4 a las 21:00, M10.
**Variante:** si activa “Simular reserva simultánea” → E-05 al confirmar → vuelve al mapa; como no quedan mesas de 6, vuelve a Fecha con E-01 (EC-21).

## J-03 · Familia Garza Leal: accesible y modificación

**Objetivo:** 4 personas el domingo 14:00 con mesa accesible; después cambiar a 5.

1. Revisa S-01.5 (dirección, horarios, cómo llegar).
2. Reserva 4 personas, 14:00, domingo. En Mesa marca preferencia “Accesible” → M07 recomendada con motivo “Coincide con: Accesible”. Elige M07.
3. Confirma; guarda código.
4. **Días después:** S-06 con código + teléfono → S-07.
5. “Modificar reserva” → “Fecha, horario, personas o mesa” → cambia a 5 personas.
6. **Estado:** M07 deja de ser compatible (BR-010) → se limpia la mesa (E-32).
7. Mapa: M09 y M10 disponibles; ninguna Accesible. **Decisión:** elige M10 (Terraza, misma zona que M07) o regresa a 4 personas.
8. Resumen Antes/Después → “Guardar cambios” → estado Modificada.

**Errores posibles:** E-06 (teléfono con otro formato se acepta; código mal escrito → E-06), E-14 si faltan < 2 h.
**Resultado:** reserva modificada sin llamar. **Hallazgo de producto:** falta de mesa accesible para 6 (R-07).

## J-04 · Regina y su aniversario sorpresa

**Objetivo:** 2 personas, sábado 20:30, mesa privada, instrucciones.

1. S-01.4: filtra reseñas por “Sorpresa” → lee la reseña de Fernanda L.
2. Reserva: 2 personas, 20:30, sábado. En Mesa no marca preferencias; elige M02 (Recomendada por capacidad).
3. Ocasión: Aniversario → **sugerencia BR-018:** “Para un aniversario, la Mesa 01 (Tranquila · Cerca de ventana) está libre.” → “Cambiar a Mesa 01”.
4. Instrucciones: “Es sorpresa: por favor traigan el postre con una vela al final.”
5. Datos → Resumen: verifica ocasión e instrucciones → Confirmar.
6. S-05 muestra ocasión Aniversario.

**Resultado:** reserva con ocasión e instrucciones visibles para el admin (A-04).

## J-05 · Regina cancela y vuelve a reservar

1. El plan cambia: S-06 → S-07 (Pendiente o Confirmada, > 2 h).
2. “Cancelar reserva” → diálogo (foco en “Mantener mi reserva”) → “Sí, cancelar reserva”.
3. **Estado:** Cancelada; mesa liberada al instante.
4. “Reservar de nuevo” → S-04.1 con 2 personas → nueva fecha → nueva reserva con **nuevo** código.

**Error posible:** intentar cancelar a < 2 h → acción deshabilitada con motivo y Llamar `[Simulado]`.

## J-06 · Jornada de Tomás (administrador)

**Objetivo:** controlar el día DO0.

| # | Momento | Acción | Información | Decisión | Pantalla | Errores |
|---|---|---|---|---|---|---|
| 1 | Inicio de turno | Login admin / mesa-demo | — | — | A-01 | E-19 |
| 2 | Panorama | Revisa indicadores | 7 reservas, 2 pendientes, ocupación, próxima reserva | Confirmar pendientes | A-02 | Lunes → “Hoy cerrado” |
| 3 | Confirmar | Abre MESA-T2MV (cumpleaños, 6 personas) | Detalle, ocasión | Confirmar | A-04 | E-29 |
| 4 | Cambio telefónico | Busca “Leal” → MESA-B6RD | Reserva 19:00 M02 | Mover a 21:00 | A-03 → A-05 | Mesa ocupada (E-10) |
| 5 | Verificar | Dashboard, horario 19:00 y 21:00 | M02 libre a 19:00, ocupada a 21:00 | — | A-02 | — |
| 6 | Servicio | Cocina avisa que se acabó el Pato en Adobo | — | Marcar agotado | A-06 | — |
| 7 | Incidencia | Silla rota en M06 | Aviso: MESA-4F7K usa M06 en DO+2 | Bloquear Mantenimiento con nota; reasignar MESA-4F7K a M01 | A-10 → A-05 | — |
| 8 | Cierre | Marca completadas las reservas de comida | Botón disponible solo tras la hora de inicio | Completar | A-03 | EC-73 |

**Resultado:** el día queda al corriente; todo cambio se refleja en el sitio público (menú agotado, M06 en Mantenimiento, disponibilidad actualizada).
