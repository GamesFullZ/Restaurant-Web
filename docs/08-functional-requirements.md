# 08 · Requisitos funcionales

> Cada requisito tiene ID estable `FR-xxx`, actor, precondición, comportamiento, resultado, prioridad (P0/P1/P2, ver `21-scope-priorities.md`) y criterio de aceptación comprobable. Las reglas citadas están en `09-business-rules.md`; las pantallas en `06-screen-specification.md`; las pruebas en `20-testing-acceptance.md`.
>
> Actores: **Visitante** (cualquier persona en el sitio público), **Cliente** (visitante con una reserva), **Admin** (usuario del panel demo), **Sistema**.

Índice por área:

| Área | Requisitos |
|---|---|
| Navegación global | FR-001 – FR-003 |
| Home | FR-004 – FR-015 |
| Menú y detalle | FR-016 – FR-024 |
| Reserva | FR-025 – FR-039 |
| Mis reservas | FR-040 – FR-044 |
| Disponibilidad y persistencia | FR-045 – FR-048 |
| Admin | FR-049 – FR-065 |
| Transversales | FR-066 – FR-072 |

---

## Navegación global

### FR-001 · Navegación principal en desktop
- **Actor:** Visitante. **Precondición:** viewport ≥ 1024 px.
- **Comportamiento:** header con logo “Mesa” y enlaces Inicio, Menú, Reservar, Mis reservas; CTA destacado “Reservar mesa”. El enlace de la sección actual se marca como activo (visual y `aria-current`). El header se compacta al hacer scroll hacia abajo y reaparece al subir.
- **Resultado:** el visitante llega a cualquier sección principal en un clic.
- **Prioridad:** P0.
- **Criterio de aceptación:** en cada ruta pública, los 5 destinos y el CTA son visibles y funcionales; el activo coincide con la ruta (incluido `/menu/<slug>` → Menú).

### FR-002 · Navegación en móvil
- **Actor:** Visitante. **Precondición:** viewport < 1024 px.
- **Comportamiento:** header con logo, CTA compacto “Reservar” y botón “Menú de navegación”. El botón abre un panel a pantalla completa con los 4 enlaces en el mismo orden, cierra con botón, con Escape y al navegar; atrapa el foco mientras está abierto.
- **Resultado:** misma jerarquía que en desktop.
- **Prioridad:** P0.
- **Criterio de aceptación:** el panel abre/cierra con teclado y touch; el foco regresa al botón al cerrar; el CTA de reserva sigue visible sin abrir el panel.

### FR-003 · CTA “Reservar mesa” persistente
- **Actor:** Visitante. **Precondición:** ruta pública distinta de `/reservar*`.
- **Comportamiento:** el CTA aparece en header, en el Hero, en el CTA de Home, en el detalle de platillo y en el footer. Dentro del flujo de reserva se oculta.
- **Resultado:** acceso inmediato al flujo.
- **Prioridad:** P0.
- **Criterio de aceptación:** desde S-01, S-02, S-03, S-06 y S-07 existe un CTA visible que lleva a `/reservar` en el paso 1.

## Home

### FR-004 · Hero con texto protagonista
- **Actor:** Visitante. **Precondición:** carga de `/`.
- **Comportamiento:** el slogan “Un taco. Una mesa. Un lugar para disfrutar.” es el elemento dominante (H1). Detrás del texto hay una animación de fondo abstracta (patrón gráfico mexicano reinterpretado); a un lado, el taco 3D. Incluye CTA primario “Reservar mesa” y secundario “Ver menú”. No se usa fotografía de comida a pantalla completa.
- **Resultado:** identidad y acción principal comprendidas en los primeros segundos.
- **Prioridad:** P1.
- **Criterio de aceptación:** el H1 es el primer encabezado de la página, legible sobre la animación (contraste ≥ 4.5:1 en todos los estados de la animación) y ambos CTA funcionan.

### FR-005 · Taco 3D reactivo al scroll
- **Actor:** Visitante. **Precondición:** Hero visible.
- **Comportamiento:** modelo 3D fotorealista de un taco ubicado a un lado del texto. Al hacer scroll, rota, se desplaza y cambia de escala/composición a lo largo del Hero y la transición a Concepto, sin cubrir el texto. Mientras carga se muestra un placeholder (imagen estática del taco). Sin soporte 3D, con carga fallida o con *reduced motion*, se muestra la imagen estática sin movimiento.
- **Resultado:** elemento memorable que no compromete lectura ni rendimiento.
- **Prioridad:** P2 (la imagen estática de respaldo es P1).
- **Criterio de aceptación:** el taco nunca se superpone al H1 en ningún breakpoint; con *reduced motion* activo no hay rotación ni desplazamiento; si el modelo falla, la imagen estática aparece sin mensaje de error.

### FR-006 · Sección Concepto
- **Actor:** Visitante.
- **Comportamiento:** presenta la filosofía culinaria (reinterpretar lo mexicano de forma contemporánea; compartir una mesa) con texto de `15-content-specification.md §3.2`. No incluye historia personal del restaurante ni de personas.
- **Prioridad:** P1.
- **Criterio de aceptación:** el texto coincide con el contenido aprobado y no menciona fundadores, fechas de fundación ni anécdotas.

