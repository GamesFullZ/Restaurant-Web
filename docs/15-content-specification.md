# 15 · Especificación de contenido

> Textos, etiquetas, CTAs, mensajes, estados, errores y confirmaciones. Todo el contenido es **ficticio**. Idioma: español de México. Tono: elegante, cálido, directo y seguro (ver `16-design-direction.md §2`).
> Los mensajes de error `E-xx` se referencian en `12-error-edge-cases.md` y `11-state-specification.md`.

## 1. Voz y estilo

| Principio | Hacer | Evitar |
|---|---|---|
| Breve y concreto | “Elige un horario.” | “Por favor, seleccione el horario de su preferencia a continuación.” |
| Cercano (tú) | “Tu mesa está apartada.” | “Su reservación ha sido procesada.” |
| Seguro, no exagerado | “Cocina mexicana contemporánea.” | “¡La MEJOR comida de México!” |
| Errores útiles | Qué pasó + qué hacer. | “Error”, “Algo salió mal” sin acción. |
| Sin clichés | Referencias sutiles (maíz, fuego, mesa). | “¡Ándale!”, “¡Arriba!”, juegos de palabras con sombreros. |

Convenciones: horas en 24 h (`20:00`); fechas “sábado 3 de octubre” (en admin `sáb 03/10/2026`); precios `$185`; “personas” (1 persona / 2 personas); estados con mayúscula inicial.

## 2. Globales

| Elemento | Texto |
|---|---|
| Logo | Mesa |
| Nav | Inicio · Menú · Reservar · Mis reservas |
| CTA header | Reservar mesa (móvil: Reservar) |
| Botón menú móvil | Abrir menú / Cerrar menú (nombre accesible) |
| Saltar al contenido | Saltar al contenido principal |
| Etiqueta de acción simulada | Simulado |
| Nota de proyecto (footer) | Proyecto de portafolio · Restaurante ficticio. Las reservas se guardan solo en este navegador. |
| Enlace admin (footer) | Acceso administrador (demo) |
| Interruptor motion (footer) | Reducir movimiento |

## 3. Home

### 3.1 Hero
- **H1:** Un taco. Una mesa. Un lugar para disfrutar.
- **Subtítulo:** Cocina mexicana contemporánea en el corazón de Monterrey.
- **CTA primario:** Reservar mesa · **CTA secundario:** Ver menú
- **Indicador de scroll:** Desliza para descubrir
- **Alt del taco (respaldo):** Taco de short rib con cebolla encurtida, visto en tres cuartos.

### 3.2 Concepto
- **Eyebrow:** Concepto
- **Título:** Lo mexicano, reinterpretado.
- **Texto:** Partimos de sabores que conocemos de toda la vida —el maíz, el chile, el fuego lento— y los llevamos a una cocina contemporánea, precisa y sin adornos innecesarios. Aquí la comida se comparte: cada platillo está pensado para ponerse al centro y disfrutarse entre todos.
- **Tres ideas:** *Raíz* — Técnicas y sabores mexicanos como punto de partida. · *Presente* — Presentaciones limpias y producto de temporada. · *Mesa* — Cocina para compartir, sin prisa.

### 3.3 Destacados
- **Título:** De nuestra mesa a la tuya · **Subtítulo:** Cuatro platillos para empezar.
- **Enlace:** Ver menú completo
- **Insignias:** Favorito de la casa · Nuevo · Recomendado

### 3.4 Reseñas
- **Título:** Lo que se comparte en la mesa
- **Resumen:** 4.4 de 5 · 10 reseñas
- **Filtros:** Todas · 5 ★ · 4 ★ · 3 ★ o menos · Etiquetas: Todas, Cena en pareja, Aniversario, Cumpleaños, Con amigos, En familia, Comida de negocios, Sorpresa
- **Navegación:** Anterior · Siguiente · Indicador “3 / 10”
- **Vacío:** No hay reseñas con estos filtros. · Botón: Quitar filtros
- **Nota:** Reseñas de ejemplo para este proyecto.
- **Anuncio accesible:** “Reseña 3 de 10: Lucía M., 4 de 5 estrellas.”

