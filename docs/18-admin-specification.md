# 18 · Especificación del panel administrativo

> Panel de demostración para operar Mesa: reservas, mesas y menú. **No es autenticación de producción** (BR-053). Pantallas `A-xx` en `06-screen-specification.md`; requisitos FR-049 – FR-065; reglas BR-015, BR-029, BR-037 – BR-047, BR-051, BR-053 – BR-056.

## 1. Acceso (A-01)

- Ruta `/admin/login`. Campos Usuario y Contraseña (con mostrar/ocultar).
- Credenciales: `admin` / `mesa-demo` (usuario sin distinguir mayúsculas, contraseña exacta).
- Aviso visible: “Acceso de demostración: usuario admin, contraseña mesa-demo. No es un sistema de autenticación real.”
- Error: E-19; se limpia la contraseña y el foco va al campo usuario. Sin bloqueo por intentos (demo).
- Sesión por pestaña; termina con “Cerrar sesión”, al cerrar la pestaña o al restablecer la demo.
- Rutas protegidas → login y regreso al destino (FR-050).

## 2. Estructura general

- Navegación: Dashboard · Reservas · Menú · Mesas · Ver sitio · Cerrar sesión.
- Etiqueta “Demo” permanente junto al logo.
- Menú de usuario: “Prueba estas funciones”, “Restablecer datos de demo”, “Cerrar sesión”.
- Todas las vistas se actualizan en vivo ante cambios desde otra pestaña (FR-047).

## 3. Dashboard (A-02)

### 3.1 Controles
- **Fecha:** Hoy (por defecto), anterior/siguiente día, selector de fecha. Si es lunes: “Hoy cerrado” + enlace al siguiente día operativo.
- **Horario:** chips con los 11 horarios; por defecto el horario en curso (el último cuyo inicio ≤ ahora dentro del turno) o, si no hay, el siguiente; en otras fechas, el primero con reservas.

### 3.2 Indicadores (definiciones exactas)

| Indicador | Definición | Ejemplo con datos iniciales (DO0) |
|---|---|---|
| Reservas del día | Reservas de la fecha en estado Pendiente, Confirmada, Modificada o Completada (excluye Canceladas); subtítulo con total de personas | 7 · 26 personas |
| Mesas ocupadas | Mesas en estado Ocupada en el horario seleccionado | Depende del horario (p. ej., 14:00 → 3: M01, M07, M09) |
| Mesas disponibles | Mesas sin reserva solapada ni bloqueo en el horario seleccionado (sin filtro de personas) | 14:00 → 7 |
| Pendientes | Reservas de la fecha en Pendiente | 2 |
| Completadas | Reservas de la fecha en Completada | 0 |
| Canceladas | Reservas de la fecha en Cancelada | 0 |
| Ocupación del día | (pares mesa-horario ocupados) ÷ (mesas no bloqueadas × 11 horarios) × 100, redondeado al entero | 28 ÷ 110 = 25 % |
| Próxima reserva | Para hoy: la siguiente reserva activa cuyo inicio ≥ ahora (código, hora, nombre, personas, mesa, ocasión). Para otra fecha: la primera del día | — |

Nota de ocupación: un par mesa-horario está ocupado si la mesa tiene una reserva no cancelada cuyo inicio difiere en menos de 90 minutos de ese horario (BR-005). Ejemplo: una reserva a las 19:00 ocupa 18:00, 18:30, 19:00, 19:30 y 20:00 (5 pares). Con los datos iniciales de DO0: H3N8 (4) + K7PW (4) + T2MV (3) + B6RD (5) + Z8CE (5) + P4JS (4) + W5GA (3) = 28 pares de 110 posibles → 25 %.

Tocar un indicador filtra la lista de reservas (p. ej., “Pendientes” → A-03 con fecha y estado).

### 3.3 Mapa del restaurante
- Mismo plano que el cliente (coherencia visual) para la fecha + horario seleccionados.
- Mesa Ocupada: muestra nombre corto y código; al tocarla, panel con todas las reservas de esa mesa en el día (horas, nombres, estados) y accesos a A-04.
- Mesa bloqueada: icono + nota.
- Acción en el panel de mesa: Bloquear / Desbloquear (A-10).
- Leyenda de estados.

### 3.4 Próximas reservas y avisos
- Lista de las 5 próximas reservas del día con estado y acciones rápidas (Confirmar, Ver).
- Avisos agrupados: “{n} reservas pendientes de confirmar”, “{n} reservas pendientes de cerrar”, “{n} reservas en mesas bloqueadas”.

## 4. Gestión de reservas (A-03, A-04, A-05)

### 4.1 Lista (A-03)
- **Desktop:** tabla con columnas Código · Fecha · Hora · Nombre · Personas · Mesa · Ocasión · Estado · Avisos · Acciones.
- **Móvil:** tarjetas (ver `13 §8`).
- **Búsqueda:** por nombre o código, parcial, sin distinguir mayúsculas ni acentos.
- **Filtros:** Fecha (Hoy, Mañana, Próximos 7 días, Fecha específica, Todas); Estado (multiselección de los 5). Filtros reflejados en la URL. Por defecto: Hoy + todos los estados.
- **Orden:** fecha y hora ascendentes (en “Todas”: futuras primero, luego pasadas descendentes).
- **Acciones rápidas por fila:** Confirmar (si aplica), Ver detalle, menú “⋯” con Modificar, Cancelar, Completar.
- **Vacío:** “No hay reservas con estos filtros.” + “Limpiar filtros”.

### 4.2 Detalle (A-04)
- Estado + código + avisos.
- Datos: fecha, horario (inicio–fin), personas, mesa (características), ocasión (+ otra, instrucciones), nombre, teléfono completo, comentario, origen, creada/actualizada.
- Historial cronológico (actor, acción, cambios antes/después).
- Acciones según BR-037:

