# 17 · Motion e interacción

> Cada animación tiene un **propósito** explícito (orientar, dar feedback, mostrar relación, dar identidad). Si una animación no cumple un propósito, no se incluye. Toda animación respeta *reduced motion* (`14-accessibility.md §8`). Prioridad: la mayoría del motion es **P2**, excepto el feedback funcional (estados, transiciones de pasos, selección de mesa), que es P0/P1.

## 1. Principios

1. **Propósito primero:** orientar, confirmar, relacionar o expresar la marca.
2. **Nunca bloquea:** ninguna animación impide leer, hacer clic o avanzar; el usuario nunca espera a que termine una animación para actuar.
3. **Rendimiento:** solo se animan transformaciones y opacidad; objetivo 60 fps en dispositivos de gama media; sin saltos de layout.
4. **Consistencia temporal:** un set de duraciones y curvas para todo el producto.
5. **Reduced motion:** alternativa definida para cada animación.

## 2. Tokens de motion (orientativos)

| Token | Duración | Uso |
|---|---|---|
| instantáneo | 80–120 ms | Hover, presionado, cambio de color |
| corto | 150–220 ms | Feedback de selección, toasts, chips |
| medio | 280–400 ms | Cambio de paso, paneles, tabs, transiciones de reseñas |
| largo | 500–800 ms | Entradas de sección, confirmación premium |
| scroll | ligado a la posición | Taco 3D, detalle de platillo, fondo del Hero |

Curvas: salida suave (desaceleración) para entradas; aceleración suave para salidas; sin rebotes excepto un leve *overshoot* en la selección de mesa y la aparición del código de confirmación.

## 3. Microinteracciones

| Elemento | Animación | Propósito | Reduced motion |
|---|---|---|---|
| Botones | Ligero cambio de fondo y desplazamiento de icono al hover; compresión al presionar | Feedback | Solo color |
| CTA “Reservar mesa” | Relleno que avanza de izquierda a derecha al hover | Atracción hacia la acción principal | Solo color |
| Chips / tabs | Indicador que se desliza a la opción activa | Relación entre opciones | Cambio inmediato |
| Campos | Borde que se intensifica al foco; error con ligera sacudida horizontal (1 vez, 150 ms) | Feedback | Sin sacudida |
| Copiar código | Icono cambia a ✓ y toast | Confirmación | Igual sin transición |
| Toasts | Entrada desde abajo + fundido | Aviso no intrusivo | Fundido |
| Skeleton | Brillo que recorre el bloque | Indicar carga | Estático |
| Estrellas | Relleno secuencial al aparecer la reseña | Identidad | Estático |

## 4. Hero y taco 3D

**Propósito:** identidad memorable y ritmo narrativo sin competir con el texto.

| Momento (scroll) | Taco | Fondo | Texto |
|---|---|---|---|
| 0 % (carga) | Aparece con fundido y rotación lenta de reposo (loop sutil, ±8°) | Patrón de papel picado se “perfora” progresivamente | H1 aparece por líneas (3 tiempos) |
| 0–40 % del Hero | Rota sobre su eje vertical (~90°) y se acerca levemente | Perforaciones se desplazan con parallax leve | Fijo, legible |
| 40–100 % | Se desplaza hacia el centro-abajo y cambia de escala, mostrando otro ángulo; la composición cambia (p. ej., el taco “se abre” ligeramente con separación sutil de capas) | El patrón se recompone en líneas de greca | H1 sale con fundido/desplazamiento |
| Transición a Concepto | Se reduce y se aparta hacia un lado; desaparece al llegar a Destacados | Plano de color cambia a Nixtamal | Concepto entra por etapas |

Reglas:

- El taco **nunca** se superpone al H1 (zonas de exclusión por breakpoint).
- Se pausa cuando el Hero sale del viewport.
- **Presupuesto:** modelo optimizado (≤ ~2–3 MB comprimido, texturas ≤ 2K), carga diferida después del texto; placeholder = imagen estática del mismo ángulo.
- **Fallback:** sin WebGL, error de carga o bajo rendimiento → imagen estática con parallax mínimo (o sin él con reduced motion).
- **Reduced motion:** imagen estática, sin loop, sin parallax; fondo estático.

## 5. Transiciones entre secciones (Home)

| Sección | Entrada | Propósito |
|---|---|---|
| Concepto | Texto por etapas (eyebrow → título → párrafo → tres ideas) | Ritmo de lectura |
| Destacados | Tarjetas escalonadas (70 ms entre cada una); imagen con leve escala 1.05 → 1 | Descubrimiento |
| Reseñas | Protagonista entra con fundido y desplazamiento; cambio entre reseñas: la saliente se desliza y la entrante aparece (dirección según anterior/siguiente) | Continuidad y orientación |
| Ubicación | El pin “cae” en el mapa; los datos aparecen en columna | Enfoque en el lugar |
| CTA | Patrón de talavera se completa pieza a pieza | Cierre expresivo |