### 3.5 Restaurante y ubicación
- **Título:** En el Barrio Antiguo
- **Texto:** Una casona de cantera con interiores contemporáneos, a pasos de la Macroplaza.
- **Dirección:** Calle Padre Mier 1047 Ote., Barrio Antiguo, Centro, 64000 Monterrey, N.L.
- **Referencia:** A dos cuadras de la Macroplaza, frente a la plaza del Barrio Antiguo.
- **Horarios:** Martes a domingo · Comida 13:00–17:00 · Cena 18:00–22:30 · Lunes cerrado
- **Indicador:** Abierto ahora · Cerrado ahora · Abrimos a las 18:00 · Abrimos el martes a las 13:00
- **Mapa:** etiqueta “Mapa ilustrativo”; controles Acercar, Alejar, Centrar en Mesa
- **Cómo llegar:** Abrir en Google Maps `[Simulado]` · Copiar dirección → aviso “Dirección copiada”
- **Diálogo simulado:** “En un restaurante real, este botón abriría Google Maps con la ruta a Mesa. En esta demo la acción está simulada.” · Botón: Entendido

### 3.6 CTA de reserva
- **Título:** Tu mesa te espera.
- **Texto:** Elige horario, fecha y hasta la mesa exacta. Toma menos de dos minutos.
- **CTA:** Reservar mesa

## 4. Menú y detalle

- **Título de página:** Menú · **Intro:** Para compartir, probar y volver a pedir.
- **Tabs:** Entradas · Antojitos · Platos fuertes · Postres · Bebidas y cervezas
- **Insignia agotado:** Agotado temporalmente
- **Detalle:** Volver al menú · Anterior · Siguiente · También te puede gustar · CTA “Reservar mesa”
- **Detalle agotado:** “Hoy se nos terminó. Vuelve pronto o pregunta por él al reservar.”
- **Platillo no disponible (S-10):** “Este platillo no está disponible en este momento.” · Botón: Ver menú
- **Nota de precios:** Precios en pesos mexicanos, IVA incluido. *(ficticio)*

Menú inicial completo: `10-data-specification.md §7.5`.

## 5. Flujo de reserva

| Paso | Título | Ayuda / microcopy | CTA |
|---|---|---|---|
| 1 Personas | ¿Cuántas personas vienen? | Reservas en línea para 1 a 6 personas. · Opción “Más de 6” | Continuar |
| 2 Horario | ¿A qué hora? | Comida · Cena. Tu mesa es tuya por 1 h 30 min. Confirmamos la disponibilidad al elegir la fecha. | Continuar |
| 3 Fecha | ¿Qué día? | Te mostramos los días con mesa para {N} personas a las {HH:MM}. | Continuar |
| 4 Mesa | Elige tu mesa | Toca una mesa disponible para ver sus detalles. · Preferencias: ¿Qué te gustaría? · Ver como lista / Ver como mapa | Continuar con Mesa {NN} |
| 5 Ocasión | ¿Celebran algo? | Opcional: cuéntanos cómo podemos ayudar. | Continuar |
| 6 Tus datos | ¿A nombre de quién? | Solo necesitamos tu nombre y teléfono. No pedimos correo. | Revisar reserva |
| 7 Resumen | Revisa tu reserva | Puedes editar cualquier dato antes de confirmar. | Confirmar reserva |

