# 09 · Reglas de negocio

> Fuente de verdad para toda regla que condicione disponibilidad, reservas, mesas, estados y menú.
> Los identificadores `BR-xxx` se usan en `08-functional-requirements.md`, `11-state-specification.md`, `12-error-edge-cases.md`, `20-testing-acceptance.md` y `23-traceability.md`.
> Las reglas marcadas con **[Supuesto]** completan información no crítica que no estaba en la especificación original; están listadas también en `22-risks-assumptions.md`.

Notación de fechas usada en todo el proyecto:

- **Hora local**: hora del dispositivo, interpretada como zona `America/Monterrey`.
- **Inicio** de una reserva: fecha + horario elegido. **Fin** = inicio + 1 h 30 min.

---

## 1. Operación y horarios

| ID | Regla |
|---|---|
| **BR-001** | El restaurante opera **martes a domingo**. El **lunes está cerrado**: no existe ningún horario reservable en lunes. |
| **BR-002** | Turnos de servicio: **Comida 13:00–17:00** y **Cena 18:00–22:30**. Fuera de estos turnos no hay servicio. |
| **BR-003** | Horarios reservables fijos (11 en total). **Comida:** 13:00, 13:30, 14:00, 14:30. **Cena:** 18:00, 18:30, 19:00, 19:30, 20:00, 20:30, 21:00. No existen otros horarios; el administrador no puede crear ni editar horarios. |
| **BR-004** | Toda reserva dura **1 h 30 min**. El último horario de cena (21:00) termina a las 22:30, coincidiendo con el cierre. El último de comida (14:30) termina a las 16:00. |
| **BR-005** | **Solapamiento:** dos reservas activas sobre la misma mesa y la misma fecha se solapan si la diferencia entre sus inicios es **menor a 90 minutos**. Ejemplo: una reserva a las 19:00 en M05 bloquea M05 a las 18:00, 18:30, 19:00, 19:30 y 20:00; M05 vuelve a estar libre a las 20:30. |
| **BR-006** | **[Supuesto] Ventana de reserva:** se puede reservar desde hoy y hasta **60 días naturales** después de hoy (inclusive). Fechas anteriores a hoy o posteriores a la ventana no son seleccionables. |
| **BR-007** | **[Supuesto] Anticipación mínima:** para la fecha de hoy, solo se ofrecen horarios cuyo inicio sea **al menos 60 minutos** posterior a la hora actual. |

## 2. Personas y capacidad

| ID | Regla |
|---|---|
| **BR-008** | **[Supuesto] Tamaño de grupo en línea:** de **1 a 6 personas** (6 es la capacidad máxima de una mesa). |
| **BR-009** | **[Supuesto] Grupos de más de 6:** no se pueden reservar en línea. Se muestra un mensaje con el teléfono (ficticio) del restaurante y la acción “Llamar” identificada como **simulada**. |
| **BR-010** | **[Supuesto] Compatibilidad mesa–grupo** (evita desperdiciar mesas grandes): 1–2 personas → mesas de 2 o de 4. 3–4 personas → mesas de 4 o de 6. 5–6 personas → mesas de 6. |
| **BR-011** | Una reserva ocupa **exactamente una mesa**. No se combinan mesas. |

## 3. Mesas

