# 06 · Especificación de pantallas

> Cada pantalla o sección: propósito, contenido, acciones, estados, navegación y conexiones. IDs definidos en `05-information-architecture.md`. Requisitos (`FR`), reglas (`BR`), estados (`11`) y textos (`15`) se referencian por ID. Composición por tamaño de pantalla: `13-responsive-specification.md`. Motion: `17-motion-interaction.md`.

---

## Elementos globales

### G-01 · Header
- **Propósito:** orientación y acceso a reservar desde cualquier punto.
- **Contenido:** logo Mesa; Inicio, Menú, Reservar, Mis reservas; CTA “Reservar mesa”.
- **Acciones:** navegar; abrir menú móvil.
- **Estados:** transparente sobre el Hero → sólido al hacer scroll; oculto al bajar / visible al subir; activo por ruta; CTA oculto en `/reservar*`.
- **Requisitos:** FR-001, FR-002, FR-003.

### G-02 · Footer
- **Contenido:** logo y slogan; dirección, horarios, teléfono (Llamar `[Simulado]`); navegación; interruptor “Reducir movimiento”; “Acceso administrador (demo)”; nota de proyecto ficticio.
- **Requisitos:** FR-015, FR-069.

### G-03 · “Prueba estas funciones”
- **Propósito:** que un evaluador descubra y compruebe las funciones clave sin instrucciones externas.
- **Contenido:** 7 elementos de `15-content-specification.md §11`.
- **Acciones:** abrir/cerrar (botón flotante discreto en esquina inferior izquierda; en admin, dentro del menú de usuario); lanzar escenarios; activar “Simular reserva simultánea”; restablecer demo (con confirmación).
- **Estados:** cerrado (botón), abierto (panel lateral en desktop, hoja inferior en móvil), interruptor activo (indicador “Simulación activa” en el paso Resumen).
- **Conexiones:** S-04 (con parámetros de escenario), S-06 (precargado), A-01.
- **Requisitos:** FR-048, FR-068.

### G-04 · Avisos y diálogos
- **Toast:** esquina inferior (móvil: parte inferior centrada, sobre la barra de acciones), 5 s, con acción opcional (Deshacer), anunciado a lectores de pantalla.
- **Diálogo de confirmación:** título, consecuencia, acción destructiva a la derecha, foco inicial en la opción segura.

### G-05 · Aviso de persistencia no disponible
- Banda superior persistente con E-16; se puede minimizar pero no ocultar.

---

## Sitio público

### S-01 · Inicio
- **Propósito:** comunicar identidad, generar deseo y llevar a reservar.
- **Secciones (orden fijo):** S-01.1 → S-01.6 + G-02.
- **Navegación:** anclas; CTA a `/reservar`; destacados a `/menu/<slug>`; “Ver menú” a `/menu`.

#### S-01.1 · Hero
- **Contenido:** H1 slogan, subtítulo, CTA primario/secundario, animación gráfica de fondo detrás del texto, taco 3D lateral, indicador de scroll.
- **Composición:** texto a la izquierda ocupando ~55–60 % (desktop); taco a la derecha. Sin foto a pantalla completa.
- **Estados:** ver `11 §5.1`.
- **Requisitos:** FR-004, FR-005.

#### S-01.2 · Concepto
- **Contenido:** eyebrow, título, texto y tres ideas (Raíz, Presente, Mesa). El taco hace su último movimiento de transición aquí y se retira.
- **Requisitos:** FR-006.

#### S-01.3 · Destacados
- **Contenido:** 4 tarjetas (foto 4:5, insignia, nombre, precio, descripción corta), enlace “Ver menú completo”.
- **Acciones:** abrir detalle.
- **Estados:** cargando (skeleton), agotado.
- **Requisitos:** FR-007.

#### S-01.4 · Reseñas
- **Contenido:** título, promedio, filtros (estrellas y etiqueta), reseña protagonista (avatar, nombre, estrellas, fecha, etiqueta, comentario grande), lista secundaria (resto del resultado filtrado, compacta), controles Anterior/Siguiente, indicador “n / total”, nota “Reseñas de ejemplo”.
- **Acciones:** filtrar, navegar, elegir una reseña de la lista para hacerla protagonista.
- **Estados:** filtrado vacío (E-28), transición.
- **Requisitos:** FR-008 – FR-011.