- **Progreso:** “Paso 3 de 7 · Fecha”
- **Resumen lateral:** título “Tu reserva”; vacío “Aquí verás lo que vas eligiendo.”
- **Leyenda de mesas:** Disponible · Seleccionada · Ocupada · No disponible · Mantenimiento · Recomendada
- **Motivos de mesa:** “Ocupada a esta hora” · “Mesa para {C}: tu grupo es de {N}” · “En mantenimiento” · “No disponible por el momento”
- **Motivos de recomendación:** “A tu medida: mesa para {C}” · “Coincide con: Terraza, Cerca de ventana” · “Ideal para grupos”
- **Estados de día:** Disponible · Pocas mesas · Sin disponibilidad · Cerrado · Horario ya pasado
- **Más de 6:** “Para grupos de más de 6 personas, llámanos y armamos tu mesa: 81 5550 1947.” · Botón “Llamar `[Simulado]`”
- **Ocasiones:** Ninguna · Cumpleaños · Aniversario · Sorpresa · Otra
- **Campo ocasión:** “Instrucciones para la ocasión (opcional)” · placeholder “Ej.: traeremos un pastel pequeño.” · Otra: “¿Qué celebran?”
- **Sugerencia por ocasión:** “Para un {aniversario}, la Mesa {06} ({Tranquila · Cerca de ventana}) está libre. ¿Quieres cambiarla?” · Botones: Cambiar a Mesa {06} · Mantener mi mesa
- **Campos de datos:** Nombre completo · Teléfono (10 dígitos) — ayuda “Lo usarás junto con tu código para consultar tu reserva.” · Comentario o instrucciones especiales (opcional) — contador “0/300”
- **Salir del flujo:** “¿Salir de la reserva? Perderás lo que has elegido.” · Salir · Seguir reservando

## 6. Confirmación (S-05)

- **Título:** Tu mesa está apartada.
- **Texto:** Te esperamos, {Nombre}. Guarda tu código: lo necesitarás junto con tu teléfono para consultar o cambiar tu reserva.
- **Código:** MESA-XXXX · botón “Copiar código” → “Código copiado”
- **Datos:** {sábado 3 de octubre} · {20:00–21:30} · {2 personas} · Mesa {06} ({Tranquila · Cerca de ventana}) · {Aniversario}
- **Estado:** Pendiente — “El restaurante confirmará tu reserva en breve. Tu mesa ya está apartada.”
- **Acciones:** Ver mi reserva · Agregar al calendario `[Simulado]` · Volver al inicio
- **Nota:** Recibirías un SMS de confirmación en un restaurante real. En esta demo no se envían mensajes. `[Simulado]`

## 7. Mis reservas

- **S-06 título:** Mis reservas · **Texto:** Consulta, cambia o cancela tu reserva con tu código y tu teléfono.
- **Campos:** Código de reserva (placeholder MESA-4F7K) · Teléfono · CTA “Buscar mi reserva”
- **Ayuda:** ¿Perdiste tu código? En un restaurante real te lo reenviaríamos por SMS. `[Simulado]`
- **S-07:** título “Tu reserva” · Código · Estado · Acciones: Modificar reserva · Cancelar reserva · Reservar de nuevo · Consultar otra reserva
- **Descripción de estados (cliente):**
  - Pendiente — Tu mesa está apartada; el restaurante la confirmará en breve.
  - Confirmada — Todo listo. Te esperamos.
  - Modificada — Guardamos tus cambios. Tu mesa está apartada.
  - Cancelada — Esta reserva fue cancelada.
  - Completada — Gracias por visitarnos.
- **Acción deshabilitada (plazo):** “Faltan menos de 2 horas para tu reserva. Para cambios, llámanos al 81 5550 1947.”
- **S-08.1:** “¿Qué quieres cambiar?” · Fecha, horario, personas o mesa · Datos de contacto y ocasión
- **Resumen de modificación:** columnas Antes / Después; CTA “Guardar cambios”
- **Éxito modificación:** “Listo, actualizamos tu reserva.”
- **Diálogo cancelar:** título “¿Cancelar tu reserva?” · texto “La mesa se liberará de inmediato y no podrás recuperarla.” · Sí, cancelar reserva · Mantener mi reserva
- **S-09:** “Tu reserva fue cancelada.” · “Esperamos verte pronto.” · Reservar de nuevo · Volver al inicio

## 8. Admin