Cada entrada se dispara una sola vez (no se repite al volver a subir), con umbral de visibilidad ~20 %.

## 6. Menú y detalle de platillo

| Elemento | Animación | Propósito |
|---|---|---|
| Tabs | Indicador activo se desliza; al tocar una tab, desplazamiento suave a la sección | Orientación |
| Tarjetas | Aparición escalonada al entrar en viewport; hover: imagen escala 1.03 y aparece “Ver platillo” | Invitación a explorar |
| Menú → detalle | Transición compartida: la imagen de la tarjeta se expande hacia su posición en el detalle | Continuidad espacial |
| Detalle · scroll | La fotografía empieza grande y centrada; al hacer scroll se reduce y se desplaza a un lado mientras la información entra por etapas: nombre → precio + etiquetas → descripción → CTA | Narrativa del platillo |
| Detalle · gráficos | Líneas de greca se dibujan alrededor de la foto; perforaciones de papel picado se transforman en puntos que acompañan el scroll | Identidad |
| Agotado | Imagen se desatura suavemente | Estado |

Reduced motion: detalle con la foto y toda la información visibles desde el inicio; sin transición compartida (fundido simple).

## 7. Mapa ilustrativo (ubicación)

- Zoom y arrastre con inercia suave; botón “Centrar en Mesa” anima el retorno (medio).
- Pin con pulso sutil (2 ciclos al aparecer, luego estático). Reduced motion: sin pulso.

## 8. Flujo de reserva

| Momento | Animación | Propósito |
|---|---|---|
| Cambio de paso | El contenido saliente se desliza/funde en la dirección del avance; el entrante aparece (medio); la barra de progreso avanza | Orientación en el proceso |
| Selección de personas/horario | Chip seleccionado se rellena con acento; el resumen “Tu reserva” actualiza el dato con un leve destello | Feedback y relación |
| Calendario | Cambio de mes desliza; días con estado aparecen tras skeleton | Carga comprensible |
| Mapa de mesas | Entrada: mesas aparecen por zonas; selección: la mesa se eleva levemente con *overshoot* y aparece ✓; ficha de mesa se desliza desde el lado/abajo | Feedback principal |
| Recomendada | Insignia aparece con fundido tras calcular | Atraer la atención sin forzar |
| Conflicto (E-05) | La mesa perdida cambia a Ocupada con transición visible (medio) y aparece la alerta | Explicar qué cambió |
| Sugerencia por ocasión | Tarjeta entra desde abajo | Opcional, no intrusiva |
| Confirmación | Composición premium: el código se “escribe” carácter a carácter (largo); patrón gráfico se completa; datos aparecen escalonados | Celebración y énfasis en el código |

Reduced motion: cambios de paso con fundido ≤ 150 ms; código visible de inmediato.

## 9. Mis reservas y admin

- Transiciones funcionales (paneles, diálogos, toasts) con duración corta/media.
- Cambios de estado de reserva: la insignia cambia con fundido y un destello breve de la fila.
- Mapa del dashboard: al cambiar horario, las mesas transicionan de estado (medio) para que se perciba qué cambió.
- Sincronización en vivo (otra pestaña): la mesa o fila afectada destella una vez.
- Sin animaciones decorativas en admin.

## 10. Estados de carga y éxito

- Skeletons con la forma exacta del contenido; sustitución con fundido corto.
- Botones de acción: texto cambia a “Guardando…”/“Confirmando…” con indicador; al terminar, ✓ breve antes de navegar o mostrar toast.
- Nunca spinner de pantalla completa.

## 11. Inventario de animaciones y propósito (resumen)

| # | Animación | Propósito | Prioridad |
|---|---|---|---|
| M-01 | Taco 3D reactivo | Identidad | P2 (respaldo estático P1) |
| M-02 | Fondo del Hero | Identidad | P2 |
| M-03 | Entradas de sección | Ritmo narrativo | P2 |
| M-04 | Reseñas: cambio de protagonista | Orientación | P1 |
| M-05 | Tabs del menú | Orientación | P1 |
| M-06 | Transición menú → detalle | Continuidad | P2 |
| M-07 | Detalle por etapas | Narrativa | P2 |
| M-08 | Cambio de paso en reserva | Orientación | P1 |
| M-09 | Selección y estados de mesa | Feedback | P0 |
| M-10 | Conflicto de disponibilidad | Explicación | P0 |
| M-11 | Confirmación premium | Celebración | P2 |
| M-12 | Toasts, skeletons, botones | Feedback | P1 |
| M-13 | Mapa dashboard por horario | Relación | P1 |