#### S-01.5 · Restaurante y ubicación
- **Contenido:** título, texto de filosofía del espacio, dirección + referencia, horarios, indicador abierto/cerrado, mapa ilustrado interactivo, tarjeta “Cómo llegar”.
- **Acciones:** acercar/alejar/arrastrar/centrar mapa; Abrir en Google Maps `[Simulado]`; Copiar dirección.
- **Estados:** mapa cargando, mapa error (E-30), copiado.
- **Requisitos:** FR-012 – FR-014.

#### S-01.6 · CTA de reserva
- **Contenido:** título, texto, CTA.
- **Requisitos:** FR-015.

### S-02 · Menú
- **Propósito:** explorar la oferta completa y llegar al detalle.
- **Contenido:** título + intro; barra de tabs fija (5 categorías); secciones por categoría con encabezado y tarjetas (FR-018); nota de precios; filtro de etiquetas dietéticas (P2, DP-03).
- **Acciones:** cambiar de tab (desplaza), scroll (actualiza tab), abrir detalle.
- **Estados:** cargando (skeleton de 6 tarjetas), con datos, categoría vacía (EC-80), agotado por tarjeta.
- **Navegación:** G-01; tarjeta → S-03.
- **Requisitos:** FR-016 – FR-021.

### S-03 · Detalle de platillo
- **Propósito:** presentar un platillo con una experiencia visual inmersiva.
- **Contenido:** “Volver al menú”; fotografía grande; categoría; nombre; precio; etiquetas; descripción; insignia y texto de agotado si aplica; elementos gráficos mexicanos animados; CTA “Reservar mesa”; Anterior/Siguiente; “También te puede gustar” (3).
- **Acciones:** volver, navegar entre platillos, reservar.
- **Estados:** cargando (skeleton de imagen + texto), agotado, no disponible → S-10.
- **Requisitos:** FR-022 – FR-024.

### S-04 · Reservar (flujo guiado)

Estructura común a los 7 pasos:

- **Encabezado del flujo:** “Reservar mesa”, indicador de progreso (7 segmentos con nombre del paso actual), botón “Salir”.
- **Área principal:** pregunta del paso y opciones.
- **Resumen “Tu reserva”:** columna lateral (desktop) o barra inferior plegable (móvil) con lo elegido y “Editar” por dato.
- **Barra de acciones:** “Atrás” y CTA principal (deshabilitado con motivo textual hasta que el paso es válido).
- **Requisitos comunes:** FR-025, FR-039.

#### S-04.1 · Personas
- **Contenido:** botones 1–6 (+ control −/+), opción “Más de 6”.
- **Estados:** sin selección, seleccionado, “Más de 6” (E-13).
- **Requisitos:** FR-026 · **Reglas:** BR-008, BR-009.

#### S-04.2 · Horario
- **Contenido:** grupo Comida (4) y Cena (7), duración 1 h 30, nota de disponibilidad.
- **Requisitos:** FR-027 · **Reglas:** BR-003, BR-004.

#### S-04.3 · Fecha
- **Contenido:** calendario mensual (desktop: 2 meses; móvil: 1 mes y tira de próximos 14 días), leyenda de estados de día, contexto “{N} personas · {HH:MM}”.
- **Acciones:** elegir día; ver motivo en días no disponibles; elegir alternativa (horario o fecha); cambiar personas.
- **Estados:** cargando (skeleton), día seleccionado, panel de motivo + alternativas (E-01, E-02, E-03, E-04).
- **Requisitos:** FR-028, FR-037, FR-038 · **Reglas:** BR-001, BR-006, BR-007, BR-020, BR-024.