### FR-007 · Platillos destacados
- **Actor:** Visitante.
- **Comportamiento:** muestra 4 platillos según BR-047 con foto, nombre, precio, etiqueta principal y enlace a su detalle. Si alguno está Agotado se ve la insignia.
- **Prioridad:** P1.
- **Criterio de aceptación:** se muestran exactamente 4 tarjetas: 2 Favorito de la casa, 1 Nuevo, 1 Recomendado; cada una lleva a `/menu/<slug>` correcto; al ocultar un destacado en admin se sustituye según BR-047.

### FR-008 · Reseñas: protagonista y listado
- **Actor:** Visitante.
- **Comportamiento:** una reseña protagonista (grande) y el resto como lista/carrusel secundario. Cada reseña muestra nombre, avatar, estrellas, fecha, comentario y etiqueta. Se muestra el promedio (4.4 ★ · 10 reseñas). No hay formulario para publicar.
- **Prioridad:** P1.
- **Criterio de aceptación:** las 10 reseñas de `10-data-specification.md §8.1` son alcanzables; las estrellas tienen texto accesible (“5 de 5 estrellas”).

### FR-009 · Reseñas: filtro por estrellas
- **Actor:** Visitante.
- **Comportamiento:** control segmentado Todas · 5 ★ · 4 ★ · 3 ★ o menos. Se combina con FR-010 (BR-052). La reseña protagonista pasa a ser la primera del resultado.
- **Prioridad:** P1.
- **Criterio de aceptación:** filtrar por 5 ★ muestra 5 reseñas; por 3 ★ o menos muestra 1; sin resultados aparece estado vacío con “Quitar filtros”.

### FR-010 · Reseñas: filtro por etiqueta
- **Actor:** Visitante.
- **Comportamiento:** chips con las etiquetas presentes (Cena en pareja, Aniversario, Cumpleaños, Con amigos, En familia, Comida de negocios, Sorpresa) y “Todas”. Selección única.
- **Prioridad:** P1.
- **Criterio de aceptación:** “Con amigos” muestra 2 reseñas; “Con amigos” + 5 ★ muestra 1.

### FR-011 · Reseñas: anterior / siguiente
- **Actor:** Visitante.
- **Comportamiento:** botones Anterior/Siguiente (y gesto de deslizar en touch) cambian la protagonista dentro del resultado filtrado, con transición visual; al llegar al final vuelve al inicio. Indicador “3 / 10”. El cambio se anuncia a lectores de pantalla.
- **Prioridad:** P1.
- **Criterio de aceptación:** con teclado se recorren todas las reseñas del filtro activo; el indicador y el anuncio se actualizan.

### FR-012 · Restaurante y ubicación
- **Actor:** Visitante.
- **Comportamiento:** composición editorial con filosofía breve, dirección ficticia, horarios (Martes a domingo · Comida 13:00–17:00 · Cena 18:00–22:30 · Lunes cerrado) y el mapa (FR-013). Indica si el restaurante está “Abierto ahora” / “Cerrado ahora” según la hora local.
- **Prioridad:** P1.
- **Criterio de aceptación:** los horarios mostrados coinciden con BR-001/BR-002; el indicador abierto/cerrado es correcto en lunes, en servicio y entre turnos (17:00–18:00).

### FR-013 · Mapa simulado interactivo
- **Actor:** Visitante.
- **Comportamiento:** mapa ilustrado del Barrio Antiguo con pin de Mesa y 2–3 referencias (Macroplaza, plaza del barrio). Permite acercar/alejar con botones y arrastre (desplazamiento), y restablecer vista. Tiene etiqueta visible “Mapa ilustrativo”. No depende de servicios externos.
- **Prioridad:** P1.
- **Criterio de aceptación:** el mapa funciona sin conexión a servicios de terceros; los controles son accesibles por teclado; existe descripción textual equivalente.

### FR-014 · Cómo llegar
- **Actor:** Visitante.
- **Comportamiento:** tarjeta con dirección, referencia, botón “Abrir en Google Maps” (acción **simulada**: abre un diálogo que explica que en un restaurante real abriría la app de mapas; etiqueta “Simulado”) y botón “Copiar dirección” (real, confirma con aviso “Dirección copiada”).
- **Prioridad:** P1.
- **Criterio de aceptación:** el botón de mapas muestra la etiqueta “Simulado” antes de pulsarse; copiar coloca la dirección exacta en el portapapeles o, si no hay permiso, muestra la dirección seleccionable.

### FR-015 · CTA de reserva y footer
- **Actor:** Visitante.
- **Comportamiento:** bloque final con mensaje y CTA “Reservar mesa”. Footer con logo, slogan, dirección, horarios, teléfono ficticio (“Llamar” simulado), enlaces de navegación, enlace discreto “Acceso administrador (demo)” y nota “Proyecto de portafolio · Restaurante ficticio”.
- **Prioridad:** P1.
- **Criterio de aceptación:** el footer aparece en todas las pantallas públicas y contiene la nota de proyecto ficticio.

