# 13 · Especificación responsive

> Enfoque **mobile-first**: se diseña primero para móvil y se enriquece hacia pantallas mayores. Desktop, tablet y móvil pueden tener **composiciones diferentes**, pero siempre el mismo contenido, las mismas funciones y la misma jerarquía (FR-070).

## 1. Breakpoints de referencia

| Nombre | Rango | Dispositivo típico | Columnas de retícula |
|---|---|---|---|
| Móvil | 360–767 px | Teléfonos (vertical) | 4 |
| Tablet | 768–1023 px | Tablets, teléfonos horizontales | 8 |
| Desktop | 1024–1439 px | Laptops | 12 |
| Desktop amplio | ≥ 1440 px | Monitores | 12 con ancho máx. de contenido ~1280 px |

- Ancho mínimo soportado: **360 px** sin scroll horizontal (se verifica también a 320 px sin pérdida de funciones, aunque la composición pueda apretarse).
- Márgenes laterales: 16 px (móvil), 32 px (tablet), 48–64 px (desktop).
- Objetivos táctiles: mínimo **44 × 44 px** en todas las superficies (`14-accessibility.md §7`).
- Orientación horizontal en móvil: soportada; el flujo de reserva no se bloquea.

## 2. Principios

1. El contenido crítico (CTA de reserva, datos de la reserva, acciones) nunca queda oculto detrás de interacciones hover.
2. Las composiciones experimentales se simplifican en móvil; la información no.
3. Las tablas se transforman en tarjetas en móvil; nunca scroll horizontal de página.
4. Las animaciones de scroll se reducen en móvil (menor desplazamiento y duración) y se desactivan con *reduced motion*.
5. Barras de acción importantes quedan fijas en la parte inferior en móvil (zona del pulgar).

## 3. Navegación

| Elemento | Móvil | Tablet | Desktop |
|---|---|---|---|
| Header | Logo + “Reservar” compacto + botón menú | Igual que móvil o enlaces completos si caben (≥ 900 px) | Logo + 4 enlaces + CTA “Reservar mesa” |
| Menú de navegación | Panel a pantalla completa, enlaces grandes, footer resumido (dirección y horario) | Igual | No aplica |
| Header al hacer scroll | Se oculta al bajar, reaparece al subir | Igual | Igual, con fondo sólido |
| Admin | Barra superior + menú desplegable; acciones principales en barra inferior | Barra lateral colapsable (solo iconos + tooltip) | Barra lateral expandida |

## 4. Home

| Sección | Móvil | Tablet | Desktop |
|---|---|---|---|
| Hero | Texto arriba (H1 en 3 líneas); taco debajo, más pequeño, con movimiento reducido; CTAs apilados a ancho completo | Texto 60 % / taco 40 % | Texto 55–60 % izquierda, taco derecha; animación de fondo detrás del texto |
| Concepto | 1 columna; las tres ideas apiladas | 2 columnas | Composición editorial asimétrica |
| Destacados | Carrusel horizontal con *snap* (1.2 tarjetas visibles) + indicador | Retícula 2 × 2 | 4 columnas o composición escalonada |
| Reseñas | Protagonista a ancho completo; filtros en fila desplazable; deslizar para anterior/siguiente; lista secundaria colapsada (“Ver todas”) | Protagonista + lista debajo | Protagonista 2/3 + lista lateral 1/3 |
| Ubicación | Dirección y horarios, luego mapa (altura 320 px), luego tarjeta Cómo llegar | Mapa y datos en 2 columnas | Composición editorial: datos a la izquierda, mapa grande a la derecha |
| CTA | Botón a ancho completo | Centrado | Centrado con composición gráfica |

## 5. Menú y detalle

| Elemento | Móvil | Tablet | Desktop |
|---|---|---|---|
| Tabs | Desplazables horizontalmente, fijas bajo el header, la activa se centra; degradado en bordes indica que hay más | Todas visibles | Todas visibles, indicador animado |
| Tarjetas de platillo | 1 columna (foto 4:5 a la izquierda pequeña + texto, o foto arriba) | 2 columnas | 3 columnas |
| Detalle | Foto arriba a ancho completo, información debajo en bloques; transformaciones de scroll reducidas | Foto 50 % + info | Foto grande con cambios de escala/posición y panel de información por etapas |
| Anterior/Siguiente | Barra inferior fija con ambos | Al pie | Laterales o al pie |