#### S-04.4 · Mesa
- **Contenido:** plano del restaurante con zonas rotuladas (Ventanal, Interior, Barra, Terraza, Entrada, Cocina como referencia), 10 mesas con forma según capacidad, número y estado; leyenda; chips de preferencia; insignias “Recomendada”; ficha de mesa; alternancia “Ver como lista”.
- **Vista lista:** una fila por mesa: número, capacidad, zona, características, estado, motivo, “Elegir”. Orden: Recomendadas, Disponibles, resto.
- **Acciones:** elegir mesa, cambiar preferencias, alternar vista, continuar.
- **Estados:** cargando (skeleton del plano), sin selección, seleccionada, conflicto en vivo (E-05), todas ocupadas (→ vuelve a S-04.3 con E-01).
- **Requisitos:** FR-029 – FR-031 · **Reglas:** BR-010, BR-013 – BR-016.

#### S-04.5 · Ocasión
- **Contenido:** 5 opciones con icono; campo de instrucciones (si ≠ Ninguna); “¿Qué celebran?” (si Otra); tarjeta de sugerencia de mesa (BR-018).
- **Requisitos:** FR-032 · **Reglas:** BR-017, BR-018, BR-026.

#### S-04.6 · Tus datos
- **Contenido:** Nombre, Teléfono, Comentario (contador), nota “No pedimos correo”.
- **Estados:** errores por campo y resumen de errores.
- **Requisitos:** FR-033 · **Reglas:** BR-025.

#### S-04.7 · Resumen
- **Contenido:** bloques Fecha y horario (con fin estimado), Personas, Mesa (con características), Ocasión, Tus datos; cada uno con “Editar”; indicador “Simulación activa” si G-03 lo activó; CTA “Confirmar reserva”.
- **Estados:** listo, confirmando, conflicto (→ S-04.4 con E-05), duplicado (E-15).
- **Requisitos:** FR-034 – FR-036 · **Reglas:** BR-022, BR-023, BR-027, BR-028, BR-030.

### S-05 · Confirmación
- **Propósito:** cerrar con una sensación premium y dejar claro el código.
- **Contenido:** título, mensaje personalizado, código grande con “Copiar código”, datos de la reserva, estado Pendiente con explicación, acciones (Ver mi reserva, Agregar al calendario `[Simulado]`, Volver al inicio), nota SMS `[Simulado]`.
- **Estados:** éxito; sin reserva reciente → `/reservar`.
- **Requisitos:** FR-035.

### S-06 · Mis reservas · acceso
- **Contenido:** título, texto, campos Código y Teléfono, CTA “Buscar mi reserva”, ayuda de código perdido `[Simulado]`, CTA secundario “Reservar mesa”.
- **Estados:** vacío, validando formato (E-07, E-08), buscando, no encontrado (E-06).
- **Navegación:** éxito → S-07.
- **Requisitos:** FR-040 · **Reglas:** BR-031.

### S-07 · Mi reserva
- **Contenido:** insignia de estado + descripción; código; fecha, horario (inicio–fin), personas; mesa con características y mini-plano con la mesa resaltada; ocasión e instrucciones; nombre, teléfono enmascarado, comentario; “Última actualización”; acciones.
- **Acciones:** Modificar reserva (→ S-08), Cancelar reserva (→ S-09), Reservar de nuevo (si final), Consultar otra reserva (→ S-06).
- **Estados:** modificable; no modificable (plazo, E-14); final.
- **Requisitos:** FR-041 · **Reglas:** BR-029, BR-032.

### S-08 · Modificar reserva
- **S-08.1 ¿Qué quieres cambiar?:** dos opciones (flujo guiado / datos y ocasión).
- **S-08.2 Flujo guiado en modo edición:** mismos pasos S-04.1–S-04.7 con valores actuales precargados; el paso Horario muestra disponibilidad por horario para la fecha actual (11 §4.2); la mesa actual aparece Seleccionada (BR-034); el Resumen muestra Antes/Después; CTA “Guardar cambios”.
- **S-08.3 Datos y ocasión:** formulario directo con Nombre, Teléfono, Ocasión (+ instrucciones), Comentario; Antes/Después; “Guardar cambios”.
- **Estados:** sin cambios (CTA deshabilitado), guardando, conflicto (E-05), duplicado (E-15), éxito (toast + S-07).
- **Requisitos:** FR-042 · **Reglas:** BR-033 – BR-035.

