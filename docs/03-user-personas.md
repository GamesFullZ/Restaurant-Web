# 03 · User personas

> Cinco arquetipos basados en el público objetivo (familias, parejas, amigos, ocasiones especiales) y en el operador del restaurante. Son ficticios y sirven para tomar decisiones de diseño; cada uno se conecta con journeys (`04`) y requisitos (`08`).

| ID | Persona | Segmento | Journey principal |
|---|---|---|---|
| P-01 | Ana y Diego | Pareja | J-01 |
| P-02 | Iván | Amigos | J-02 |
| P-03 | Familia Garza Leal (Lucía) | Familia | J-03 |
| P-04 | Regina | Ocasión especial | J-04 |
| P-05 | Tomás | Administrador | J-06 |

---

## P-01 · Ana y Diego — La pareja

- **Perfil:** 31 y 33 años, profesionistas en Monterrey. Salen a cenar un par de veces al mes; les gusta descubrir lugares nuevos con buena cocina y ambiente cuidado.
- **Dispositivo y contexto:** Ana reserva desde el celular, entre semana, en momentos cortos.
- **Objetivos:** reservar una cena tranquila para dos un viernes; saber qué van a comer antes de ir.
- **Necesidades:** ver el menú con fotos y precios; elegir una mesa tranquila o junto a la ventana; confirmar rápido.
- **Comportamiento:** exploran destacados y reseñas antes de decidir; comparan el menú con otros lugares; usan filtros de reseñas por “Cena en pareja”.
- **Frustraciones:** plataformas que asignan una mesa junto a la cocina o la entrada; formularios largos que piden email y crean cuentas; no saber si la reserva “quedó”.
- **Decisiones clave:** horario de cena (20:00), mesa (M01 Tranquila/Ventana o M06), sin ocasión especial.
- **Resultado esperado:** reserva confirmada en < 2 min con mesa elegida y código guardado.
- **Requisitos que la atienden:** FR-007, FR-009/FR-010, FR-016 – FR-022, FR-025 – FR-035.

## P-02 · Iván — El organizador del grupo de amigos

- **Perfil:** 27 años, organiza salidas con 5 amigos. Decide rápido y comparte los datos por chat.
- **Objetivos:** conseguir mesa para 6 un sábado por la noche, idealmente en zona social.
- **Necesidades:** saber de inmediato si hay lugar para 6; alternativas claras si no; un código fácil de compartir.
- **Comportamiento:** intenta el horario más popular (20:00); si no hay, prueba otros horarios antes que otro día.
- **Frustraciones:** “no hay disponibilidad” sin opciones; tener que llamar; que al final le den dos mesas separadas.
- **Decisiones clave:** personas (6), horario (20:00 → alternativa 21:00), mesa M09 (Ideal para grupos, Zona social) o M10.
- **Resultado esperado:** reserva para 6 en el mejor horario alternativo disponible; código copiado al portapapeles.
- **Requisitos:** FR-026, FR-028, FR-031, FR-035, FR-037.

## P-03 · Familia Garza Leal — La familia (Lucía coordina)

- **Perfil:** Lucía, 45 años, organiza la comida del domingo con su esposo, sus dos hijos y su papá, que usa silla de ruedas en trayectos largos.
- **Objetivos:** comida familiar a las 14:00 en una mesa accesible.
- **Necesidades:** identificar mesas accesibles; letra legible; poder cambiar la reserva si cambia el número de asistentes.
- **Comportamiento:** reserva con anticipación desde tablet o laptop; revisa la ubicación y cómo llegar; vuelve días después para modificar.
- **Frustraciones:** no saber si el lugar es accesible; tener que llamar para cualquier cambio; interfaces con texto pequeño o animaciones mareadoras.
- **Decisiones clave:** 4 personas → M07 (Terraza, Accesible); después cambia a 5 personas → debe elegir mesa de 6 (M09/M10, ninguna marcada Accesible; ver riesgo R-07) o mantener 4.
- **Resultado esperado:** reserva modificada sin llamar; entiende claramente cuál mesa conviene.
- **Requisitos:** FR-012 – FR-014, FR-029 – FR-031, FR-040 – FR-042, FR-069, FR-071.

## P-04 · Regina — La ocasión especial

- **Perfil:** 29 años, prepara una sorpresa de aniversario para su pareja.
- **Objetivos:** una mesa privada y tranquila, y dejar instrucciones (un postre con vela, discreción).
- **Necesidades:** indicar ocasión e instrucciones; sentirse segura de que el restaurante lo sabe; poder cancelar si el plan cambia.
- **Comportamiento:** planea con 1–2 semanas; lee reseñas con etiqueta “Aniversario” o “Sorpresa”; revisa el resumen dos veces.
- **Frustraciones:** campos genéricos de “comentarios” que nadie lee; no poder elegir el tipo de mesa.
- **Decisiones clave:** ocasión Aniversario/Sorpresa, instrucciones, mesa M03/M08 (Más privada) o sugerencia de cambio (BR-018).
- **Resultado esperado:** reserva con ocasión e instrucciones visibles en confirmación, Mis reservas y admin.
- **Requisitos:** FR-008 – FR-010, FR-031, FR-032, FR-034, FR-035, FR-043.

## P-05 · Tomás — El administrador (gerente de piso)

- **Perfil:** 38 años, gerente de Mesa. Usa laptop en la oficina y celular durante el servicio.
- **Objetivos:** saber cómo viene el día, confirmar reservas pendientes, resolver cambios y mantener el menú al día.
- **Necesidades:** indicadores claros del día; mapa de mesas por horario; buscar una reserva por nombre o código en segundos; marcar platillos agotados durante el servicio; bloquear una mesa dañada.
- **Comportamiento:** abre el dashboard al inicio de cada turno; durante el servicio usa el celular (tarjetas, acciones rápidas); al final marca completadas.
- **Frustraciones:** sistemas que requieren muchos clics; no ver qué reservas se ven afectadas por un cambio; borrar algo por error sin poder recuperarlo.
- **Decisiones clave:** confirmar / modificar / cancelar / completar; agotado vs. oculto; Mantenimiento vs. No disponible.
- **Resultado esperado:** operación del día controlada desde una sola vista, con cambios reflejados al instante en el sitio público.
- **Requisitos:** FR-049 – FR-065.

## Matriz persona × necesidades

| Necesidad | P-01 | P-02 | P-03 | P-04 | P-05 |
|---|---|---|---|---|---|
| Reserva rápida sin cuenta ni email | ●● | ●● | ● | ● | — |
| Elegir mesa visualmente | ●● | ● | ●● | ●● | ● (mapa) |
| Alternativas si no hay lugar | ● | ●● | ● | ● | — |
| Ocasión e instrucciones | ○ | ○ | ○ | ●● | ● (verlas) |
| Modificar / cancelar solo | ● | ● | ●● | ●● | ●● (admin) |
| Accesibilidad | ● | ● | ●● | ● | ● |
| Menú con fotos y etiquetas | ●● | ● | ● | ● | ●● (gestión) |

●● crítica · ● importante · ○ ocasional
