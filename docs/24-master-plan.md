# 24 · Plan maestro

> Secuencia del proyecto: **documentación → revisión de decisiones → ideación/diseño en Excalidraw → implementación → pruebas → responsive → accesibilidad → motion/polish → demo → portfolio**. Cada fase tiene objetivo, entradas, actividades, entregables y criterio de salida. No se avanza de fase sin cumplir el criterio de salida (salvo iteraciones explícitas).

## Visión general

```
F0 Documentación ─▶ F1 Revisión de decisiones ─▶ F2 Ideación en Excalidraw ─▶ F3 Diseño visual
      ✔ (esta fase)                                                               │
                                                                                  ▼
F9 Portfolio ◀─ F8 Demo ◀─ F7 Motion/polish ◀─ F6 Accesibilidad ◀─ F5 Responsive ◀─ F4 Implementación + pruebas
```

Las fases F4–F7 se solapan por incrementos (cada pantalla nace responsive y accesible), pero cada fase tiene su propia revisión final.

## F0 · Documentación ✔

- **Objetivo:** definir el producto como fuente de verdad sin escribir código.
- **Entregables:** `docs/01` – `docs/24` y `README.md`.
- **Salida:** revisión cruzada sin contradicciones; supuestos, decisiones pendientes y riesgos listados (`22`).

## F1 · Revisión de decisiones

- **Objetivo:** cerrar o confirmar las decisiones pendientes.
- **Actividades:** revisar DP-01 – DP-08 y supuestos SU-01 – SU-26 (`22`); confirmar valores por defecto o cambiarlos; actualizar documentos afectados y la matriz `23`.
- **Entregables:** registro de decisiones actualizado (sección “Decisiones pendientes” resuelta).
- **Salida:** ninguna DP abierta que afecte P0 (DP-05 y DP-06 pueden cerrarse en F3/F4).

## F2 · Ideación y diseño en Excalidraw

- **Objetivo:** explorar estructura y composición en baja fidelidad antes de lo visual.
- **Actividades:**
  1. Wireframes móvil primero de S-01 – S-10 y A-01 – A-10 siguiendo `06` y `13`.
  2. Diagramas de los flujos UF-04 – UF-09 y UF-11 – UF-13 con estados (`07`, `11`).
  3. Plano de mesas (`10 §4.3`) y sus estados; variantes lista/mapa.
  4. Storyboard del Hero/taco y del detalle de platillo (`17 §4`, `§6`).
  5. Revisión de coherencia cliente ↔ admin.
- **Entregables:** tablero Excalidraw con wireframes, flujos y storyboard.
- **Salida:** todas las pantallas P0 y P1 bocetadas en móvil y desktop; flujos validados contra `07`.

## F3 · Diseño visual

- **Objetivo:** convertir la dirección conceptual (`16`) en un sistema visual.
- **Actividades:** logo; paleta final con contrastes verificados; tipografías (DP-05); componentes clave (`16 §13`); pantallas clave en alta fidelidad (Home, Menú, Detalle, Mesa, Confirmación, Dashboard); generación de las 25 fotos (hoja de contacto, `16 §8`); modelo 3D o plan B (R-02).
- **Salida:** sistema visual aprobado; 25 fotos consistentes; activo 3D o respaldo definido.

## F4 · Implementación (+ pruebas continuas)

- **Objetivo:** construir según prioridades (`21 §4`).
- **Orden:**
  1. Elección de stack (DP-06) y estructura del proyecto.
  2. Datos iniciales y persistencia (FR-046, FR-048).
  3. Motor de reglas: disponibilidad, compatibilidad, recomendación, estados, validaciones (BR-001 – BR-039) con pruebas unitarias.
  4. Flujo de reserva P0 (FR-025 – FR-038) + E2E.
  5. Mis reservas (FR-040 – FR-044) + E2E.
  6. Admin (FR-049 – FR-065) + E2E.
  7. Home, Menú, Detalle, Reseñas, Ubicación (P1).
  8. Estados de carga, demo helper, sincronización, 404 (P1).
- **Regla:** cada funcionalidad cumple la Definition of Done (`01 §17`).
- **Salida:** T-001 – T-066 en verde (excepto las de motion P2).

## F5 · Responsive

- **Objetivo:** verificar y ajustar composiciones de `13` en la matriz de dispositivos (`20 §5`).
- **Salida:** T-068 en verde; sin scroll horizontal; barras inferiores y zonas táctiles correctas.

## F6 · Accesibilidad

- **Objetivo:** auditoría completa WCAG 2.2 AA (`14`).
- **Actividades:** auditoría automática; recorridos con teclado; VoiceOver y NVDA; contraste; zoom 200 %; reduced motion.
- **Salida:** T-069 en verde; checklist `14 §11` completo.

## F7 · Motion y polish (P2)

- **Objetivo:** añadir capas de motion con propósito (`17`) sin romper P0/P1.
- **Actividades:** taco 3D con presupuesto de rendimiento; fondo del Hero; entradas de sección; detalle por etapas; transición menú → detalle; confirmación premium; revisión de reduced motion por animación; ajuste fino visual.
- **Salida:** T-005, T-018, T-067 en verde; métricas de `20 §7` cumplidas; ninguna prueba P0/P1 en rojo.

## F8 · Demo

- **Objetivo:** presentar el producto de forma fiable.
- **Actividades:** ensayar `19-demo-script.md` dos veces desde datos restablecidos (desktop y móvil); grabar video de ~5 min; verificar panel “Prueba estas funciones”.
- **Salida:** guion ejecutado sin incidencias en ≤ 5 min.

## F9 · Portfolio

- **Objetivo:** contar el caso.
- **Entregables:** publicación del sitio; caso de estudio (problema, proceso, decisiones clave con documentos de apoyo, wireframes de Excalidraw, diseño, retos técnicos —disponibilidad dinámica, conflicto, 3D—, accesibilidad, resultados de pruebas); video de demo; enlace a la documentación.
- **Salida:** caso publicado.

## Hitos

| Hito | Fin de fase | Evidencia |
|---|---|---|
| H1 | F1 | Decisiones cerradas |
| H2 | F3 | Sistema visual + 25 fotos |
| H3 | F4 (P0) | Reserva, Mis reservas y admin funcionando con pruebas E2E |
| H4 | F4 (P1) | Sitio completo |
| H5 | F6 | Responsive y accesibilidad validados |
| H6 | F7 | Motion y 3D |
| H7 | F9 | Portfolio publicado |

## Gestión de cambios

1. Todo cambio de producto empieza en la documentación (no en el código).
2. Se actualiza el documento fuente de la regla (ver `README.md` → jerarquía) y luego los dependientes.
3. Se actualiza la matriz `23` y, si aplica, las pruebas `20`.
4. Se registra el cambio en `22` si altera un supuesto o una decisión.