### S-09 · Cancelar reserva
- **Diálogo:** título, consecuencia, resumen compacto, “Sí, cancelar reserva” / “Mantener mi reserva”.
- **Pantalla resultado:** “Tu reserva fue cancelada.”, código, “Reservar de nuevo”, “Volver al inicio”.
- **Requisitos:** FR-043, FR-044 · **Reglas:** BR-036.

### S-10 · No encontrado
- **Contenido:** título E-25 (o E-24 en platillo), ilustración mínima (mesa vacía), enlaces Inicio, Menú, Reservar.
- **Requisitos:** FR-072.

---

## Panel administrativo

Estructura común: barra lateral (desktop) / barra superior con menú (móvil) con Dashboard, Reservas, Menú, Mesas, Ver sitio, Cerrar sesión; etiqueta permanente “Demo”; acceso a “Restablecer datos de demo” en el menú de usuario. Detalle completo: `18-admin-specification.md`.

### A-01 · Acceso
- **Contenido:** logo, título, Usuario, Contraseña (mostrar/ocultar), “Entrar”, aviso de credenciales demo.
- **Estados:** validando, error (E-19).
- **Requisitos:** FR-049, FR-050.

### A-02 · Dashboard
- **Contenido:** selector de fecha (Hoy por defecto) y de horario; 8 indicadores (FR-051); mapa del restaurante (FR-052); lista “Próximas reservas del día” (5) con acceso a detalle; avisos (“2 reservas pendientes de confirmar”, “1 reserva pendiente de cerrar”).
- **Acciones:** cambiar fecha/horario; abrir mesa (panel con reservas del día + Bloquear/Desbloquear → A-10); abrir reserva (→ A-04).
- **Estados:** cargando, día cerrado (EC-83), día sin reservas.
- **Requisitos:** FR-051, FR-052.

### A-03 · Reservas
- **Contenido:** búsqueda; filtros de fecha y estado; contador de resultados; tabla (Código, Fecha, Hora, Nombre, Personas, Mesa, Ocasión, Estado, avisos, acciones) o tarjetas en móvil.
- **Acciones:** buscar, filtrar, abrir detalle, acciones rápidas (Confirmar, Cancelar).
- **Estados:** cargando, sin resultados (E-28), acción en curso.
- **Requisitos:** FR-053.

### A-04 · Detalle de reserva
- **Contenido:** estado, código, todos los datos (teléfono completo), avisos, historial, acciones por BR-037.
- **Requisitos:** FR-054 – FR-057.

### A-05 · Modificar reserva (admin)
- **Contenido:** formulario completo en una sola vista con validación de disponibilidad en vivo y mini-mapa para la mesa; Antes/Después; Guardar / Cancelar edición.
- **Requisitos:** FR-056.

### A-06 · Menú (admin)
- **Contenido:** búsqueda, filtros (categoría, disponibilidad), “Nuevo platillo”, “Papelera (n)”, grupos por categoría con filas/tarjetas de platillo.
- **Requisitos:** FR-058, FR-061 – FR-063.

### A-07 · Editor de platillo
- **Contenido:** formulario (BR-042), selector de imagen (biblioteca/subir, alt), disponibilidad, vista previa de tarjeta y detalle.
- **Requisitos:** FR-059, FR-060, FR-064.

### A-08 · Papelera
- **Contenido:** lista de platillos eliminados (miniatura, nombre, categoría, fecha de eliminación), Restaurar, Eliminar definitivamente; vacío “La papelera está vacía.”
- **Requisitos:** FR-063.

### A-09 · Mesas
- **Contenido:** plano + lista de las 10 mesas (capacidad, zona, características, estado de bloqueo, nota, reservas próximas).
- **Acciones:** Bloquear / Desbloquear (→ A-10).
- **Requisitos:** FR-065.

### A-10 · Diálogo de bloqueo
- **Contenido:** mesa, tipo (Mantenimiento / No disponible), nota (opcional), aviso de reservas afectadas con enlaces, Bloquear / Cancelar.
- **Requisitos:** FR-065 · **Reglas:** BR-015, BR-038.