| Estado | Confirmar | Modificar | Cancelar | Completar |
|---|---|---|---|---|
| Pendiente | ✓ | ✓ | ✓ | ✓ si inicio ≤ ahora |
| Confirmada | — | ✓ | ✓ | ✓ si inicio ≤ ahora |
| Modificada | ✓ | ✓ | ✓ | ✓ si inicio ≤ ahora |
| Cancelada / Completada | — | — | — | — |

### 4.3 Modificar (A-05)
- Formulario en una sola vista: fecha, horario (con disponibilidad por horario para la fecha), personas, mesa (mini-mapa con estados, la propia mesa como Seleccionada), ocasión, instrucciones, nombre, teléfono, comentario.
- Validación en vivo de disponibilidad y de BR-030; errores E-10/E-11/E-12/E-15.
- Resumen Antes/Después; “Guardar cambios” → Modificada + historial (actor Admin); sin plazo de 2 h.
- Conflicto al guardar → E-05 y actualización del mini-mapa.

## 5. Gestión del menú (A-06, A-07, A-08)

### 5.1 Lista (A-06)
- Agrupada por categoría (orden fijo), en orden de `posición`.
- Fila/tarjeta: miniatura, nombre, precio, etiquetas, disponibilidad, advertencia “Sin imagen” si aplica.
- Acciones: Editar · Marcar agotado/disponible · Ocultar/Mostrar · Eliminar.
- Búsqueda por nombre; filtros por categoría y disponibilidad (Disponible, Agotado, Oculto).
- “Nuevo platillo”; “Papelera (n)”.
- **Sin drag & drop** (BR-041).

### 5.2 Editor (A-07)
| Campo | Control | Validación |
|---|---|---|
| Nombre | Texto | 2–60, único (E-22) |
| Categoría | Selector de 5 | Obligatoria; al cambiarla, el platillo irá al final de la nueva categoría (se informa) |
| Precio | Numérico entero con prefijo $ | 1–9 999 |
| Descripción | Área de texto con contador | 10–160; ayuda: “Una línea evocadora. No listes ingredientes.” |
| Etiquetas | Casillas con las 7 etiquetas | 0–7 |
| Imagen | Biblioteca / Subir nueva | Obligatoria (placeholder permitido con advertencia); BR-051 |
| Texto alternativo | Texto | 5–120, obligatorio si hay imagen |
| Disponibilidad | Disponible / Agotado temporalmente / Oculto | Obligatoria |

- Vista previa en vivo de la tarjeta del menú y del encabezado del detalle.
- Guardar / Cancelar; aviso de cambios sin guardar (EC-78).
- Al crear: “Platillo guardado.” y vuelve a A-06 con el platillo resaltado.

### 5.3 Imágenes
- **Biblioteca:** cuadrícula con las 25 imágenes iniciales y las subidas (etiqueta “Subida”); búsqueda por nombre de archivo/alt.
- **Subir:** botón “Subir imagen” (y arrastrar/soltar como alternativa); formatos JPG/PNG/WebP ≤ 5 MB; redimensionado a ≤ 1 600 px; vista previa con recorte centrado 4:5; alt obligatorio.
- Errores E-23 (formato/tamaño) y E-17 (espacio).
- Las imágenes subidas persisten localmente (BR-054) y pueden reutilizarse en otros platillos.

### 5.4 Papelera (A-08)
- Lista: miniatura, nombre, categoría, fecha de eliminación.
- Restaurar → vuelve con su disponibilidad previa al final de su categoría.
- Eliminar definitivamente → segunda confirmación (“Esta acción no se puede deshacer.”).
- Vacía: “La papelera está vacía.”

## 6. Mesas (A-09, A-10)

- Plano + lista de las 10 mesas: número, capacidad, zona, características, estado de bloqueo (Activa / Mantenimiento / No disponible), nota, próximas reservas activas (conteo).
- **Bloquear (A-10):** tipo (Mantenimiento / No disponible), nota opcional (≤ 140); si hay reservas activas futuras, aviso con lista y enlaces a A-05; botón “Bloquear”.
- **Desbloquear:** confirmación simple; la mesa vuelve a su estado calculado.
- Efecto inmediato en el flujo público y en el dashboard (BR-015, BR-021).
- Capacidad y características **no** son editables (BR-012).

## 7. Responsive del admin

Resumen (detalle en `13 §8`): tabla en desktop, tarjetas en móvil; detalle como panel lateral en desktop y pantalla completa en móvil; acciones principales siempre alcanzables con el pulgar; filtros en hoja inferior en móvil.

## 8. Estados del admin

| Pantalla | Estados |
|---|---|
| A-01 | reposo, validando, error |
| A-02 | cargando (skeleton de indicadores y plano), con datos, día cerrado, sin reservas |
| A-03 | cargando, con datos, sin resultados, acción en curso, E-29 |
| A-04 | con acciones, final (solo lectura) |
| A-05 | sin cambios, con cambios, validando disponibilidad, conflicto, guardando |
| A-06 | cargando, con datos, filtro vacío |
| A-07 | nuevo, edición, cambios sin guardar, guardando, errores, subiendo imagen |
| A-08 | vacía, con elementos |
| A-09/A-10 | mesa libre de bloqueo, bloqueada, con reservas afectadas |

## 9. Fuera de alcance del admin

Crear reservas desde admin (walk-ins), gestión de usuarios/roles, reportes históricos o exportaciones, edición de horarios o de mesas, notificaciones reales al cliente, auditoría de seguridad. Ver `21-scope-priorities.md §5`.
