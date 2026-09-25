# 11 · Especificación de estados

> Estados de reserva, mesa, platillo, disponibilidad, pantallas, carga, error y éxito: qué ve el usuario, qué puede hacer y qué transición ocurre. Reglas: `09-business-rules.md`. Textos: `15-content-specification.md`.

## 1. Estados de reserva

### 1.1 Definición

| Estado | Significado | ¿Ocupa mesa? | Cliente ve | Cliente puede | Admin puede |
|---|---|---|---|---|---|
| **Pendiente** | Creada por el cliente; falta confirmación del restaurante. | Sí | Insignia ámbar “Pendiente” + “Tu mesa está apartada; el restaurante la confirmará en breve.” | Modificar, Cancelar (BR-032) | Confirmar, Modificar, Cancelar, Completar (si ya inició) |
| **Confirmada** | Aceptada por el restaurante. | Sí | Insignia verde “Confirmada” + “Todo listo. Te esperamos.” | Modificar, Cancelar (BR-032) | Modificar, Cancelar, Completar (si ya inició) |
| **Modificada** | Tuvo cambios después de crearse; sigue activa. | Sí | Insignia azul “Modificada” + fecha del último cambio | Modificar, Cancelar (BR-032) | Confirmar, Modificar, Cancelar, Completar (si ya inició) |
| **Cancelada** | Anulada por cliente o admin. **Final.** | No | Insignia gris “Cancelada” | Reservar de nuevo | Ver historial |
| **Completada** | El cliente asistió. **Final.** | Sí (su intervalo, histórico) | Insignia neutra “Completada” + “Gracias por visitarnos.” | Reservar de nuevo | Ver historial |

Colores orientativos; el estado siempre se comunica también con texto e icono (`14-accessibility.md`).

### 1.2 Diagrama de transiciones

```
                 (cliente crea)
                      │
                      ▼
               ┌─────────────┐  admin: Confirmar   ┌─────────────┐
               │  Pendiente  │────────────────────▶│ Confirmada  │
               └─────────────┘                     └─────────────┘
                 │   │   │ cliente/admin: Modificar      │   │   │
                 │   │   └──────────────┐  ┌─────────────┘   │   │
                 │   │                  ▼  ▼                 │   │
                 │   │            ┌─────────────┐ admin:     │   │
                 │   │            │ Modificada  │─Confirmar─▶(Confirmada)
                 │   │            └─────────────┘            │   │
                 │   │              │  │  ▲ Modificar        │   │
                 │   │              │  │  └──(a sí misma)    │   │
   Cancelar ─────┴───┼──────────────┴──┼─────────────────────┘   │
   (cliente/admin)   │                 │                         │
                     ▼                 ▼                         ▼
               ┌─────────────┐   ┌─────────────┐   admin: Completar (inicio ≤ ahora)
               │  Cancelada  │   │ Completada  │◀── desde Pendiente, Confirmada o Modificada
               └─────────────┘   └─────────────┘
                   (final)           (final)
```

### 1.3 Tabla de transiciones

| Desde | Evento | Actor | Condición | Hacia | Efecto |
|---|---|---|---|---|---|
| — | Confirmar reserva (S-04.7) | Cliente | Mesa disponible, sin duplicado | Pendiente | Código generado, historial “Creada” |
| Pendiente / Modificada | Confirmar | Admin | — | Confirmada | Historial |
| Pendiente / Confirmada / Modificada | Guardar cambios | Cliente | BR-032 + disponibilidad | Modificada | Historial con antes/después; mesa anterior liberada |
| Pendiente / Confirmada / Modificada | Guardar cambios | Admin | Disponibilidad | Modificada | Ídem, actor Admin |
| Pendiente / Confirmada / Modificada | Cancelar | Cliente | BR-032 | Cancelada | Mesa liberada |
| Pendiente / Confirmada / Modificada | Cancelar | Admin | — | Cancelada | Mesa liberada |
| Pendiente / Confirmada / Modificada | Completar | Admin | inicio ≤ ahora | Completada | Historial |
| Cancelada / Completada | cualquiera | — | — | (sin cambio) | Acciones no disponibles |

