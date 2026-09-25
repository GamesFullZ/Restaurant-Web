# 12 · Errores y casos límite

> Cada caso `EC-xx` indica disparador, regla, comportamiento esperado, mensaje (catálogo `E-xx` en `15-content-specification.md §9`) y recuperación. Las pruebas correspondientes están en `20-testing-acceptance.md`.

## 1. Disponibilidad y horario

| ID | Caso | Disparador | Regla | Comportamiento | Mensaje | Recuperación |
|---|---|---|---|---|---|---|
| EC-01 | Sin disponibilidad | Fecha elegida sin mesas compatibles libres en el horario | BR-020, BR-024 | No avanza; panel con alternativas | E-01 | Hasta 3 horarios esa fecha, hasta 3 fechas con ese horario, “Cambiar fecha”, “Cambiar número de personas” |
| EC-02 | Sin alternativas en absoluto | Ninguna alternativa en ±3 opciones (p. ej., muchos días llenos) | BR-024 | Mismo panel sin listas; se explica | E-01 + “No encontramos alternativas cercanas.” | Cambiar personas / elegir otra fecha manualmente |
| EC-03 | Lunes | Usuario elige un lunes | BR-001 | No avanza | E-02 | Domingo anterior (si válido) y martes siguiente con el mismo horario |
| EC-04 | Horario de hoy ya pasado o < 60 min | Fecha hoy, horario no válido | BR-007 | Día marcado “Horario ya pasado” | E-04 | Horarios válidos restantes de hoy; mañana (o siguiente operativo) al mismo horario |
| EC-05 | Hoy sin horarios válidos | Hoy después de las 20:00 | BR-007 | Hoy se muestra “Horario ya pasado” para cualquier horario | E-04 | Siguiente día operativo |
| EC-06 | Fuera de ventana | Navegar más allá de hoy + 60 días | BR-006 | Días no seleccionables; flecha de mes siguiente deshabilitada al llegar al límite | E-03 (texto de ayuda) | — |
| EC-07 | Cambio de hora durante el flujo | El usuario deja el flujo abierto y el horario elegido para hoy deja de cumplir los 60 min | BR-007, BR-022 | Se detecta en la revalidación al confirmar | E-04 | Volver a Fecha con alternativas |
| EC-08 | Cambio de día (medianoche) con flujo abierto | La fecha elegida pasa a ser “ayer” | BR-006 | Revalidación la rechaza | E-03 | Volver a Fecha |

## 2. Mesas y capacidad

| ID | Caso | Disparador | Regla | Comportamiento | Mensaje | Recuperación |
|---|---|---|---|---|---|---|
| EC-10 | Mesa ocupada | Tocar/enfocar mesa Ocupada | BR-013 | No se selecciona; ficha con motivo | E-10 | Recomendadas disponibles resaltadas |
| EC-11 | Mesa bloqueada | Tocar mesa en Mantenimiento / No disponible | BR-015 | No se selecciona | E-11 / “En mantenimiento” | — |
| EC-12 | Capacidad incompatible | Tocar mesa de capacidad no compatible | BR-010 | No se selecciona | E-12 | “Ver mesas para tu grupo” resalta compatibles |
| EC-13 | Grupo > 6 | Opción “Más de 6” | BR-009 | No avanza | E-13 | Llamar (simulado) |
| EC-14 | Cambio de personas invalida mesa | Volver a Personas y cambiar a un número incompatible con la mesa elegida | FR-039 | Se limpia la mesa; se conserva horario y fecha | E-32 | Revalidar fecha y elegir mesa |
| EC-15 | Cambio de horario/fecha invalida mesa | Nuevo horario/fecha en que la mesa está ocupada o no hay disponibilidad | FR-039 | Se limpia la mesa (o se muestra EC-01) | E-32 / E-01 | Elegir mesa |
| EC-16 | Mesa bloqueada con reservas existentes | Admin bloquea mesa con reservas futuras | BR-015, BR-038 | Se bloquea; reservas se mantienen con aviso | Aviso de bloqueo con reservas | Enlaces a modificar cada reserva |
| EC-17 | Todas las mesas compatibles bloqueadas | Admin bloquea M09 y M10 | BR-020 | Grupos de 5–6 sin disponibilidad en todas las fechas | E-01 | Cambiar personas; llamar (simulado) |
| EC-18 | Selección cambia en vivo | Otra pestaña ocupa la mesa Seleccionada mientras se está en el paso Mesa | BR-021 | Se deselecciona y marca Ocupada | E-05 en línea | Elegir otra mesa |

