# 16 · Dirección de diseño

> Dirección conceptual para la fase de ideación en Excalidraw y el diseño visual. **No es un sistema de diseño final**: valores de color y tipografía son orientativos y se validan en la fase de diseño (ver `24-master-plan.md`). Lo no negociable: identidad moderna, minimalista, animada, con toque mexicano reinterpretado y sin clichés.

## 1. Identidad

- **Qué es Mesa:** un restaurante mexicano contemporáneo en Monterrey donde la mesa compartida es el centro de la experiencia.
- **Adjetivos de marca:** elegante · sofisticada · atrevida · creativa.
- **Slogan:** “Un taco. Una mesa. Un lugar para disfrutar.”
- **Idea visual rectora:** *la mesa vista desde arriba* — superficies planas, círculos (platos, tortillas), rectángulos (mesas, manteles), ritmo de elementos compartidos. Esta idea une logo, patrones, plano de mesas y composición.

## 2. Personalidad aplicada

| Rasgo | En diseño | En contenido | En motion |
|---|---|---|---|
| Elegante | Mucho espacio, pocos elementos, jerarquía tipográfica fuerte | Frases cortas y precisas | Transiciones suaves, sin rebotes exagerados |
| Sofisticada | Paleta contenida, detalles finos (líneas de 1 px, texturas sutiles) | Vocabulario cuidado | Tiempos pausados, easing natural |
| Atrevida | Tipografía display enorme, recortes, composiciones asimétricas | Afirmaciones seguras | Momentos protagonistas (taco, detalle de platillo) |
| Creativa | Patrones mexicanos reinterpretados que se transforman | Pequeños guiños | Elementos gráficos que se recomponen con el scroll |

## 3. Principios visuales

1. **El texto manda en el Hero.** Tipografía como imagen principal; la animación acompaña detrás.
2. **Espacio negativo generoso.** Cada sección respira; nunca más de una idea protagonista por pantalla.
3. **Mexicano, no folclórico.** Referencias abstractas (geometría, color, textura), nunca ilustración literal.
4. **Claridad antes que experimento.** En reserva, Mis reservas y admin, la composición es sobria y funcional; el experimento vive en Home, Menú y Detalle.
5. **Consistencia fotográfica.** Todas las fotos parecen de la misma sesión.
6. **Estados siempre legibles.** Color + icono + texto.

## 4. Paleta conceptual

| Rol | Nombre conceptual | Referencia | Uso |
|---|---|---|---|
| Fondo base | Nixtamal | Blanco cálido / hueso (≈ `#F4EFE6`) | Fondo general, fondos de foto |
| Texto y contraste | Obsidiana | Casi negro cálido (≈ `#161412`) | Texto, tipografía display, fondos oscuros de sección |
| Acento principal | Chile | Rojo-naranja profundo (≈ `#C4432A`) | CTAs, selección, detalles de marca (uso escaso) |
| Secundario | Nopal | Verde profundo (≈ `#2E4A3B`) | Secciones de contraste, estados “Disponible/Confirmada” |
| Neutro cálido | Cantera | Rosa-arena (≈ `#D8C3AE`) | Superficies, tarjetas, patrones |
| Destello | Maíz | Ocre-amarillo (≈ `#DDA43A`) | Insignias “Nuevo”, detalles puntuales, nunca texto sobre claro |
| Estados | — | Derivados verificados | Pendiente (ámbar), Confirmada (verde), Modificada (azul índigo apagado), Cancelada (gris), Completada (neutro), Ocupada (textura), Mantenimiento (gris + icono) |

Reglas: el acento Chile no supera ~10 % de la superficie de una pantalla; todos los pares texto/fondo cumplen `14-accessibility.md §5`; se definen versiones de cada color para hover, foco y deshabilitado. **[Supuesto]** No hay modo oscuro para el sitio en el MVP; secciones oscuras (Obsidiana) se usan como recurso editorial (DP-04).

## 5. Tipografía conceptual

| Rol | Carácter | Uso |
|---|---|---|
| Display | Serif contemporánea de alto contraste, o grotesca condensada expresiva; capaz de verse enorme | Slogan, títulos de sección, nombre de platillo en detalle |
| Texto / UI | Sans humanista o grotesca neutra, muy legible en tamaños pequeños, con números tabulares | Párrafos, formularios, admin, precios, horarios |
| Acento (opcional) | Mono o itálica para detalles (códigos de reserva, eyebrows) | `MESA-4F7K`, etiquetas pequeñas |

- Máximo 2 familias (+ opcional mono). Licencias libres para web.
- Escala tipográfica modular; el H1 del Hero puede ocupar 3 líneas a ancho completo en desktop.
- Números tabulares para precios, horas y códigos.
- Selección final de familias: fase de diseño (DP-05).

## 6. Composición y espacio

- Retícula de 12 columnas en desktop (ver `13 §1`), con composiciones asimétricas en Home y Detalle.
- Ritmo vertical amplio entre secciones de Home (≈ 1 viewport por sección en desktop, más compacto en móvil).
- Bordes: esquinas ligeramente redondeadas en componentes de UI (botones, tarjetas) y rectas en composiciones editoriales; decisión única y consistente.
- Líneas finas (1 px) como separadores y como recurso gráfico (bordes de mantel, “mesa”).
- En reserva y admin: retícula estricta, densidad media, sin ornamentos.

