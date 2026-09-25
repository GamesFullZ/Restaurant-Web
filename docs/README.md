# Mesa · Documentación de planificación

> **Mesa** es un restaurante mexicano contemporáneo **ficticio** en Monterrey y el producto web que lo acompaña (sitio, reserva con selección de mesa y panel admin). Proyecto de portafolio.
> Esta carpeta es la **fuente de verdad** del producto. **No contiene código.** La implementación se hará después, siguiendo estos documentos.

*Un taco. Una mesa. Un lugar para disfrutar.*

## Índice

| # | Documento | Propósito |
|---|---|---|
| 01 | [PRD](01-PRD.md) | Visión, problema, objetivos, alcance, requisitos no funcionales, user stories, métricas y Definition of Done. Punto de entrada que conecta todo. |
| 02 | [Product brief](02-product-brief.md) | Resumen de una página: qué es, para quién, valor, diferenciadores, MVP. |
| 03 | [User personas](03-user-personas.md) | Pareja, amigos, familia, ocasión especial y administrador. |
| 04 | [User journeys](04-user-journeys.md) | Recorridos de cliente y admin con pasos, decisiones, estados y errores. |
| 05 | [Arquitectura de información](05-information-architecture.md) | Mapa del sitio, rutas, navegación, IDs de pantalla y vocabulario. |
| 06 | [Especificación de pantallas](06-screen-specification.md) | Propósito, contenido, acciones, estados y conexiones de cada pantalla. |
| 07 | [Flujos de usuario](07-user-flows.md) | UF-01 – UF-14, paso a paso con ramas de error. |
| 08 | [Requisitos funcionales](08-functional-requirements.md) | FR-001 – FR-072 con criterio de aceptación. |
| 09 | [Reglas de negocio](09-business-rules.md) | BR-001 – BR-057: horarios, capacidad, disponibilidad, estados, menú. |
| 10 | [Especificación de datos](10-data-specification.md) | Entidades, campos, relaciones, menú inicial, mesas, reseñas y reservas iniciales. |
| 11 | [Estados](11-state-specification.md) | Estados y transiciones de reserva, mesa, platillo, disponibilidad y pantallas. |
| 12 | [Errores y casos límite](12-error-edge-cases.md) | EC-xx con comportamiento y recuperación. |
| 13 | [Responsive](13-responsive-specification.md) | Composición en móvil, tablet y desktop. |
| 14 | [Accesibilidad](14-accessibility.md) | Teclado, foco, lectores, contraste, touch, reduced motion. |
| 15 | [Contenido](15-content-specification.md) | Textos, CTAs, mensajes y catálogo de errores E-xx. |
| 16 | [Dirección de diseño](16-design-direction.md) | Identidad, paleta y tipografía conceptuales, gráficos, fotografía, logo. |
| 17 | [Motion e interacción](17-motion-interaction.md) | Animaciones con propósito, taco 3D, reduced motion. |
| 18 | [Admin](18-admin-specification.md) | Login demo, dashboard e indicadores, reservas, menú, imágenes, mesas. |
| 19 | [Guion de demo](19-demo-script.md) | Demo de ~5 minutos (cliente + admin). |
| 20 | [Pruebas y aceptación](20-testing-acceptance.md) | Estrategia y T-001 – T-070. |
| 21 | [Alcance y prioridades](21-scope-priorities.md) | P0, P1, P2 y fuera de alcance. |
| 22 | [Riesgos y supuestos](22-risks-assumptions.md) | Supuestos SU-xx, decisiones pendientes DP-xx, riesgos R-xx, limitaciones. |
| 23 | [Trazabilidad](23-traceability.md) | Objetivo → requisito → regla → pantalla → flujo → criterio → prueba. |
| 24 | [Plan maestro](24-master-plan.md) | Fases desde documentación hasta portfolio. |

## Orden de lectura recomendado

1. **Contexto:** 02 → 01 → 21.
2. **Personas y experiencia:** 03 → 04 → 05 → 07 → 06.
3. **Normativa (implementación):** 09 → 10 → 08 → 11 → 12.
4. **Experiencia transversal:** 15 → 13 → 14 → 16 → 17 → 18.
5. **Verificación y ejecución:** 20 → 23 → 19 → 22 → 24.

Para implementar una funcionalidad: busca su FR en `08`, sigue sus BR en `09`, sus datos en `10`, sus estados en `11`, sus errores en `12`, sus textos en `15` y sus pruebas en `20` (la matriz `23` lo reúne en una fila).

## Documento fuente de verdad (jerarquía)

La especificación original del producto (“Mesa · Documentos de planificación”, 77 puntos) prevalece sobre todo lo demás. Dentro de esta carpeta, cada tema tiene un **documento dueño**:

| Tema | Documento dueño | Los demás… |
|---|---|---|
| Reglas (horarios, capacidad, disponibilidad, estados permitidos, plazos, menú) | **09** | citan BR-xxx, no redefinen |
| Datos, campos, valores iniciales | **10** | citan secciones de 10 |
| Qué debe hacer el sistema y cómo se acepta | **08** | citan FR-xxx |
| Estados visibles y transiciones | **11** (subordinado a 09) | — |
| Textos y mensajes | **15** | usan E-xx y textos de 15 |
| Pantallas y rutas | **05** (estructura) y **06** (contenido) | usan IDs S-/A-/G- |
| Prioridad y alcance | **21** | — |
| Supuestos y decisiones pendientes | **22** | marcan **[Supuesto]** en el lugar de uso |

## Cómo resolver contradicciones

1. **Especificación original** > documento dueño del tema > resto de documentos.
2. Entre documentos del mismo nivel: el más específico gana sobre el general (p. ej., `09` sobre `01`; `18` sobre `06` en admin; `15` sobre textos de ejemplo en otros documentos).
3. Si la contradicción afecta una regla sin dueño claro, se registra como decisión pendiente en `22` y **no** se implementa hasta resolverla.
4. Toda corrección se aplica en el documento dueño y luego en los dependientes, actualizando `23` en el mismo cambio.

## Convenciones

- IDs: `O-` objetivos · `US-` historias · `P-` personas · `J-` journeys · `UF-` flujos · `S-`/`A-`/`G-` pantallas · `FR-` requisitos · `NFR-` no funcionales · `BR-` reglas · `EC-` casos límite · `E-` mensajes de error · `M-` animaciones · `T-` pruebas · `SU-` supuestos · `DP-` decisiones pendientes · `R-` riesgos.
- Fechas de datos iniciales: notación `DO0`, `DO+n`, `DO-1` (`10 §9`).
- **[Supuesto]** marca información completada que no estaba en la especificación.
- `[Simulado]` marca acciones externas simuladas en la interfaz.

## Estado

- **Fase actual:** F0 Documentación completada (ver `24-master-plan.md`).
- **Siguiente paso:** F1 · Revisión de decisiones pendientes (DP-01 – DP-08 en `22`).