## 6. Flujo de reserva

| Elemento | Móvil | Tablet | Desktop |
|---|---|---|---|
| Progreso | Barra de 7 segmentos + “Paso 3 de 7 · Fecha” | Igual con nombres visibles en algunos segmentos | Pasos con nombre completo |
| Resumen “Tu reserva” | Barra inferior plegable (“Tu reserva · 2 personas · 20:00 ▾”) | Barra inferior o columna | Columna lateral fija a la derecha |
| Acciones | Barra inferior fija con Atrás + CTA | Igual | Al pie del área principal |
| Personas | Botones 1–6 en 3 × 2 | 6 en fila | 6 en fila |
| Horario | Chips en 2 columnas por turno | 4 columnas | Chips en fila por turno |
| Calendario | 1 mes + tira de próximos 14 días desplazable | 1 mes | 2 meses |
| Mapa de mesas | Plano completo ajustado al ancho con zoom (pellizcar/botones); ficha de mesa como hoja inferior; alternancia “Ver como lista” visible y recomendada por defecto en < 400 px | Plano completo; ficha lateral | Plano grande; ficha lateral; chips arriba |
| Formularios | 1 columna, teclado numérico para teléfono | 1 columna | 2 columnas (nombre/teléfono) |
| Confirmación | Código a ancho completo, acciones apiladas | Centrado | Composición premium centrada |

## 7. Mis reservas

| Elemento | Móvil | Tablet | Desktop |
|---|---|---|---|
| Acceso | Formulario a ancho completo | Centrado (máx. 480 px) | Centrado con composición gráfica |
| Detalle | Bloques apilados; acciones en barra inferior | 2 columnas | Datos a la izquierda, mini-plano y acciones a la derecha |
| Diálogo cancelar | Hoja inferior | Modal centrado | Modal centrado |

## 8. Admin

| Elemento | Móvil | Tablet | Desktop |
|---|---|---|---|
| Indicadores | Carrusel o retícula 2 × n; los 4 más importantes primero (Reservas del día, Pendientes, Ocupación, Próxima reserva) | Retícula 4 × 2 | Fila de 8 o 4 × 2 |
| Mapa dashboard | Plano ajustado con zoom; selector de horario como chips desplazables | Plano + lista de próximas | Plano grande + columna de próximas reservas |
| Reservas | **Tarjetas** (código, hora, nombre, personas, mesa, estado, avisos) + acciones en menú | Tabla con columnas reducidas (sin Ocasión) | **Tabla** completa |
| Filtros | Hoja inferior “Filtros (2)” | Barra de filtros | Barra de filtros |
| Detalle reserva | Pantalla completa | Panel lateral 60 % | Panel lateral ~40 % |
| Menú admin | Tarjetas con acciones en menú “⋯” | Lista compacta | Lista/tabla con acciones visibles |
| Editor de platillo | 1 columna; vista previa como pestaña | 2 columnas | Formulario + vista previa lateral fija |
| Mesas | Lista de tarjetas + plano opcional | Plano + lista | Plano + lista lado a lado |

## 9. Tarjetas, tablas y listas

- **Tablas** solo en ≥ 1024 px (admin reservas). En tamaños menores se sustituyen por tarjetas con la misma información y acciones.
- **Tarjetas** de platillo: la proporción de imagen 4:5 se mantiene en todos los tamaños.
- **Listas largas**: en móvil se cargan en bloques de 20 con “Mostrar más”.

## 10. Animaciones por tamaño

| Animación | Móvil | Tablet | Desktop |
|---|---|---|---|
| Taco 3D | Menor tamaño, rotación limitada, sin cambios de composición complejos; imagen estática si el dispositivo es de bajo rendimiento | Completa reducida | Completa |
| Fondo del Hero | Simplificado (menos elementos) | Completo | Completo |
| Detalle de platillo | Aparición por etapas sin cambios grandes de posición | Completa | Completa |
| Transiciones de reseñas | Deslizamiento horizontal | Fundido + desplazamiento | Fundido + desplazamiento |
| Mapa de mesas | Transiciones de estado iguales en todos | — | — |

## 11. Imágenes

- Se sirven en tamaños adaptados al ancho (p. ej., 480, 800, 1200, 1600 px) y formato moderno con respaldo.
- Carga diferida fuera de pantalla; las imágenes del Hero/primer bloque se priorizan.