Avisos derivados (no son estados): **Mesa bloqueada — reasignar** (BR-038) y **Pendiente de cerrar** (BR-039), solo en admin.

## 2. Estados de mesa

Se calculan por contexto (fecha + horario + personas) con la prioridad de BR-013.

| Estado | Cuándo | Visual (orientativo) | Seleccionable | Al enfocar/tocar |
|---|---|---|---|---|
| **Disponible** | Compatible, libre, sin bloqueo | Contorno sólido, relleno claro, número visible | Sí | Ficha de mesa + “Elegir esta mesa” |
| **Seleccionada** | Elegida por el usuario | Relleno de acento, marca ✓, ligera elevación | Sí (deseleccionar al elegir otra) | Ficha + “Continuar con Mesa NN” |
| **Ocupada** | Reserva activa solapada (BR-005) | Relleno texturizado (rayado) + icono reloj | No | “Ocupada a esta hora” (E-10) |
| **No disponible** | Bloqueo admin o capacidad incompatible | Atenuada + icono ⊘ | No | “No disponible por el momento” (E-11) o “Mesa para C: tu grupo es de N” (E-12) |
| **Mantenimiento** | Bloqueo admin tipo Mantenimiento | Atenuada + icono herramienta | No | “En mantenimiento” |
| *Recomendada* (modificador) | BR-016 | Insignia “Recomendada” sobre Disponible | Sí | Motivo de la recomendación |

En admin: mismos estados + nombre y código de la reserva en mesas Ocupadas + nota del bloqueo en Mantenimiento / No disponible. “Seleccionada” en admin = mesa cuyo panel está abierto.

Transiciones de mesa (contexto fijo):

| Desde | Evento | Hacia |
|---|---|---|
| Disponible | Usuario la elige | Seleccionada |
| Seleccionada | Usuario elige otra | Disponible |
| Disponible / Seleccionada | Otra reserva la ocupa (misma u otra pestaña) | Ocupada (si era Seleccionada: aviso E-05 al confirmar o inmediato si llega el cambio en vivo) |
| Ocupada | La reserva se cancela o se mueve | Disponible |
| cualquiera | Admin bloquea | Mantenimiento / No disponible |
| Mantenimiento / No disponible (bloqueo) | Admin desbloquea | recalculada (Disponible u Ocupada) |

Si la mesa Seleccionada cambia a no disponible **mientras** el usuario está en el paso Mesa (cambio en vivo desde otra pestaña), se deselecciona y se muestra E-05 en línea.

## 3. Estados de platillo

| Estado | Sitio público | Admin | Transiciones |
|---|---|---|---|
| **Disponible** | Visible normal | Insignia “Disponible” | → Agotado, → Oculto, → Papelera |
| **Agotado temporalmente** | Visible, insignia, imagen atenuada (BR-045) | Insignia “Agotado” | → Disponible, → Oculto, → Papelera |
| **Oculto** | No visible; URL → S-10 (E-24) | Insignia “Oculto” | → estado anterior (Disponible o Agotado) con “Mostrar”, → Papelera |
| **En papelera** | No visible; URL → S-10 | Solo en A-08 | → Restaurar (estado previo), → Eliminado definitivo |
| **Eliminado definitivo** | — | No existe | (final) |

## 4. Estados de disponibilidad

### 4.1 Día (calendario, para horario + personas)

| Estado | Condición | Seleccionable | Al elegir |
|---|---|---|---|
| Disponible | ≥ 3 mesas compatibles libres | Sí | Avanza a Mesa |
| Pocas mesas | 1–2 mesas compatibles libres | Sí | Avanza a Mesa |
| Sin disponibilidad | 0 mesas compatibles libres | Sí (para ver motivo) | E-01 + alternativas; no avanza |
| Cerrado | Lunes | Sí (para ver motivo) | E-02 + alternativas |
| Horario ya pasado | Hoy y horario < ahora + 60 min | Sí (para ver motivo) | E-04 + alternativas |
| Fuera de ventana | Pasado o > hoy + 60 días | No (no se puede enfocar como opción) | — |

### 4.2 Horario (paso 2)

Los 11 horarios siempre se muestran como elegibles (aún no hay fecha). En modo edición (S-08, A-05), con fecha conocida, cada horario muestra además Disponible / Sin disponibilidad para ese día.