| Elemento | Texto |
|---|---|
| Login | Título “Panel de Mesa” · Usuario · Contraseña · Entrar · Aviso “Acceso de demostración: usuario **admin**, contraseña **mesa-demo**. No es un sistema de autenticación real.” |
| Nav | Dashboard · Reservas · Menú · Mesas · Ver sitio · Cerrar sesión |
| Indicadores | Reservas del día · Mesas ocupadas · Mesas disponibles · Pendientes · Completadas · Canceladas · Ocupación del día · Próxima reserva |
| Lunes | “Hoy cerrado. Ver el {martes 29 de septiembre}.” |
| Acciones de reserva | Confirmar · Modificar · Cancelar · Marcar como completada |
| Motivo completar | “Podrás completarla a partir de las {20:00} del {sábado 3 de octubre}.” |
| Avisos de fila | Mesa bloqueada — reasignar · Pendiente de cerrar |
| Menú | Nuevo platillo · Papelera ({n}) · Editar · Marcar agotado · Marcar disponible · Ocultar · Mostrar · Eliminar |
| Editor | Nombre · Precio (MXN) · Descripción (máx. 160) · Categoría · Etiquetas · Imagen · Texto alternativo · Disponibilidad · Guardar · Cancelar · Vista previa |
| Eliminar | “¿Enviar ‘{Nombre}’ a la papelera? Dejará de verse en el sitio. Podrás restaurarlo.” · Enviar a papelera · Cancelar |
| Aviso eliminar | “‘{Nombre}’ se envió a la papelera.” · Deshacer |
| Papelera | Restaurar · Eliminar definitivamente · “Esta acción no se puede deshacer.” |
| Mesas | Bloquear mesa · Desbloquear · Tipo: Mantenimiento / No disponible · Nota (opcional, 140) |
| Aviso bloqueo con reservas | “Esta mesa tiene {2} reservas activas próximas. Se mantendrán, pero deberás reasignarlas.” |
| Restablecer | “¿Restablecer los datos de la demo? Se borrarán reservas, cambios del menú y bloqueos hechos en este navegador.” · Restablecer · Cancelar |

## 9. Catálogo de errores y avisos

Formato: **título breve** + explicación + acción(es).