| ID | Regla |
|---|---|
| **BR-012** | Existen **10 mesas fijas** (no se crean ni eliminan): M01–M04 capacidad 2; M05–M08 capacidad 4; M09–M10 capacidad 6. Sus características están en `10-data-specification.md §4`. |
| **BR-013** | **Estado de una mesa para un contexto** (fecha + horario + personas) se deriva en este orden de prioridad; se muestra el primero que aplique: 1) **Mantenimiento** (bloqueo admin de tipo Mantenimiento); 2) **No disponible** (bloqueo admin de tipo No disponible); 3) **No disponible** por capacidad incompatible con el grupo (BR-010); 4) **Ocupada** (existe una reserva activa que se solapa, BR-005); 5) **Seleccionada** (es la mesa elegida por el usuario en ese momento); 6) **Disponible**. |
| **BR-014** | Solo una mesa en estado **Disponible** puede seleccionarse. Seleccionar otra mesa deselecciona la anterior. |
| **BR-015** | **Bloqueo administrativo:** el administrador puede marcar una mesa como **Mantenimiento** o **No disponible** y añadir una nota opcional (máx. 140 caracteres). El bloqueo aplica a **todas las fechas y horarios** mientras esté activo y se retira manualmente (“Desbloquear”). **[Supuesto]** Bloquear una mesa **no cancela** las reservas activas existentes en ella: el sistema advierte y lista esas reservas para que el administrador las reasigne (BR-038). |
| **BR-016** | **Recomendación de mesas.** Sobre las mesas en estado Disponible del contexto, se calcula una puntuación: +2 si la capacidad es la mínima compatible (2 para 1–2 personas, 4 para 3–4, 6 para 5–6); +3 por cada característica que coincida con las **preferencias** marcadas por el usuario en el paso Mesa; +1 por cada característica afín a la **ocasión** cuando ésta ya se conoce (modificación de reserva) según BR-017; +1 a “Ideal para grupos” si el grupo es de 5–6. Se destacan como **“Recomendada”** las **2** mesas con mayor puntuación (empate → número de mesa menor), con un texto que explica por qué. La recomendación **nunca** oculta ni bloquea otras mesas disponibles. |
| **BR-017** | **[Supuesto] Afinidad ocasión → características:** Aniversario → Tranquila, Más privada, Cerca de ventana. Cumpleaños → Zona social, Ideal para grupos, Terraza. Sorpresa → Más privada, Tranquila. Otra / Ninguna → sin afinidad. |
| **BR-018** | **Sugerencia por ocasión (flujo de reserva).** Como la ocasión se elige después de la mesa, en el paso Ocasión: si la ocasión tiene afinidades, la mesa elegida no cumple ninguna y existe otra mesa Disponible y compatible que cumpla al menos una, se muestra **una sugerencia no bloqueante** (“Cambiar a M06” / “Mantener mi mesa”). Si el usuario la ignora, la reserva continúa con su mesa. |

## 4. Disponibilidad

| ID | Regla |
|---|---|
| **BR-019** | **Reservas que ocupan mesa:** estados Pendiente, Confirmada, Modificada y Completada. Una reserva **Cancelada** no ocupa mesa. |
| **BR-020** | Un **horario está disponible** para N personas en una fecha si la fecha es válida (BR-001, BR-006, BR-007) y existe **al menos una mesa compatible** (BR-010) en estado Disponible (BR-013). |
| **BR-021** | La disponibilidad **se calcula dinámicamente** a partir de reservas y bloqueos persistidos; no se guarda precalculada. Crear, modificar o cancelar una reserva y bloquear/desbloquear una mesa actualiza de inmediato calendario, mapa de mesas y dashboard, incluso en otras pestañas abiertas del mismo navegador. |
| **BR-022** | **Sin retención temporal:** elegir una mesa en el flujo no la aparta. La disponibilidad se **revalida al confirmar** (paso Resumen). Si la mesa ya no está disponible, se aplica el conflicto simultáneo (BR-023). |
| **BR-023** | **Conflicto simultáneo:** si al confirmar la mesa elegida dejó de estar disponible, no se crea la reserva, se muestra “La disponibilidad acaba de cambiar” y se regresa al paso Mesa conservando personas, horario, fecha, ocasión y datos. Si ya no queda ninguna mesa compatible en ese horario, se regresa al paso Fecha con alternativas (BR-024). |
| **BR-024** | **Alternativas ante falta de disponibilidad:** se ofrecen hasta **3 horarios** disponibles en la misma fecha (los más cercanos al elegido) y hasta **3 fechas** próximas con el mismo horario disponible, además de los controles “Cambiar fecha” y “Cambiar número de personas”. |

## 5. Reservas