## 3. Confirmación y conflicto

| ID | Caso | Disparador | Regla | Comportamiento | Mensaje | Recuperación |
|---|---|---|---|---|---|---|
| EC-20 | Conflicto simultáneo | Al confirmar, la mesa ya está ocupada (otra pestaña o “Simular reserva simultánea”) | BR-022, BR-023 | No se crea la reserva; vuelve al paso Mesa conservando datos; mesa marcada Ocupada | E-05 | Elegir otra mesa → Resumen |
| EC-21 | Conflicto sin mesas restantes | Al confirmar, ya no hay ninguna mesa compatible | BR-023 | Vuelve al paso Fecha | E-05 + E-01 | Alternativas |
| EC-22 | Doble clic en Confirmar | Clics repetidos | FR-035 | Botón deshabilitado durante el guardado; una sola reserva | — | — |
| EC-23 | Recargar S-05 | Recarga en confirmación | FR-035 | Muestra la misma reserva desde la sesión; no se duplica | — | — |
| EC-24 | Acceso directo a S-05 | URL sin reserva reciente | — | Redirige a `/reservar` | — | — |
| EC-25 | Reserva duplicada por teléfono | Mismo teléfono con reserva activa solapada | BR-030 | No se crea | E-15 | Ver mi reserva / cambiar horario |
| EC-26 | Mesa bloqueada entre selección y confirmación | Admin bloquea en otra pestaña | BR-022 | Igual que EC-20 | E-05 | Elegir otra mesa |

## 4. Datos del cliente

| ID | Caso | Comportamiento | Mensaje |
|---|---|---|---|
| EC-30 | Nombre vacío o de 1 carácter | Error al salir del campo / al avanzar | E-09 |
| EC-31 | Nombre con números o símbolos | Error | “Usa solo letras, espacios, apóstrofo o guion.” |
| EC-32 | Teléfono con menos/más de 10 dígitos | Error | E-08 |
| EC-33 | Teléfono con prefijo +52, espacios, guiones o paréntesis | Se acepta y normaliza | — |
| EC-34 | Teléfono que empieza en 0 o 1 | Error | E-08 |
| EC-35 | Comentario > 300 / instrucciones > 200 | Contador en rojo; no permite avanzar | E-27 |
| EC-36 | Ocasión Otra sin “¿Qué celebran?” | No avanza | E-31 |
| EC-37 | Texto con solo espacios | Se trata como vacío | E-09 / (opcional: se ignora) |
| EC-38 | Pegado de texto con saltos de línea en nombre | Se eliminan saltos y espacios dobles | — |

## 5. Mis reservas

| ID | Caso | Comportamiento | Mensaje | Recuperación |
|---|---|---|---|---|
| EC-40 | Código y teléfono no coinciden | No se revela qué campo falla; se conservan valores | E-06 | Reintentar, Reservar mesa |
| EC-41 | Código mal formado | Validación de formato antes de buscar | E-07 | — |
| EC-42 | Código sin prefijo o en minúsculas | Se acepta (BR-031) | — | — |
| EC-43 | Acceso directo a `/mis-reservas/<código>` sin verificar | Redirige a S-06 con código precargado | — | Ingresar teléfono |
| EC-44 | Reserva a menos de 2 h | Acciones deshabilitadas con motivo | E-14 (motivo plazo) | Llamar (simulado) |
| EC-45 | Reserva Cancelada o Completada | Sin acciones de cambio | — | Reservar de nuevo |
| EC-46 | La reserva fue modificada/cancelada por admin mientras el cliente la ve | Se actualiza en vivo y se avisa | “Esta reserva se actualizó.” | — |
| EC-47 | Modificación sin cambios | “Guardar cambios” deshabilitado hasta que algo cambie | — | — |
| EC-48 | Cambio de teléfono | Se valida; el nuevo teléfono pasa a ser la llave (BR-035); la sesión sigue verificada | Aviso “Usa tu nuevo teléfono para consultar esta reserva.” | — |
| EC-49 | Modificación que choca con otra reserva del mismo teléfono | BR-030 | E-15 | Elegir otro horario |
| EC-50 | Conflicto al guardar modificación | Igual que EC-20 en modo edición; la reserva original **no** cambia | E-05 | Elegir otra mesa |
| EC-51 | Cancelar y pulsar Atrás del navegador | S-07 muestra la reserva Cancelada, sin acciones | — | Reservar de nuevo |