## Menú y detalle

### FR-016 · Menú por categorías
- **Actor:** Visitante.
- **Comportamiento:** muestra los platillos visibles (Disponible o Agotado; no Oculto ni en Papelera) agrupados en las 5 categorías en orden fijo (BR-040) y por `posición` (BR-041). Muestra skeletons mientras cargan datos/imágenes.
- **Prioridad:** P1.
- **Criterio de aceptación:** con datos iniciales se ven 25 platillos en el orden de `10-data-specification.md §7.5`; un platillo oculto desaparece sin recargar manualmente tras el cambio en admin.

### FR-017 · Tabs animadas y scroll inmersivo
- **Actor:** Visitante.
- **Comportamiento:** barra de tabs de categoría fija al hacer scroll. Pulsar una tab desplaza a su sección; al hacer scroll, la tab activa se actualiza (indicador animado). En móvil las tabs se desplazan horizontalmente y la activa se centra.
- **Prioridad:** P1.
- **Criterio de aceptación:** la tab activa siempre corresponde a la sección visible; navegación por teclado con flechas entre tabs; `/menu#postres` abre en Postres.

### FR-018 · Tarjeta de platillo
- **Actor:** Visitante.
- **Comportamiento:** fotografía, nombre, precio (BR-049), descripción, etiquetas; toda la tarjeta enlaza al detalle. **No** muestra ingredientes (BR-043).
- **Prioridad:** P1.
- **Criterio de aceptación:** cada tarjeta muestra los 5 datos y un único destino de enlace; el nombre accesible del enlace es el nombre del platillo.

### FR-019 · Etiquetas de platillo
- **Actor:** Visitante.
- **Comportamiento:** las 7 etiquetas (BR-044) se muestran como insignias con icono y texto (no solo color). **[Supuesto]** En el menú existe un filtro opcional por etiquetas dietéticas (Vegetariano, Vegano, Sin gluten, Picante); ver DP-03.
- **Prioridad:** P1 (filtro: P2).
- **Criterio de aceptación:** cada etiqueta es distinguible sin color; el filtro, si se implementa, no oculta categorías vacías sin explicarlo (“Sin platillos con este filtro en Postres”).

### FR-020 · Platillo agotado
- **Actor:** Visitante. **Precondición:** platillo en Agotado temporalmente.
- **Comportamiento:** sigue visible en su posición, con insignia “Agotado temporalmente”, imagen atenuada y sin tratamientos de disponible (BR-045). En el detalle se indica igual.
- **Prioridad:** P1.
- **Criterio de aceptación:** al marcar agotado en admin, menú, detalle y destacados muestran la insignia; el platillo no desaparece.

### FR-021 · Platillos no visibles
- **Actor:** Sistema.
- **Comportamiento:** platillos Ocultos o en Papelera no aparecen en menú, destacados ni navegación entre platillos; su URL muestra S-10 con enlace al menú.
- **Prioridad:** P1.
- **Criterio de aceptación:** acceder a `/menu/<slug>` de un platillo oculto muestra “Este platillo no está disponible en este momento”.

### FR-022 · Detalle de platillo
- **Actor:** Visitante.
- **Comportamiento:** página dedicada con fotografía grande, nombre, precio, categoría, descripción, etiquetas, estado (si Agotado), CTA “Reservar mesa”, enlace “Volver al menú” (a la categoría del platillo).
- **Prioridad:** P1.
- **Criterio de aceptación:** los 25 platillos tienen detalle accesible por URL propia y por enlace desde el menú.

### FR-023 · Navegación entre platillos
- **Actor:** Visitante.
- **Comportamiento:** en el detalle, enlaces “Anterior” y “Siguiente” dentro del orden del menú (cruzando categorías), omitiendo no visibles; bloque “También te puede gustar” con 3 platillos de la misma categoría.
- **Prioridad:** P2.
- **Criterio de aceptación:** desde el último platillo de Entradas, “Siguiente” lleva al primero de Antojitos.

### FR-024 · Animación de detalle por etapas
- **Actor:** Visitante.
- **Comportamiento:** al hacer scroll, la fotografía cambia de escala y posición, la información aparece por etapas (nombre → precio/etiquetas → descripción → CTA) y elementos gráficos mexicanos se transforman (ver `17-motion-interaction.md §6`). Con *reduced motion*, todo aparece de inmediato.
- **Prioridad:** P2.
- **Criterio de aceptación:** toda la información es visible y legible sin necesidad de hacer scroll completo en móvil (no queda contenido oculto detrás de una animación no disparada).

## Reserva

### FR-025 · Flujo guiado de reserva
- **Actor:** Visitante.
- **Comportamiento:** asistente de 7 pasos en orden fijo: Personas → Horario → Fecha → Mesa → Ocasión → Tus datos → Resumen, seguido de Confirmación. Muestra indicador de progreso (“Paso 3 de 7 · Fecha”), resumen acumulado de lo elegido y botón “Atrás”. Solo se avanza con el paso válido. Se puede volver a cualquier paso ya completado desde el indicador o el resumen.
- **Prioridad:** P0.
- **Criterio de aceptación:** no es posible llegar a un paso posterior sin completar los anteriores (ni por URL); volver atrás conserva los valores elegidos.