| ID | Regla |
|---|---|
| **BR-025** | **Datos del cliente:** Nombre (obligatorio, 2–60 caracteres; letras, espacios, acentos, apóstrofo y guion); Teléfono (obligatorio, México, 10 dígitos, el primero entre 2 y 9; se aceptan espacios, guiones, paréntesis y prefijo +52 que se eliminan al normalizar); Comentario / instrucciones especiales (opcional, máx. 300 caracteres). **No se solicita email.** |
| **BR-026** | **Ocasión:** Ninguna (valor por defecto), Cumpleaños, Aniversario, Sorpresa u Otra. Si la ocasión es distinta de Ninguna aparece el campo opcional “Instrucciones para la ocasión” (máx. 200). **[Supuesto]** Si es Otra, se pide además “¿Qué celebran?” (obligatorio, 2–40 caracteres). |
| **BR-027** | **Código único:** formato `MESA-XXXX`, donde X pertenece al alfabeto `23456789ABCDEFGHJKMNPQRSTUVWXYZ` (sin 0, O, 1, I, L para evitar confusiones). Se genera al confirmar y no se repite con ningún código existente. El código nunca cambia, aunque la reserva se modifique. |
| **BR-028** | **[Supuesto] Estado inicial:** una reserva creada por el cliente nace como **Pendiente** (el restaurante la confirma desde admin). Pendiente ya ocupa la mesa (BR-019). Ver decisión pendiente DP-01 en `22-risks-assumptions.md`. |
| **BR-029** | **Transiciones de estado permitidas:** Pendiente → Confirmada, Modificada, Cancelada, Completada. Confirmada → Modificada, Cancelada, Completada. Modificada → Confirmada, Modificada, Cancelada, Completada. **Cancelada** y **Completada** son **finales**: no admiten acciones. |
| **BR-030** | **[Supuesto] Reserva duplicada:** un mismo teléfono no puede tener dos reservas activas que se solapen (BR-005) en la misma fecha, aunque sean en mesas distintas. |
| **BR-031** | **Acceso a Mis reservas:** se requiere que **código y teléfono coincidan** con una misma reserva. El código se compara sin distinguir mayúsculas y aceptando que se omita el prefijo `MESA-`; el teléfono se compara normalizado (BR-025). No se revela si el error está en el código o en el teléfono. |

## 6. Modificación y cancelación

| ID | Regla |
|---|---|
| **BR-032** | **[Supuesto] Plazo del cliente:** el cliente puede modificar o cancelar una reserva si su estado es Pendiente, Confirmada o Modificada **y faltan al menos 2 horas para su inicio**. Fuera de ese plazo las acciones aparecen deshabilitadas con el motivo y el teléfono (ficticio) del restaurante. |
| **BR-033** | **Campos modificables:** fecha, horario, personas, mesa, nombre, teléfono, ocasión, instrucciones y comentario. Si el cambio afecta disponibilidad (fecha, horario, personas o mesa) se usa **el mismo flujo guiado** en modo edición, con los valores actuales precargados. Los cambios de datos/ocasión se editan en un formulario directo sin recalcular disponibilidad. |
| **BR-034** | Durante una modificación, la **propia reserva no cuenta como ocupación** de su mesa actual (la mesa aparece como Seleccionada, no como Ocupada). La mesa anterior se libera solo cuando se confirma el cambio. |
| **BR-035** | Al confirmar una modificación, el estado pasa a **Modificada**, se conserva el código y se registra el cambio en el historial de la reserva (qué cambió, antes/después, quién y cuándo). Si el cambio fue de teléfono, el nuevo teléfono es el que da acceso a Mis reservas. |
| **BR-036** | **Cancelación:** requiere una confirmación explícita. Al cancelar, el estado pasa a **Cancelada**, la mesa se libera de inmediato (BR-019) y se ofrece “Reservar de nuevo” con el número de personas precargado. Una reserva cancelada no puede reactivarse. |
| **BR-037** | **Acciones del administrador sobre reservas:** Confirmar (Pendiente/Modificada → Confirmada); Modificar (misma validación de disponibilidad, **sin** el plazo de 2 h de BR-032); Cancelar (confirmación explícita); Completar (solo si el inicio de la reserva ya ocurrió: fecha-hora de inicio ≤ ahora). Ninguna acción sobre estados finales. |
| **BR-038** | **[Supuesto]** Una reserva activa y futura cuya mesa está bloqueada se marca en admin con el aviso “Mesa bloqueada — reasignar”. El cliente la sigue viendo normalmente. Si el cliente la modifica cambiando fecha/horario/personas, debe elegir una mesa disponible (la bloqueada no es seleccionable). |
| **BR-039** | **[Supuesto] Sin transiciones automáticas:** ninguna reserva cambia de estado sola. Una reserva activa cuyo fin ya pasó aparece en admin con el aviso “Pendiente de cerrar”. |

## 7. Menú

