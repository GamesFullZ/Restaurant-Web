# 14 · Accesibilidad

> Objetivo: **WCAG 2.2 nivel AA** en todo el sitio público y el panel admin (FR-071). La accesibilidad es requisito P0, no un pulido final. Las pruebas están en `20-testing-acceptance.md §6`.

## 1. Principios

1. Todo lo que se puede hacer con mouse o touch se puede hacer con teclado y con lector de pantalla.
2. Ninguna información depende solo del color, la animación o la posición.
3. El movimiento es opcional: *reduced motion* se respeta siempre.
4. Los mensajes (errores, éxitos, cambios de disponibilidad) se anuncian.

## 2. Teclado

| Área | Comportamiento |
|---|---|
| Global | Enlace “Saltar al contenido principal” como primer elemento enfocable. Orden de tabulación = orden visual. Sin trampas de foco salvo en diálogos (intencionales, con Escape). |
| Menú móvil | Botón con `aria-expanded`; al abrir, foco en el primer enlace; Escape cierra y devuelve el foco. |
| Tabs de menú | Patrón de tabs: flechas izquierda/derecha cambian de tab; Inicio/Fin a la primera/última; Tab entra al contenido. |
| Reseñas | Botones Anterior/Siguiente; filtros como grupo de botones con estado presionado; la lista secundaria es navegable. |
| Mapa ilustrativo | Botones Acercar/Alejar/Centrar; flechas desplazan el mapa cuando tiene foco. |
| Calendario | Patrón de rejilla: flechas mueven por días, Re Pág/Av Pág por mes, Inicio/Fin por semana, Enter/Espacio selecciona. Días fuera de ventana no enfocables. |
| Mapa de mesas | Cada mesa es un botón en el orden M01→M10 (o por zona); flechas se mueven entre mesas; Enter/Espacio selecciona; alternativa “Ver como lista” siempre disponible. |
| Formularios | Enter envía el paso si es válido; errores llevan el foco al resumen de errores. |
| Diálogos | Foco inicial en la acción segura; Escape cierra; al cerrar, foco vuelve al disparador. |
| Admin tabla | Filas con acciones accesibles por Tab; el panel de detalle recibe el foco al abrirse. |
| Toast con “Deshacer” | Alcanzable por teclado durante su duración; la duración se pausa con foco o hover. |

## 3. Foco visible

- Indicador de foco de alto contraste (contorno ≥ 2 px, contraste ≥ 3:1 contra ambos fondos adyacentes), nunca eliminado.
- El foco nunca queda oculto por el header fijo, la barra inferior del flujo o el panel de demo (desplazamiento con margen superior/inferior).
- Tras cambiar de paso en el flujo de reserva, el foco se mueve al título del nuevo paso.
- Tras navegar entre páginas, el foco va al H1 y se anuncia el título de la página.

## 4. Etiquetas, nombres y estructura

- Un **H1 por página**; jerarquía de encabezados sin saltos.
- Regiones: `header`, `nav` (con nombre “Principal” / “Admin”), `main`, `footer`.
- Todos los campos con **label visible** (no solo placeholder); ayudas y errores asociados al campo.
- Campos obligatorios indicados con texto (“obligatorio”) además de asterisco.
- Teléfono con `inputmode` numérico y `autocomplete="tel"`; nombre con `autocomplete="name"`.
- Botones con nombre descriptivo (“Elegir Mesa 06”, no “Elegir”); iconos decorativos ocultos a tecnologías de asistencia.
- Estrellas: “4 de 5 estrellas”.
- Estados (reserva, mesa, platillo): texto + icono + color.
- Imágenes: `alt` descriptivo en platillos (obligatorio en admin, BR-051); decorativas con `alt` vacío. El taco 3D tiene descripción textual equivalente.
- Idioma de la página: español (`es-MX`).
- Títulos de página únicos: “Menú · Mesa”, “Paso 3 de 7: Fecha · Reservar · Mesa”.

## 5. Contraste y tamaños

| Elemento | Mínimo |
|---|---|
| Texto normal | 4.5:1 |
| Texto grande (≥ 24 px o ≥ 18.66 px bold) | 3:1 |
| Componentes de UI e iconos informativos | 3:1 |
| Texto sobre animación del Hero | 4.5:1 en todos los fotogramas (la animación se mantiene detrás con opacidad controlada) |
| Texto sobre imágenes | Siempre sobre un área sólida o con velo que garantice 4.5:1 |