| ID | Contexto | Mensaje | Acciones |
|---|---|---|---|
| E-01 | Sin disponibilidad | **No quedan mesas para {N} personas el {día} a las {HH:MM}.** Prueba otro horario u otra fecha. | Horarios alternativos · Fechas alternativas · Cambiar fecha · Cambiar número de personas |
| E-02 | Lunes | **Los lunes descansamos.** Abrimos de martes a domingo. | {domingo} · {martes} con el mismo horario |
| E-03 | Fecha fuera de ventana | **Solo puedes reservar hasta el {fecha límite}.** | Elegir otra fecha |
| E-04 | Horario de hoy no válido | **Este horario ya pasó o está muy próximo.** Reserva con al menos 1 hora de anticipación. | Horarios de hoy aún disponibles · Mañana a la misma hora |
| E-05 | Conflicto simultáneo | **La disponibilidad acaba de cambiar.** Alguien más apartó la Mesa {NN} a esta hora. Elige otra; guardamos el resto de tu reserva. | Elegir otra mesa |
| E-06 | Mis reservas sin coincidencia | **No encontramos una reserva con esos datos.** Revisa que el código y el teléfono sean los que usaste al reservar. | Intentar de nuevo · Reservar mesa |
| E-07 | Código mal formado | Escribe un código como MESA-4F7K. | — |
| E-08 | Teléfono inválido | Escribe un teléfono de 10 dígitos, por ejemplo 81 1234 5678. | — |
| E-09 | Nombre inválido | Escribe tu nombre (mínimo 2 letras). | — |
| E-10 | Mesa ocupada (al tocarla) | Esta mesa está ocupada a esta hora. | Ver mesas disponibles |
| E-11 | Mesa bloqueada | Esta mesa no está disponible por el momento. | — |
| E-12 | Capacidad incompatible | Esta mesa es para {C} personas y tu grupo es de {N}. | Ver mesas para tu grupo |
| E-13 | Más de 6 | Para grupos de más de 6 personas, llámanos. | Llamar `[Simulado]` |
| E-14 | Reserva no modificable | Esta reserva ya no se puede cambiar en línea. {motivo} | Llamar `[Simulado]` · Volver |
| E-15 | Reserva duplicada | **Ya tienes una reserva a esa hora.** Tu reserva {MESA-XXXX} coincide con este horario. | Ver mi reserva · Elegir otro horario |
| E-16 | Almacenamiento no disponible | **Tus cambios no se guardarán al cerrar esta pestaña.** Tu navegador no permite guardar datos locales (¿modo privado?). | Entendido |
| E-17 | Cuota excedida | **No hay espacio para guardar esta imagen.** Usa una imagen más ligera o elimina imágenes subidas. | Elegir otra imagen |
| E-18 | Datos dañados / versión | **No pudimos leer los datos guardados.** Restablece la demo para continuar. | Restablecer demo |
| E-19 | Login incorrecto | Usuario o contraseña incorrectos. Para la demo usa admin / mesa-demo. | — |
| E-20 | Sin sesión admin | Inicia sesión para continuar. | Ir a acceso |
| E-21 | Validación platillo | Revisa los campos marcados. (y mensaje por campo: “El precio debe ser un número entre 1 y 9 999.”, “La descripción debe tener entre 10 y 160 caracteres.”) | — |
| E-22 | Nombre duplicado | Ya existe un platillo llamado “{Nombre}”. | Ir a ese platillo |
| E-23 | Imagen inválida | Usa una imagen JPG, PNG o WebP de hasta 5 MB. | Elegir otra imagen |
| E-24 | Platillo no disponible | Este platillo no está disponible en este momento. | Ver menú |
| E-25 | 404 | **Esta mesa no existe.** La página que buscas no está aquí. | Inicio · Menú · Reservar |
| E-26 | Taco 3D no carga | *(sin mensaje; se muestra imagen estática)* | — |
| E-27 | Texto demasiado largo | Máximo {300} caracteres. | — |
| E-28 | Filtros sin resultados | No hay resultados con estos filtros. | Quitar filtros |
| E-29 | Reserva cambió (admin) | **Esta reserva cambió mientras la veías.** Actualizamos los datos; revisa antes de continuar. | Entendido |
| E-30 | Mapa no carga | No pudimos mostrar el mapa. Nuestra dirección: {dirección}. | Copiar dirección |
| E-31 | Otra: falta motivo | Cuéntanos qué celebran. | — |
| E-32 | Selección invalidada | Tu mesa ya no coincide con {N} personas / con este horario. Elige otra. | Elegir mesa |

## 10. Avisos de éxito (toasts)

Reserva confirmada (en S-05, no toast) · “Listo, actualizamos tu reserva.” · “Reserva cancelada.” · “Reserva confirmada.” (admin) · “Reserva marcada como completada.” · “Platillo guardado.” · “‘{Nombre}’ ahora está agotado.” · “‘{Nombre}’ está oculto en el sitio.” · “Mesa {NN} bloqueada.” · “Mesa {NN} desbloqueada.” · “Datos de demo restablecidos.” · “Código copiado.” · “Dirección copiada.”

## 11. Panel “Prueba estas funciones” (G-03)

- **Botón:** Prueba estas funciones
- **Intro:** Esta es una demo funcional: todo se guarda en tu navegador.
- 1 **Reserva en 2 minutos** — Elige mesa en el mapa y recibe tu código. → Empezar
- 2 **Consulta una reserva** — Código MESA-4F7K · Teléfono 81 1234 5678 → Abrir con estos datos
- 3 **Sin disponibilidad** — 6 personas · 20:00 · {fecha DO+4} → Probar
- 4 **Día cerrado** — Elige cualquier lunes en el calendario. → Probar
- 5 **Reserva simultánea** — Interruptor: “Simular que alguien reserva tu mesa al confirmar”
- 6 **Panel admin** — Usuario admin · Contraseña mesa-demo → Ir al panel
- 7 **Restablecer datos de demo**

## 12. Contenido ficticio y derechos

- Nombres de clientes, reseñas, dirección, teléfono y redes son ficticios.
- Fotografías de platillos generadas con IA (BR-050); avatares ilustrados o iniciales, sin fotos de personas reales.
- No se usan logotipos de terceros; “Google Maps” se menciona solo como texto del botón simulado.