## 6. Persistencia

| ID | Caso | Comportamiento | Mensaje |
|---|---|---|---|
| EC-60 | Almacenamiento local no disponible | Funciona en memoria; aviso persistente G-05 | E-16 |
| EC-61 | Cuota excedida al guardar imagen | No se guarda la imagen; el formulario conserva el resto | E-17 |
| EC-62 | Cuota excedida al guardar reserva (improbable) | No se crea la reserva; se sugiere restablecer demo | E-17 variante: “No pudimos guardar tu reserva. Restablece la demo e inténtalo de nuevo.” |
| EC-63 | Datos dañados o versión de esquema distinta | Pantalla de recuperación con “Restablecer demo” | E-18 |
| EC-64 | Cambios en otra pestaña | Se actualizan vistas; si afectan un formulario abierto en admin, E-29 | E-29 / aviso breve |
| EC-65 | Usuario borra datos del navegador | En la siguiente carga se regeneran los datos iniciales | — |
| EC-66 | Datos iniciales generados hace días | Las reservas iniciales conservan sus fechas originales (no se “mueven”); las de DO0 pasan a ser pasadas y aparecen como “Pendiente de cerrar” en admin | — (G-03 sugiere “Restablecer demo” si los datos tienen > 7 días) |

## 7. Admin

| ID | Caso | Comportamiento | Mensaje |
|---|---|---|---|
| EC-70 | Credenciales incorrectas | Se limpia la contraseña; foco en usuario | E-19 |
| EC-71 | Ruta admin sin sesión | Redirige a login y luego al destino | E-20 |
| EC-72 | Acción sobre reserva que cambió en otra pestaña | Se recarga el detalle antes de aplicar; si la acción ya no es válida, no se aplica | E-29 |
| EC-73 | Completar reserva futura | Botón deshabilitado con motivo | Texto “Podrás completarla a partir de…” |
| EC-74 | Modificar reserva a mesa ocupada / bloqueada | Mesa no seleccionable en mini-mapa | E-10 / E-11 |
| EC-75 | Platillo con campos inválidos | No se guarda; errores por campo; foco al primero | E-21 |
| EC-76 | Nombre de platillo duplicado | No se guarda | E-22 |
| EC-77 | Imagen de formato/tamaño inválido | No se carga | E-23 |
| EC-78 | Salir del editor con cambios sin guardar | Diálogo “¿Descartar cambios?” | — |
| EC-79 | Eliminar destacado de Home | Se envía a papelera; Home aplica sustitución BR-047 | Aviso adicional “Era un destacado de Inicio; lo reemplazamos por {Nombre}.” |
| EC-80 | Ocultar todos los platillos de una categoría | La tab de la categoría se mantiene con estado vacío “Pronto habrá novedades aquí.” | — |
| EC-81 | Eliminar definitivamente un platillo con imagen subida | La imagen subida se conserva en la biblioteca (puede reutilizarse) | — |
| EC-82 | Bloquear la mesa seleccionada en el mapa del dashboard | Se refleja de inmediato en el mapa y en el flujo público | Toast “Mesa NN bloqueada.” |
| EC-83 | Dashboard en lunes | Muestra “Hoy cerrado” con enlace al siguiente día operativo | Texto de admin (lunes) |

## 8. Visual y técnico

| ID | Caso | Comportamiento |
|---|---|---|
| EC-90 | Modelo 3D no carga / sin WebGL | Imagen estática del taco, sin mensaje (E-26) |
| EC-91 | Dispositivo de bajo rendimiento | Se reduce calidad del 3D o se usa imagen estática; nunca bloquea el scroll |
| EC-92 | Imagen de platillo falla | Placeholder de marca con nombre del platillo |
| EC-93 | Mapa ilustrado no carga | Tarjeta con dirección y “Copiar dirección” (E-30) |
| EC-94 | Portapapeles no permitido | Se muestra el texto seleccionado para copiar manualmente |
| EC-95 | JavaScript deshabilitado | Mensaje estático: “Esta demo necesita JavaScript para funcionar.” (fuera de alcance soportar sin JS) |
| EC-96 | Ruta inexistente | S-10 (E-25) |