### FR-026 · Paso Personas
- **Actor:** Visitante.
- **Comportamiento:** selector 1–6 (botones grandes + control −/+). Opción “Más de 6” muestra el mensaje de BR-009 con “Llamar” simulado. Valor inicial vacío (o `?personas=N`).
- **Prioridad:** P0.
- **Criterio de aceptación:** no se aceptan valores fuera de 1–6; “Más de 6” no permite avanzar.

### FR-027 · Paso Horario
- **Actor:** Visitante.
- **Comportamiento:** muestra los 11 horarios agrupados en Comida y Cena (BR-003), con la duración “Tu mesa es tuya por 1 h 30 min”. Nota: “Confirmamos la disponibilidad al elegir la fecha”.
- **Prioridad:** P0.
- **Criterio de aceptación:** solo existen los 11 horarios; no hay entrada libre de hora.

### FR-028 · Paso Fecha
- **Actor:** Visitante.
- **Comportamiento:** calendario desde hoy hasta hoy + 60 días. Cada día muestra estado para el horario y personas elegidos: Disponible, Pocas mesas (1–2 mesas compatibles libres), Sin disponibilidad, Cerrado (lunes), Horario ya pasado (hoy, BR-007). Los días fuera de ventana no son seleccionables. No se preselecciona ninguna fecha: el usuario elige. Al elegir un día no disponible se explica el motivo y se ofrecen alternativas (FR-037, FR-038).
- **Prioridad:** P0.
- **Criterio de aceptación:** cualquier lunes aparece como Cerrado con motivo; con 6 personas a las 20:00 en DO+4 aparece Sin disponibilidad con alternativas.

### FR-029 · Paso Mesa (mapa)
- **Actor:** Visitante.
- **Comportamiento:** plano visual del restaurante (zonas Ventanal, Interior, Barra, Terraza) con las 10 mesas y su estado para el contexto (BR-013). Leyenda de estados. Seleccionar una mesa Disponible la marca como Seleccionada y muestra su ficha. Existe una vista alternativa en **lista** (misma información, accesible y útil en móvil). No hay asignación automática: el usuario debe elegir.
- **Prioridad:** P0.
- **Criterio de aceptación:** solo se pueden seleccionar mesas Disponibles; mesas Ocupadas, No disponibles y en Mantenimiento muestran su motivo al enfocarlas; no se puede avanzar sin mesa.

### FR-030 · Ficha de mesa
- **Actor:** Visitante.
- **Comportamiento:** al enfocar/seleccionar una mesa: número, capacidad, zona, características (con iconos), descripción corta, estado y, si aplica, motivo (“Ocupada a esta hora”, “Mesa para 6: tu grupo es de 2”, “En mantenimiento”).
- **Prioridad:** P0.
- **Criterio de aceptación:** la ficha muestra todas las características de `10-data-specification.md §4.2` para cada mesa.

### FR-031 · Recomendación de mesas
- **Actor:** Sistema.
- **Comportamiento:** chips opcionales de preferencia (Cerca de ventana, Terraza, Tranquila, Zona social, Más privada, Cerca de barra, Accesible, Ideal para grupos). Se destacan hasta 2 mesas “Recomendada” con motivo según BR-016. Cambiar preferencias recalcula la recomendación. Nunca se ocultan otras mesas.
- **Prioridad:** P0 (recomendación por capacidad) / P1 (preferencias).
- **Criterio de aceptación:** con 2 personas y preferencia “Terraza”, en un horario libre se recomiendan M04 y M07 (M10 no es compatible con 2 personas); el usuario puede elegir una mesa no recomendada.

### FR-032 · Paso Ocasión
- **Actor:** Visitante.
- **Comportamiento:** opciones Ninguna (preseleccionada), Cumpleaños, Aniversario, Sorpresa, Otra. Si ≠ Ninguna, aparece “Instrucciones para la ocasión” (opcional). Si Otra, aparece “¿Qué celebran?” (obligatorio). Aplica la sugerencia no bloqueante de BR-018.
- **Prioridad:** P0.
- **Criterio de aceptación:** con Aniversario y mesa M02 (social/barra) disponible M06, se muestra la sugerencia “Cambiar a M06”; “Mantener mi mesa” continúa sin cambios.

### FR-033 · Paso Tus datos
- **Actor:** Visitante.
- **Comportamiento:** campos Nombre, Teléfono y Comentario/instrucciones especiales (BR-025). No hay campo de email. Validación al salir del campo y al intentar avanzar; errores junto al campo y resumen de errores enfocable.
- **Prioridad:** P0.
- **Criterio de aceptación:** “81-1234-567” muestra “Escribe un teléfono de 10 dígitos”; “+52 (81) 1234 5678” se acepta y se guarda como 8112345678.

