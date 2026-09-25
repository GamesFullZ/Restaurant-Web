# 22 · Riesgos, supuestos y decisiones pendientes

> Todo lo que se completó sin estar en la especificación original se documenta aquí como **supuesto** `SU-xx` (marcado **[Supuesto]** en el documento de origen). Las **decisiones pendientes (DP)** tienen un valor por defecto ya aplicado en la documentación: si no se cambian, la implementación usa ese valor.

## 1. Supuestos

| ID | Supuesto | Dónde se aplica | Por qué |
|---|---|---|---|
| SU-01 | Dirección ficticia: Calle Padre Mier 1047 Ote., Barrio Antiguo, Centro, 64000 Monterrey, N.L. Teléfono 81 5550 1947, redes @mesa.mty | `10 §2`, `15` | La especificación pide dirección ficticia creíble en zona céntrica con arquitectura tradicional y moderna |
| SU-02 | Ventana de reserva de 60 días | BR-006 | Evita calendarios infinitos; realista |
| SU-03 | Anticipación mínima de 60 min para hoy | BR-007 | Evita reservas imposibles de atender |
| SU-04 | Grupos de 1 a 6 en línea; > 6 por teléfono (simulado) | BR-008, BR-009 | La mesa más grande es de 6 y no se combinan mesas |
| SU-05 | Compatibilidad: 1–2 → mesas de 2/4; 3–4 → 4/6; 5–6 → 6 | BR-010 | Equilibrio entre flexibilidad y uso eficiente de mesas |
| SU-06 | Afinidades ocasión → características y sugerencia no bloqueante en el paso Ocasión | BR-017, BR-018 | La recomendación debe considerar la ocasión, pero la ocasión se elige después de la mesa |
| SU-07 | Puntuación de recomendación (capacidad +2, preferencia +3, ocasión +1, grupos +1; 2 recomendadas) | BR-016 | Hace la recomendación explicable y comprobable |
| SU-08 | Los bloqueos de mesa aplican a todas las fechas hasta desbloquear; no cancelan reservas | BR-015, BR-038 | Simplicidad y seguridad (no se pierden reservas por error) |
| SU-09 | Estado inicial Pendiente | BR-028 | Da sentido a la acción “Confirmar” del admin (ver DP-01) |
| SU-10 | Un teléfono no puede tener dos reservas activas solapadas | BR-030 | Evita duplicados accidentales |
| SU-11 | Plazo de 2 h para que el cliente modifique/cancele | BR-032 | Práctica común; protege la operación |
| SU-12 | Sin transiciones automáticas de estado | BR-039 | Control del admin; demo predecible |
| SU-13 | “Bebidas y cervezas” es una sola categoría | BR-040 | La especificación la presenta agrupada en el menú inicial (ver DP-02) |
| SU-14 | Orden dentro de la categoría por posición; nuevos al final | BR-041 | Orden fijo sin drag & drop |
| SU-15 | Descripciones de platos fuertes, postres y bebidas; etiquetas de bebidas | `10 §7.5` | La especificación solo daba nombre y precio |
| SU-16 | Destacados fijos con regla de sustitución | BR-047 | La especificación no dice si el admin los elige |
| SU-17 | Imágenes subidas: JPG/PNG/WebP, ≤ 5 MB, redimensionadas a 1 600 px; alt obligatorio | BR-051 | Límite de almacenamiento local y accesibilidad |
| SU-18 | Datos iniciales con fechas relativas (DO0…) y 14 reservas | BR-055, `10 §9` | La demo debe tener “hoy” siempre poblado |
| SU-19 | Mesa M07 es la única accesible | `10 §4.2` | Así lo definen las características iniciales |
| SU-20 | Latencia simulada de 300–800 ms | FR-066 | Hacer visibles los estados de carga exigidos |
| SU-21 | Interruptor “Reducir movimiento” además de la preferencia del sistema | FR-069 | Control explícito para evaluadores |
| SU-22 | Reseñas con 7 etiquetas contextuales y fechas relativas | `10 §8` | La especificación pide “etiqueta contextual” sin lista |
| SU-23 | Zona horaria del dispositivo interpretada como America/Monterrey | `09` (notación de fechas), `10 §2` | No hay backend |
| SU-24 | Sin modo oscuro | `16 §4` | No mencionado; reduce alcance |
| SU-25 | Filtro de etiquetas dietéticas en el menú (P2) | FR-019 | Útil para audiencia general; opcional |
| SU-26 | Mapa ilustrativo propio (no servicio de mapas) | FR-013 | “Sin depender de servicios externos” |

## 2. Decisiones pendientes

| ID | Decisión | Opciones | Valor por defecto aplicado | Impacto si cambia |
|---|---|---|---|---|
| DP-01 | Estado inicial de una reserva creada por el cliente | a) Pendiente (admin confirma) · b) Confirmada automáticamente | **a) Pendiente** | Textos de S-05/S-07, indicadores, demo; con (b) “Confirmar” quedaría solo para reservas Modificadas |
| DP-02 | “Bebidas y cervezas”: 1 o 2 categorías | a) 1 categoría · b) “Bebidas” y “Cervezas” | **a) 1 categoría** | Tabs del menú (5 → 6), datos de categoría |
| DP-03 | Filtro por etiquetas en el menú | a) No incluir · b) Incluir (P2) | **b) Incluir como P2** | Poco; se puede omitir sin afectar otros requisitos |
| DP-04 | Modo oscuro | a) No · b) Sí | **a) No** | Paleta y pruebas de contraste duplicadas |
| DP-05 | Familias tipográficas finales y valores exactos de color | — | Dirección conceptual en `16` | Se decide en la fase de diseño (Excalidraw → diseño visual) |
| DP-06 | Stack tecnológico de implementación | Cualquier stack web moderno que cumpla persistencia local, 3D y rendimiento | **Sin decidir** (se elige al iniciar implementación; no afecta la especificación) | Solo implementación |
| DP-07 | Plazo de cambios del cliente (2 h) y anticipación (60 min) | Valores alternativos | **2 h / 60 min** | Reglas BR-007, BR-032 y pruebas asociadas |
| DP-08 | Mesa accesible para grupos de 5–6 | a) Mantener características iniciales · b) Marcar M10 también como Accesible | **a) Mantener** (la especificación fija las características) | Recomendaciones y J-03 |