## 7. Gráficos mexicanos reinterpretados

| Referencia | Reinterpretación | Dónde |
|---|---|---|
| Papel picado | Retículas de perforaciones geométricas (círculos/rombos) sobre planos de color; se “perforan” o se completan con el scroll | Fondo del Hero, separadores de sección |
| Grecas (Mitla) | Líneas escalonadas simplificadas en trazo fino, usadas como bordes y como trayectorias de animación | Detalle de platillo, bordes de tarjetas destacadas |
| Talavera | Retícula modular de 4 cuadrantes reducida a formas planas de 2 colores | Patrón en CTA de reserva y confirmación |
| Maíz / tortilla | Círculos concéntricos y texturas de grano muy sutiles | Fondos de foto, estados de carga, logo |
| Cantera / arquitectura regional | Planos de color arena, texturas mineral muy suaves | Sección ubicación, mapa ilustrado |
| Comal / fuego | Gradiente radial cálido muy sutil | Detrás del taco 3D |

**Evitar:** sombreros, cactus caricaturizados, calaveras, sarapes literales, tipografías “western”, bigotes, colores saturados sin control, “Día de Muertos” como tema general.

## 8. Fotografía (platillos)

- **Técnica:** generadas con IA, fotorrealistas, consistentes entre los 25 elementos (BR-050).
- **Estilo:** minimalista contemporáneo; fondos neutros (Nixtamal/Cantera); luz natural lateral suave, sombras definidas pero suaves; composición limpia con mucho espacio negativo; vajilla de cerámica artesanal lisa (tonos arena, negro mate); sin manos, sin personas, sin texto, sin marcas.
- **Encuadre:** vista cenital para platos y tostadas, tres cuartos (≈ 30–45°) para tacos, bebidas y postres; el platillo ocupa ~40–55 % del cuadro.
- **Formato maestro:** 4:5 vertical, ≥ 1 600 px de alto; recortes derivados 1:1 y 16:9 para detalle.
- **Consistencia:** misma temperatura de color (cálida neutra), mismo tipo de superficie (lino o piedra clara), misma dirección de luz (izquierda).
- **Plantilla de prompt (orientativa):** “Fotografía editorial minimalista de {platillo}, {descripción visual}, servido en plato de cerámica artesanal {color}, sobre superficie de piedra clara, fondo neutro cálido, luz natural lateral desde la izquierda, sombras suaves, mucho espacio negativo, vista {cenital/tres cuartos}, fotorrealista, sin texto ni personas.”
- **Revisión de calidad:** comida plausible (sin ingredientes imposibles), texturas creíbles, sin artefactos; coherencia en una hoja de contacto de las 25 antes de aprobar.

## 9. Taco 3D

- Taco de short rib (platillo firma, destacado) con tortilla de maíz, carne deshebrada, cebolla encurtida y salsa de chile morita; fotorrealista, materiales físicos (PBR), iluminación cálida coherente con la fotografía.
- Presentación sin plato o sobre un plato mínimo; fondo transparente para integrarse con el Hero.
- Imagen estática de respaldo renderizada del mismo modelo (misma luz y ángulo).
- Presupuesto de rendimiento: ver `17-motion-interaction.md §4`.

## 10. Logo

- **Wordmark “Mesa”** con la tipografía display (o una derivada), con un rasgo propio: una línea horizontal fina que atraviesa o subraya la palabra como la superficie de una mesa.
- **Isotipo:** un rectángulo (mesa vista desde arriba) con un círculo (plato/tortilla) desplazado del centro; funciona a 16 px (favicon).
- Versiones: positiva (Obsidiana sobre Nixtamal), negativa, monocroma.
- Área de protección = altura de la “e”.
- No usar ilustraciones mexicanas literales en el logo.

## 11. Iconografía y avatares

- Iconos lineales de trazo uniforme (1.5–2 px), esquinas coherentes con los componentes; set propio mínimo: personas, reloj, calendario, mesa, ventana, terraza, silencio (tranquila), grupo, copa (barra), accesibilidad, candado (privada), herramienta (mantenimiento), estrella, etiquetas dietéticas.
- Avatares de reseñas: iniciales sobre formas geométricas de la paleta o ilustraciones abstractas; no fotos de personas.

## 12. Plano de mesas (lenguaje visual)

- Vista cenital estilizada, coherente con la idea rectora: mesas como rectángulos/círculos con sillas como puntos; zonas con tonos de superficie distintos (terraza con textura de piso exterior).
- Estados diferenciados por relleno, borde, icono y texto (ver `11 §2`); “Recomendada” con insignia, no solo color.
- El mismo plano (mismos colores y formas) en cliente y admin, para coherencia.

## 13. Componentes clave (intención)

Botón primario (Chile sobre Nixtamal o Nixtamal sobre Obsidiana), botón secundario (contorno), chip/tab, tarjeta de platillo, insignia de etiqueta, insignia de estado, campo de formulario, calendario, mesa, ficha de mesa, stepper de progreso, resumen de reserva, toast, diálogo, skeleton, tabla admin, tarjeta de indicador.