### FR-034 · Paso Resumen
- **Actor:** Visitante.
- **Comportamiento:** muestra fecha (formato largo), horario, duración, personas, mesa (con características), ocasión e instrucciones, nombre, teléfono, comentario. Cada bloque tiene “Editar” que lleva al paso correspondiente y regresa al resumen. Botón “Confirmar reserva”.
- **Prioridad:** P0.
- **Criterio de aceptación:** todos los datos coinciden con lo elegido; editar el horario y volver revalida mesa y fecha (si la mesa deja de estar disponible, se pide elegir otra).

### FR-035 · Confirmación y código
- **Actor:** Sistema.
- **Comportamiento:** al confirmar: revalida (FR-036), comprueba duplicado (BR-030), genera código (BR-027), guarda la reserva en estado Pendiente (BR-028) con evento de historial, y muestra S-05 con mensaje premium, código destacado (copiable), fecha/hora, personas, mesa, ocasión (si existe), nombre y estado. Acciones: “Ver mi reserva”, “Copiar código”, “Agregar al calendario” (**simulado**), “Volver al inicio”. La reserva queda verificada en la sesión para acceder a S-07 sin reingresar datos.
- **Prioridad:** P0.
- **Criterio de aceptación:** tras confirmar, la reserva aparece en admin y en Mis reservas con el código mostrado; la mesa aparece Ocupada para ese contexto en un nuevo flujo; recargar S-05 no duplica la reserva.

### FR-036 · Revalidación y conflicto simultáneo
- **Actor:** Sistema.
- **Comportamiento:** al pulsar “Confirmar reserva” se recalcula la disponibilidad con los datos persistidos más recientes. Si la mesa ya no está disponible, aplica BR-023 con el mensaje “La disponibilidad acaba de cambiar”. El panel de demo puede provocar este caso (FR-068).
- **Prioridad:** P0.
- **Criterio de aceptación:** con dos pestañas eligiendo la misma mesa/horario, la segunda en confirmar recibe el mensaje y vuelve al mapa con la mesa marcada Ocupada y sus demás datos conservados.

### FR-037 · Sin disponibilidad
- **Actor:** Sistema.
- **Comportamiento:** si una fecha elegida no tiene mesas compatibles libres para el horario, se muestra mensaje claro y alternativas según BR-024 (hasta 3 horarios esa fecha y hasta 3 fechas con ese horario) y controles “Cambiar fecha” y “Cambiar número de personas”. Elegir una alternativa actualiza horario/fecha y continúa.
- **Prioridad:** P0.
- **Criterio de aceptación:** en el escenario DO+4 · 20:00 · 6 personas se ofrecen horarios alternativos esa fecha (p. ej. 18:00, 18:30, 21:00 si están libres) y fechas alternativas a las 20:00.

### FR-038 · Fuera de horario
- **Actor:** Sistema.
- **Comportamiento:** para lunes, fechas pasadas, fuera de ventana u horarios de hoy ya no válidos, se explica el motivo (“Los lunes descansamos”, “Este horario ya pasó o está muy próximo”) y se ofrecen la fecha operativa más cercana y/o los horarios válidos restantes de hoy.
- **Prioridad:** P0.
- **Criterio de aceptación:** al elegir un lunes, se ofrecen el domingo anterior (si está en ventana y no es pasado) y el martes siguiente con el mismo horario.

### FR-039 · Conservación del progreso
- **Actor:** Sistema.
- **Comportamiento:** el borrador del flujo se conserva durante la sesión de la pestaña (recarga incluida). Al salir del flujo con datos capturados se pide confirmación (“¿Salir? Perderás tu selección”). Cambiar un paso anterior invalida solo lo incompatible: cambiar personas limpia la mesa si deja de ser compatible; cambiar horario o fecha limpia la mesa si deja de estar disponible.
- **Prioridad:** P1.
- **Criterio de aceptación:** recargar en el paso Datos conserva los pasos 1–5; cambiar de 2 a 5 personas limpia la mesa M01 elegida y avisa por qué.

## Mis reservas

### FR-040 · Acceso con código y teléfono
- **Actor:** Cliente.
- **Comportamiento:** formulario con Código de reserva y Teléfono (BR-031). Si coinciden, abre S-07 y guarda la verificación en la sesión. Si no, muestra E-06 sin indicar qué campo falla y conserva lo escrito.
- **Prioridad:** P0.
- **Criterio de aceptación:** `mesa-4f7k` + `81 1234 5678` abre la reserva de Valeria Treviño; `MESA-4F7K` + `8100000000` muestra E-06.

### FR-041 · Detalle de mi reserva
- **Actor:** Cliente. **Precondición:** reserva verificada.
- **Comportamiento:** muestra estado (con explicación breve), código, fecha, horario, duración, personas, mesa y características, ocasión e instrucciones, nombre, teléfono enmascarado, comentario, última modificación. Acciones según estado y plazo (BR-032): Modificar, Cancelar; deshabilitadas con motivo cuando no aplican. En Cancelada: “Reservar de nuevo”. Enlace “Consultar otra reserva”.
- **Prioridad:** P0.
- **Criterio de aceptación:** una reserva Completada o Cancelada no muestra acciones de cambio; una reserva a menos de 2 h las muestra deshabilitadas con el motivo.