## 5. Estados de pantalla

Cada pantalla de datos contempla estos estados base:

| Estado | Qué ve el usuario | Qué puede hacer |
|---|---|---|
| **Cargando** | Skeleton con la forma final (tarjetas, filas, plano de mesas, calendario) | Nada interactivo del bloque cargando; navegación global disponible |
| **Con datos** | Contenido | Todas las acciones |
| **Vacío** | Ilustración mínima + explicación + acción (p. ej., “No hay reservas para este día” · “Ver próximos 7 días”) | Acción sugerida |
| **Error** | Mensaje del catálogo E-xx con acción | Reintentar / salida |
| **Éxito** | Toast o pantalla de éxito (S-05, S-09) | Siguiente paso claro |

### 5.1 Estados específicos

| Pantalla | Estados adicionales |
|---|---|
| S-01.1 Hero | Taco cargando (placeholder), taco listo (3D), taco respaldo (imagen), reduced motion (imagen estática) |
| S-01.4 Reseñas | Filtrado sin resultados (E-28), transición entre protagonistas |
| S-02 Menú | Tab activa por scroll, filtro sin resultados en categoría |
| S-03 Detalle | Agotado, no disponible (S-10) |
| S-04.x | Paso sin completar (CTA deshabilitado con motivo en texto), validando (botón con progreso), invalidado por cambio anterior (E-32), sin disponibilidad (E-01), conflicto (E-05) |
| S-04.7 | Confirmando (botón “Confirmando…”, bloque inhabilitado para evitar doble envío) |
| S-05 | Éxito; acceso directo sin reserva reciente → redirección a `/reservar` |
| S-06 | Buscando, no encontrado (E-06) |
| S-07 | Modificable, no modificable (plazo), final (Cancelada/Completada), mesa bloqueada (solo admin la ve) |
| A-01 | Validando, error (E-19) |
| A-02 | Lunes/cerrado, día sin reservas |
| A-03 | Sin resultados (E-28), acción en curso, conflicto de datos (E-29) |
| A-07 | Sin cambios, con cambios sin guardar, guardando, error de validación (E-21/E-22), subiendo imagen, error de imagen (E-17/E-23) |
| A-10 | Mesa sin reservas futuras, mesa con reservas futuras (aviso) |
| Global | Almacenamiento no disponible (G-05, E-16), datos dañados (E-18), sincronizado desde otra pestaña (actualización silenciosa con aviso breve “Actualizamos la disponibilidad”) |

## 6. Estados de carga

| Operación | Indicador | Duración objetivo |
|---|---|---|
| Carga inicial de página | Skeleton por sección | < 1 s percibido |
| Imágenes de platillo | Skeleton con proporción 4:5 → fundido | Progresivo |
| Cálculo de disponibilidad (calendario, mapa) | Skeleton del calendario / plano | 300–800 ms simulado (FR-066) |
| Confirmar / guardar / cancelar | Botón con spinner y texto (“Confirmando…”, “Guardando…”) | 300–800 ms simulado |
| Modelo 3D | Imagen placeholder del taco | Hasta que cargue o falle |

Nunca se bloquea la pantalla completa con un spinner global.

## 7. Estados de controles

| Control | Estados |
|---|---|
| Botón | reposo, hover, foco visible, presionado, deshabilitado (con motivo cercano), cargando |
| Campo | vacío, con foco, válido, error (mensaje + borde + icono), deshabilitado |
| Tab / chip | inactivo, hover, foco, activo (`aria-selected` / `aria-pressed`) |
| Mesa (mapa) | los de §2 + foco visible |
| Día (calendario) | los de §4.1 + hoy + seleccionado + foco |

## 8. Estados de sesión

| Sesión | Estados | Transición |
|---|---|---|
| Admin | sin sesión → con sesión | Login correcto; cierre con “Cerrar sesión”, al cerrar la pestaña o al restablecer demo |
| Cliente (Mis reservas) | no verificada → verificada (por reserva) | Código + teléfono correctos o recién creada; se pierde al cerrar la pestaña |
| Borrador de reserva | vacío → en progreso → enviado | Se limpia al confirmar o al salir confirmando la salida |