## 3. Riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| R-01 | El taco 3D afecta rendimiento o legibilidad | Media | Alto | Presupuesto de peso, carga diferida, respaldo estático, zonas de exclusión con el H1, P2 |
| R-02 | Obtener un modelo 3D fotorealista de calidad | Media | Medio | Plan B: secuencia de imágenes renderizadas o imagen con parallax; no bloquea P0/P1 |
| R-03 | Inconsistencia visual entre las 25 fotos IA | Alta | Medio | Prompt plantilla, hoja de contacto, revisión antes de integrar (`16 §8`) |
| R-04 | Límite de almacenamiento local con imágenes subidas | Media | Medio | Redimensionado, almacenamiento de objetos del navegador, E-17 |
| R-05 | Conflicto simultáneo difícil de demostrar en un solo navegador | Alta | Medio | Interruptor “Simular reserva simultánea” y prueba con dos pestañas |
| R-06 | Datos iniciales “envejecen” (reservas de hoy pasan a ser pasadas) | Alta | Bajo | Fechas relativas; sugerencia de restablecer si > 7 días (EC-66) |
| R-07 | No existe mesa accesible para 5–6 personas | Media | Medio | Documentado (DP-08); recomendación explica la ausencia; teléfono simulado |
| R-08 | El orden del flujo (horario antes de fecha) sorprende a usuarios acostumbrados a fecha primero | Media | Medio | Microcopy claro, disponibilidad visible por día, alternativas; se valida en pruebas con usuarios |
| R-09 | Sobrealcance en motion experimental | Alta | Medio | Prioridad P2, inventario con propósito (`17 §11`), regla “no P2 con P0 en rojo” |
| R-10 | La accesibilidad del mapa de mesas es compleja | Media | Alto | Vista lista equivalente, patrón de rejilla/botones, pruebas con lector |
| R-11 | Diferencias de zona horaria del dispositivo del evaluador | Baja | Medio | Documentado (SU-23); textos muestran horas locales |
| R-12 | El evaluador no descubre las funciones avanzadas | Media | Alto | Panel “Prueba estas funciones”, guion de demo |
| R-13 | Confusión entre acciones reales y simuladas | Baja | Medio | Etiqueta “Simulado” siempre visible (BR-057) |

## 4. Limitaciones de la demo

- Los datos viven solo en el navegador del visitante: otro dispositivo no ve las mismas reservas.
- El login admin es visible y público: es una demostración, no seguridad.
- La “simultaneidad” solo existe entre pestañas del mismo navegador o mediante la simulación.
- No se envía ninguna comunicación real al cliente.
- Borrar datos del navegador reinicia la demo.

## 5. Decisiones potencialmente cambiables (bajo costo de cambio)

Plazos (DP-07), número de recomendaciones (2), latencia simulada, textos, orden de indicadores del dashboard, número de alternativas (3), duración del toast de deshacer (8 s), límite de caracteres de campos.

## 6. Registro de la revisión cruzada (F0)

Correcciones aplicadas al revisar todos los documentos entre sí:

| # | Hallazgo | Corrección |
|---|---|---|
| 1 | La ocasión se elige después de la mesa, pero la recomendación debe considerar la ocasión (spec 32 vs. 38) | Recomendación por capacidad y preferencias en el paso Mesa; por ocasión como sugerencia no bloqueante en el paso Ocasión y como criterio completo en modificaciones (BR-016 – BR-018) |
| 2 | Pesos de recomendación hacían que una preferencia explícita (p. ej., Terraza) perdiera frente al ajuste de capacidad | Preferencia +3, capacidad +2 (BR-016); pruebas T-026 y ejemplos de J-01 recalculados |
| 3 | Conteo de pendientes de DO0 inconsistente | 2 Pendientes (MESA-T2MV, MESA-P4JS); MESA-Z8CE es Modificada (FR-051, `18 §3.2`, T-052) |
| 4 | Estado de mesas grandes para grupos pequeños ambiguo frente a “Ocupada” | Prioridad explícita en BR-013 (capacidad incompatible antes que ocupación); T-024 corregido |
| 5 | Colisión de identificadores entre pantallas `S-xx` y supuestos | Supuestos renombrados a `SU-xx` |
| 6 | Ocupación del día sin definición calculable | Fórmula y ejemplo (25 %) en `18 §3.2` |
| 7 | Escenario de conflicto simulado con grupo de 6 no regresaba al mapa | Documentado el regreso a Fecha cuando no quedan mesas compatibles (BR-023, EC-21, `19`) |
| 8 | Reservas creadas por la simulación podían chocar con BR-030 | Datos fijos y exención documentados en `10 §6` |

Resultado: sin referencias a IDs inexistentes (FR, BR, EC, E, T, UF, DP, R, SU, M, J, P, pantallas) y cobertura completa en `23 §4`.