### FR-042 · Modificar reserva (cliente)
- **Actor:** Cliente. **Precondición:** BR-032.
- **Comportamiento:** S-08.1 pregunta qué cambiar: “Fecha, horario, personas o mesa” (abre el flujo guiado en modo edición con valores precargados, BR-033/BR-034) o “Datos y ocasión” (formulario directo). El resumen muestra “Antes / Después”. Al confirmar: revalida, pasa a Modificada, registra historial (BR-035), muestra aviso de éxito y regresa a S-07.
- **Prioridad:** P0.
- **Criterio de aceptación:** cambiar MESA-4F7K de 20:00 a 21:00 libera M06 a las 20:00 y la ocupa a las 21:00 (visible en admin); el estado es Modificada y el código no cambia.

### FR-043 · Cancelar reserva (cliente)
- **Actor:** Cliente. **Precondición:** BR-032.
- **Comportamiento:** diálogo con el resumen de la reserva y botones “Sí, cancelar reserva” / “Mantener mi reserva” (foco inicial en mantener). Al confirmar: estado Cancelada, mesa liberada, historial, S-09 “Tu reserva fue cancelada”.
- **Prioridad:** P0.
- **Criterio de aceptación:** tras cancelar, la mesa aparece Disponible para ese contexto en un nuevo flujo y en el mapa de admin sin recargar.

### FR-044 · Reservar de nuevo
- **Actor:** Cliente.
- **Comportamiento:** desde S-09 o una reserva Cancelada, “Reservar de nuevo” abre `/reservar?personas=N` con el número de personas anterior.
- **Prioridad:** P1.
- **Criterio de aceptación:** el paso 1 aparece con N preseleccionado y editable.

## Disponibilidad y persistencia

### FR-045 · Cálculo dinámico de disponibilidad
- **Actor:** Sistema.
- **Comportamiento:** calcula estados de mesa y disponibilidad de horarios/fechas aplicando BR-001–BR-024 sobre los datos persistidos. Se usa igual en el flujo de reserva, en la modificación y en admin (misma lógica, un solo punto de verdad).
- **Prioridad:** P0.
- **Criterio de aceptación:** los casos de la tabla de pruebas T-030–T-039 dan el resultado esperado.

### FR-046 · Persistencia local y datos iniciales
- **Actor:** Sistema.
- **Comportamiento:** en la primera visita genera los datos iniciales (BR-055). Todo cambio se guarda localmente y sobrevive a recargas (BR-054). Si el almacenamiento falla, funciona en memoria con aviso G-05.
- **Prioridad:** P0.
- **Criterio de aceptación:** crear una reserva, recargar y cerrar/reabrir el navegador conserva la reserva; lo mismo para cambios de menú y bloqueos.

### FR-047 · Sincronización entre pestañas
- **Actor:** Sistema.
- **Comportamiento:** si los datos cambian en otra pestaña del mismo navegador, las vistas abiertas (mapa, calendario, dashboard, lista admin, menú) se actualizan sin recargar.
- **Prioridad:** P1.
- **Criterio de aceptación:** con admin abierto en una pestaña y el sitio en otra, crear una reserva actualiza el dashboard en ≤ 2 s.

### FR-048 · Restablecer demo
- **Actor:** Visitante / Admin.
- **Comportamiento:** desde G-03 y desde el panel admin, “Restablecer datos de demo” pide confirmación y aplica BR-056.
- **Prioridad:** P0.
- **Criterio de aceptación:** tras restablecer, existen exactamente los 14 registros de reservas y 25 platillos iniciales y ningún bloqueo.

## Admin

### FR-049 · Login demo
- **Actor:** Admin.
- **Comportamiento:** formulario Usuario y Contraseña con aviso visible “Acceso de demostración: admin / mesa-demo”. Credenciales correctas → A-02 (o el destino solicitado). Incorrectas → E-19.
- **Prioridad:** P0.
- **Criterio de aceptación:** solo `admin` / `mesa-demo` da acceso; el usuario no distingue mayúsculas y la contraseña sí.

### FR-050 · Rutas protegidas y cierre de sesión
- **Actor:** Sistema.
- **Comportamiento:** toda ruta `/admin/*` excepto login requiere sesión (BR-053). “Cerrar sesión” la termina y lleva a A-01.
- **Prioridad:** P0.
- **Criterio de aceptación:** abrir `/admin/reservas` sin sesión redirige a login y, tras entrar, vuelve a `/admin/reservas`.

### FR-051 · Indicadores del dashboard
- **Actor:** Admin.
- **Comportamiento:** para la fecha seleccionada (por defecto hoy; si es lunes, indica “Hoy cerrado” y ofrece ir al siguiente día operativo): Reservas del día (no canceladas), Mesas ocupadas / disponibles en el horario seleccionado, conteo Pendientes / Completadas / Canceladas del día, % de ocupación del día y Próxima reserva. Definiciones exactas en `18-admin-specification.md §3`.
- **Prioridad:** P0.
- **Criterio de aceptación:** con datos iniciales y fecha DO0: 7 reservas del día, 2 Pendientes, 0 Completadas, 0 Canceladas.