- Tamaño base de texto ≥ 16 px; texto secundario ≥ 14 px; nunca < 12 px (ni en admin).
- Interlineado ≥ 1.5 en párrafos.
- Contenido usable con zoom al 200 % y con texto ampliado (sin cortes ni superposición); reflujo a 320 px CSS.
- Paleta validada en ambos modos de estado (reposo/hover/foco/deshabilitado) — ver `16-design-direction.md §4`.

## 6. Lectores de pantalla

| Situación | Anuncio |
|---|---|
| Cambio de paso en reserva | “Paso 4 de 7: Elige tu mesa.” |
| Selección de mesa | “Mesa 06 seleccionada. 4 personas, Tranquila, Cerca de ventana.” |
| Mesa no disponible | Nombre accesible incluye estado y motivo: “Mesa 09, para 6, ocupada a esta hora.” |
| Recomendación | “Recomendada: a tu medida, coincide con Terraza.” |
| Calendario | Cada día: “sábado 3 de octubre, disponible” / “lunes 5 de octubre, cerrado”. |
| Errores de formulario | Región de alerta con el resumen; cada campo con descripción del error. |
| Conflicto simultáneo | Alerta: “La disponibilidad acaba de cambiar…”. |
| Toasts | Región viva educada (`polite`); errores con `assertive`. |
| Reseña protagonista | “Reseña 3 de 10: Lucía M., 4 de 5 estrellas.” |
| Tab activa del menú | Estado seleccionado anunciado por el patrón de tabs. |
| Carga (skeleton) | Región marcada como ocupada; al terminar, sin anuncios ruidosos. |
| Sincronización entre pestañas | “Actualizamos la disponibilidad.” (educado) |

Lectores objetivo para pruebas: VoiceOver (iOS/macOS) y NVDA (Windows); TalkBack como verificación secundaria.

## 7. Touch

- Objetivos táctiles ≥ 44 × 44 px con separación ≥ 8 px (mesas en el plano incluidas; si el plano es pequeño, zoom o vista lista).
- Ningún gesto es la única forma de hacer algo: deslizar reseñas también tiene botones; pellizcar el mapa también tiene botones de zoom.
- Sin acciones que dependan de hover o de doble toque.
- Las barras fijas inferiores respetan las áreas seguras del dispositivo.

## 8. Movimiento reducido

- Con `prefers-reduced-motion: reduce` o con el interruptor “Reducir movimiento” (FR-069):
  - Taco 3D: imagen estática, sin rotación ni desplazamiento.
  - Sin parallax, sin transformaciones ligadas al scroll, sin animación de fondo del Hero (fotograma estático).
  - Transiciones sustituidas por fundidos ≤ 150 ms o cambios inmediatos.
  - El contenido que “aparece por etapas” se muestra completo desde el inicio.
- Nada parpadea más de 3 veces por segundo.
- Ninguna animación en bucle dura más de 5 s sin control para pausarla (el fondo del Hero tiene botón “Pausar animación” o se detiene al salir del viewport).

## 9. Formularios y errores

- Validación al salir del campo y al enviar, nunca mientras se escribe el primer carácter.
- Mensajes de error específicos del catálogo `15 §9`, junto al campo, con icono y texto.
- No se borran los datos del usuario tras un error.
- Tiempo: ninguna operación del cliente tiene límite de tiempo (no hay retención de mesa con cuenta regresiva).

## 10. Admin

- Mismos estándares que el sitio público.
- Tabla con encabezados de columna asociados; orden y filtros anunciados (“12 resultados”).
- Acciones destructivas con confirmación y descripción de consecuencia.
- Subida de imagen accesible con teclado (botón “Subir imagen”, no solo arrastrar y soltar).

## 11. Checklist de revisión (resumen)

- [ ] Recorrido completo con teclado: Home → Menú → Detalle → Reserva → Confirmación → Mis reservas → Modificar → Cancelar.
- [ ] Recorrido completo con teclado del admin: Login → Dashboard → Reservas → Modificar → Menú → Mesas.
- [ ] Recorrido con VoiceOver móvil del flujo de reserva.
- [ ] Auditoría automática sin errores críticos en todas las pantallas.
- [ ] Contrastes verificados, incluidos estados de mesa y etiquetas.
- [ ] Zoom 200 % y 320 px sin pérdida.
- [ ] *Reduced motion* verificado en Home y Detalle.