| ID | Regla |
|---|---|
| **BR-040** | **Categorías fijas y en orden fijo:** Entradas, Antojitos, Platos fuertes, Postres, Bebidas y cervezas. **[Supuesto]** “Bebidas y cervezas” es una sola categoría (ver DP-02). No se crean categorías nuevas. |
| **BR-041** | **Orden dentro de la categoría:** fijo, por el campo `posición` (orden inicial del menú; los platillos nuevos se agregan al final de su categoría; al cambiar de categoría, el platillo pasa al final de la nueva). **No se usa drag & drop.** |
| **BR-042** | **Campos del platillo:** nombre (obligatorio, 2–60, único sin distinguir mayúsculas/acentos entre platillos no eliminados definitivamente), precio (obligatorio, entero en MXN, 1–9 999), descripción (obligatoria, 10–160 caracteres), categoría (obligatoria), imagen (obligatoria; sin imagen se usa un placeholder de marca y se marca advertencia en admin), etiquetas (0 a 7 de la lista fija). |
| **BR-043** | **No se muestran ingredientes** como lista o campo independiente. La descripción es una línea breve y evocadora. |
| **BR-044** | **Etiquetas fijas:** Vegetariano, Picante, Vegano, Sin gluten, Recomendado, Nuevo, Favorito de la casa. No se crean etiquetas nuevas. Si un platillo es Vegano no necesita además Vegetariano (se permite, pero se sugiere no duplicar). |
| **BR-045** | **Disponibilidad de platillo:** Disponible, Agotado temporalmente u Oculto. **Agotado temporalmente** sigue visible en menú, detalle y destacados con la insignia “Agotado temporalmente”, no puede presentarse como disponible (sin CTA ni estilos de disponible) y su imagen se muestra atenuada. **Oculto** no aparece en el sitio público ni es accesible por URL (404 amigable). |
| **BR-046** | **Eliminación suave:** eliminar pide confirmación y envía el platillo a la **Papelera** (no visible en el sitio). Desde la papelera se puede **Restaurar** (vuelve con su estado previo y al final de su categoría) o **Eliminar definitivamente** (segunda confirmación, irreversible). |
| **BR-047** | **Destacados de Home:** exactamente 4: dos Favorito de la casa (Taco de Short Rib, Costilla de Res), uno Nuevo (Pato en Adobo) y uno Recomendado (Tostada de Atún). **[Supuesto]** La selección es configuración fija; si un destacado queda Oculto o en Papelera, se sustituye por el primer platillo visible con la misma etiqueta según el orden del menú; si es Agotado, se mantiene con su insignia. |
| **BR-048** | **URL del platillo:** `/menu/<slug>`, donde el slug se deriva del nombre (minúsculas, sin acentos, guiones). Si el nombre cambia, el slug se regenera; el slug anterior deja de funcionar (404 amigable). |
| **BR-049** | **Formato de precio:** `$185` (MXN, sin decimales, con separador de miles para ≥ 1 000: `$1,250`). |

## 8. Imágenes

| ID | Regla |
|---|---|
| **BR-050** | **Imágenes del menú:** 25 fotografías fotorrealistas generadas con IA, estilo consistente (fondos neutros, luz natural, composición limpia, espacio negativo). Ver `16-design-direction.md §8`. |
| **BR-051** | **[Supuesto] Imágenes subidas por admin:** formatos JPG, PNG o WebP; tamaño de origen máx. 5 MB; se redimensionan a un lado mayor máx. 1 600 px antes de guardarse localmente. Se requiere texto alternativo (obligatorio, 5–120 caracteres). |

## 9. Reseñas

| ID | Regla |
|---|---|
| **BR-052** | 10 reseñas simuladas de solo lectura; el usuario no puede publicar. Orden por fecha descendente. Filtros por estrellas (Todas, 5, 4, 3 o menos) y por etiqueta contextual; ambos filtros se combinan (Y). |

## 10. Administración y demo

| ID | Regla |
|---|---|
| **BR-053** | **Acceso admin demo:** usuario `admin`, contraseña `mesa-demo`. No es autenticación de producción. La sesión dura hasta cerrar la pestaña o pulsar “Cerrar sesión”. |
| **BR-054** | **Persistencia local:** reservas, estado de mesas, menú (incluida papelera), imágenes subidas y configuración de demo se guardan en el almacenamiento del navegador y sobreviven a recargas. |
| **BR-055** | **Datos iniciales relativos:** en la primera carga (o al “Restablecer demo”) se generan los datos iniciales con fechas relativas al día actual (ver `10-data-specification.md §9`), para que la demo siempre tenga reservas “de hoy” y futuras. |
| **BR-056** | **Restablecer demo:** borra todos los datos locales y regenera los datos iniciales. Requiere confirmación. Cierra la sesión admin. |
| **BR-057** | **Acciones externas simuladas** (abrir Google Maps, llamar, notificaciones) se identifican siempre con la etiqueta visible “Simulado”. |