### FR-052 · Mapa del restaurante en dashboard
- **Actor:** Admin.
- **Comportamiento:** mismo plano que el cliente, con selector de fecha y horario (por defecto el horario en curso o el siguiente). Cada mesa muestra estado y, si está ocupada, nombre y código de la reserva. Clic en una mesa: panel con reservas de esa mesa ese día y acción Bloquear/Desbloquear (A-10).
- **Prioridad:** P0.
- **Criterio de aceptación:** modificar una reserva de 19:00 a 21:00 cambia el mapa en ambos horarios sin recargar.

### FR-053 · Gestión de reservas: lista, búsqueda y filtros
- **Actor:** Admin.
- **Comportamiento:** tabla en desktop / tarjetas en móvil. Búsqueda por nombre o código (parcial, sin distinguir mayúsculas ni acentos). Filtros: fecha (Hoy, Mañana, Próximos 7 días, Fecha específica, Todas) y estado (multiselección). Orden por fecha-hora ascendente. Avisos por fila (“Mesa bloqueada — reasignar”, “Pendiente de cerrar”). Estado vacío con “Limpiar filtros”.
- **Prioridad:** P0.
- **Criterio de aceptación:** buscar “garza” encuentra MESA-9QX2; filtrar Cancelada muestra MESA-N7YB.

### FR-054 · Detalle de reserva (admin)
- **Actor:** Admin.
- **Comportamiento:** panel con todos los datos (teléfono completo), estado, avisos e historial cronológico. Acciones disponibles según BR-037.
- **Prioridad:** P0.
- **Criterio de aceptación:** el historial de MESA-Z8CE muestra “Creada” y “Modificada (19:30 → 20:00)”.

### FR-055 · Confirmar y completar
- **Actor:** Admin.
- **Comportamiento:** “Confirmar” (Pendiente/Modificada → Confirmada) y “Marcar como completada” (si el inicio ya ocurrió) con aviso de éxito y registro en historial. Si la reserva cambió en otra pestaña antes de la acción, se muestra E-29 y se refresca.
- **Prioridad:** P0.
- **Criterio de aceptación:** “Completar” está deshabilitado con motivo para reservas futuras.

### FR-056 · Modificar reserva (admin)
- **Actor:** Admin.
- **Comportamiento:** formulario completo (fecha, horario, personas, mesa con mini-mapa, datos, ocasión) con validación de disponibilidad en vivo; sin plazo de 2 h (BR-037). Guardar → Modificada + historial (actor Admin).
- **Prioridad:** P0.
- **Criterio de aceptación:** mover MESA-H3N8 de M01 a M06 en el mismo horario libera M01 y ocupa M06 en el mapa.

### FR-057 · Cancelar reserva (admin)
- **Actor:** Admin.
- **Comportamiento:** diálogo de confirmación; estado Cancelada; mesa liberada; historial.
- **Prioridad:** P0.
- **Criterio de aceptación:** la reserva cancelada deja de contar en “Reservas del día” y aparece en el conteo de Canceladas.

### FR-058 · Lista de menú (admin)
- **Actor:** Admin.
- **Comportamiento:** platillos agrupados por categoría en orden fijo, con miniatura, nombre, precio, etiquetas, disponibilidad y acciones (Editar, Marcar agotado / Marcar disponible, Ocultar / Mostrar, Eliminar). Búsqueda por nombre y filtros por categoría y disponibilidad. Botón “Nuevo platillo” y acceso a “Papelera (n)”.
- **Prioridad:** P0.
- **Criterio de aceptación:** la lista refleja los 25 platillos iniciales; cada acción rápida se refleja en el sitio público sin recargar.

### FR-059 · Crear platillo
- **Actor:** Admin.
- **Comportamiento:** A-07 con campos de BR-042, selector de imagen (biblioteca o subir, FR-064) y vista previa de la tarjeta pública. Guardar lo agrega al final de su categoría (BR-041).
- **Prioridad:** P0.
- **Criterio de aceptación:** un platillo nuevo aparece en `/menu` en su categoría, al final, con su detalle accesible.

### FR-060 · Editar platillo
- **Actor:** Admin.
- **Comportamiento:** mismo formulario precargado; permite cambiar nombre, categoría, precio, descripción, etiquetas, imagen y disponibilidad. Aviso si hay cambios sin guardar al salir.
- **Prioridad:** P0.
- **Criterio de aceptación:** cambiar el precio del Taco de Short Rib a $199 se ve en menú, detalle y destacados.

### FR-061 · Ocultar / mostrar temporalmente
- **Actor:** Admin.
- **Comportamiento:** alterna Oculto ↔ estado anterior (BR-045).
- **Prioridad:** P0.
- **Criterio de aceptación:** un platillo oculto no aparece en `/menu` y su URL muestra S-10; al mostrarlo vuelve a su posición.

### FR-062 · Marcar agotado
- **Actor:** Admin.
- **Comportamiento:** alterna Disponible ↔ Agotado temporalmente (FR-020).
- **Prioridad:** P0.
- **Criterio de aceptación:** ver FR-020.

### FR-063 · Eliminar, papelera y restaurar
- **Actor:** Admin.
- **Comportamiento:** BR-046. A-08 lista platillos eliminados con fecha, “Restaurar” y “Eliminar definitivamente”. Aviso con “Deshacer” durante 8 s tras eliminar.
- **Prioridad:** P0.
- **Criterio de aceptación:** eliminar → aparece en papelera y no en el sitio; restaurar → vuelve al sitio al final de su categoría; eliminar definitivamente pide segunda confirmación.

### FR-064 · Imágenes de platillos
- **Actor:** Admin.
- **Comportamiento:** en A-07: elegir una imagen de la biblioteca (25 iniciales + subidas) o subir una nueva (BR-051) con vista previa, recorte centrado 4:5 sugerido y texto alternativo obligatorio. Errores E-17/E-23.
- **Prioridad:** P0.
- **Criterio de aceptación:** subir una imagen PNG de 2 MB la muestra en el menú tras guardar y persiste tras recargar.

### FR-065 · Bloqueo de mesas
- **Actor:** Admin.
- **Comportamiento:** A-09 lista las 10 mesas con capacidad, características y estado de bloqueo. A-10 permite elegir Mantenimiento o No disponible y nota (BR-015). Si hay reservas activas futuras en la mesa, las lista con enlace a modificarlas. “Desbloquear” retira el bloqueo.
- **Prioridad:** P0.
- **Criterio de aceptación:** bloquear M06 como Mantenimiento con nota “Silla dañada” hace que M06 aparezca en Mantenimiento en el flujo de reserva para cualquier fecha; MESA-4F7K muestra el aviso “Mesa bloqueada — reasignar”.

## Transversales

### FR-066 · Estados de carga con skeleton
- **Actor:** Sistema.
- **Comportamiento:** listas, tarjetas, mapa, calendario e imágenes muestran skeletons con la forma del contenido final; acciones que guardan muestran estado de progreso en el botón. **[Supuesto]** Se simula una latencia breve (300–800 ms) en consultas de disponibilidad y guardados para que la interfaz demuestre estos estados; nunca > 1.2 s.
- **Prioridad:** P1.
- **Criterio de aceptación:** ninguna acción deja la UI sin respuesta visual por más de 100 ms; no hay saltos de layout al sustituir el skeleton.

### FR-067 · Mensajes de error consistentes
- **Actor:** Sistema.
- **Comportamiento:** todos los errores usan el catálogo de `15-content-specification.md §9` (qué pasó + qué hacer), el mismo componente visual y se anuncian a lectores de pantalla.
- **Prioridad:** P0.
- **Criterio de aceptación:** cada caso de `12-error-edge-cases.md` muestra el texto definido y al menos una acción de salida.

### FR-068 · “Prueba estas funciones”
- **Actor:** Visitante.
- **Comportamiento:** botón discreto flotante que abre un panel con: reservar en 2 minutos; consultar la reserva demo (MESA-4F7K / 81 1234 5678, con “Abrir con estos datos”); probar sin disponibilidad (6 personas · 20:00 · fecha DO+4 mostrada como fecha real); probar un lunes cerrado; interruptor “Simular reserva simultánea” (al confirmar, otra reserva “Demo” ocupa la mesa elegida para provocar FR-036); acceso admin (admin / mesa-demo); “Restablecer datos de demo”.
- **Prioridad:** P1.
- **Criterio de aceptación:** cada elemento del panel lleva al estado descrito; el panel no tapa CTAs ni campos en móvil y se cierra con Escape.

### FR-069 · Movimiento reducido
- **Actor:** Sistema.
- **Comportamiento:** con `prefers-reduced-motion` activo, se desactivan parallax, rotaciones, transformaciones por scroll y transiciones largas; se mantienen cambios de opacidad breves (≤ 150 ms). **[Supuesto]** Además hay un interruptor “Reducir movimiento” en el footer que aplica lo mismo.
- **Prioridad:** P0.
- **Criterio de aceptación:** con la preferencia activa, el taco no se mueve y ninguna animación supera 150 ms.

### FR-070 · Responsive mobile-first
- **Actor:** Sistema.
- **Comportamiento:** todas las pantallas funcionan desde 360 px de ancho sin scroll horizontal, según `13-responsive-specification.md`.
- **Prioridad:** P0.
- **Criterio de aceptación:** la matriz de dispositivos de `20-testing-acceptance.md §5` pasa sin errores bloqueantes.

### FR-071 · Accesibilidad
- **Actor:** Sistema.
- **Comportamiento:** cumplimiento de `14-accessibility.md` (objetivo WCAG 2.2 AA).
- **Prioridad:** P0.
- **Criterio de aceptación:** flujo completo de reserva, Mis reservas y admin operable solo con teclado y con lector de pantalla; 0 errores críticos en auditoría automática.

### FR-072 · Página no encontrada
- **Actor:** Visitante.
- **Comportamiento:** S-10 con mensaje de marca y enlaces a Inicio, Menú y Reservar. Variante para platillo no disponible.
- **Prioridad:** P1.
- **Criterio de aceptación:** cualquier ruta inexistente muestra S-10 con navegación funcional.
