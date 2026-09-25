# 07 · Flujos de usuario

> Cada flujo `UF-xx` conecta pantallas (`06`), estados (`11`), reglas (`09`) y errores (`12`). Notación: `[pantalla]`, `⟨decisión⟩`, `→` paso siguiente, `⇢` rama alternativa.

| ID | Flujo | Actor | Prioridad |
|---|---|---|---|
| UF-01 | Descubrir el restaurante | Visitante | P1 |
| UF-02 | Explorar el menú | Visitante | P1 |
| UF-03 | Ver un platillo | Visitante | P1 |
| UF-04 | Reservar (extremo a extremo) | Visitante | P0 |
| UF-05 | Seleccionar mesa | Visitante | P0 |
| UF-06 | Confirmar reserva (y conflicto) | Visitante / Sistema | P0 |
| UF-07 | Consultar Mis reservas | Cliente | P0 |
| UF-08 | Modificar reserva (cliente) | Cliente | P0 |
| UF-09 | Cancelar reserva (cliente) | Cliente | P0 |
| UF-10 | Acceder al panel admin | Admin | P0 |
| UF-11 | Gestionar una reserva (admin) | Admin | P0 |
| UF-12 | Gestionar un platillo (admin) | Admin | P0 |
| UF-13 | Bloquear / desbloquear mesa (admin) | Admin | P0 |
| UF-14 | Probar la demo y restablecer | Visitante / Admin | P1 |

---

## UF-01 · Descubrir el restaurante

**Objetivo:** entender qué es Mesa y decidir reservar o ver el menú.

1. `[S-01.1]` Lee el slogan; el taco reacciona al scroll. ⟨¿Actúa ya?⟩ → “Reservar mesa” ⇢ UF-04 · “Ver menú” ⇢ UF-02.
2. `[S-01.2]` Concepto: entiende la propuesta.
3. `[S-01.3]` Destacados: ⟨¿Le interesa un platillo?⟩ ⇢ UF-03.
4. `[S-01.4]` Reseñas: filtra por etiqueta (p. ej., “Aniversario”) y/o estrellas; navega. ⇢ E-28 si no hay resultados → “Quitar filtros”.
5. `[S-01.5]` Ubicación: revisa horarios e indicador abierto/cerrado; interactúa con el mapa; “Copiar dirección” o “Abrir en Google Maps” `[Simulado]`.
6. `[S-01.6]` CTA → UF-04.

**Estados relevantes:** taco cargando/respaldo; reseñas filtradas; mapa error (EC-93).
**Resultado:** el visitante conoce identidad, oferta, prueba social y ubicación.

## UF-02 · Explorar el menú

1. `[S-02]` Carga con skeleton → 5 categorías.
2. Toca una tab → desplazamiento a la categoría; o hace scroll → la tab activa cambia.
3. Identifica etiquetas (Vegano, Picante…) y agotados.
4. ⟨¿Platillo de interés?⟩ → UF-03.

**Resultado:** conoce la oferta completa. **Errores:** imagen falla (EC-92).

## UF-03 · Ver un platillo

1. `[S-03]` Desde S-01.3 o S-02.
2. Scroll: la foto cambia de escala/posición, la información aparece por etapas.
3. ⟨Siguiente acción⟩ → “Reservar mesa” (UF-04) · Anterior/Siguiente (UF-03) · “Volver al menú” (S-02 en la categoría del platillo).

⇢ Platillo oculto/eliminado/slug inválido → `[S-10]` (E-24) → “Ver menú”.

## UF-04 · Reservar (extremo a extremo)

**Precondición:** ninguna. **Resultado:** reserva Pendiente con código.

```
[S-04.1 Personas] → [S-04.2 Horario] → [S-04.3 Fecha] → [S-04.4 Mesa] → [S-04.5 Ocasión]
      │                                    │                  │
      ⇢ "Más de 6" (E-13, fin)             ⇢ E-01/E-02/E-04   ⇢ UF-05
                                           │  alternativas
                                           ▼
                        → [S-04.6 Tus datos] → [S-04.7 Resumen] → UF-06 → [S-05]
```

1. **Personas** (BR-008): elige N (1–6). ⇢ “Más de 6”: E-13, Llamar `[Simulado]`; no avanza.
2. **Horario** (BR-003): elige uno de los 11.
3. **Fecha**: el calendario muestra el estado de cada día para N + horario (11 §4.1).
   - ⟨Día Disponible / Pocas mesas⟩ → paso 4.
   - ⇢ Sin disponibilidad → E-01 + alternativas (BR-024): elegir horario alternativo (actualiza paso 2 y mantiene la fecha) o fecha alternativa (mantiene horario) → paso 4; o “Cambiar número de personas” → paso 1 (conserva horario y fecha y revalida).
   - ⇢ Lunes → E-02 + alternativas.
   - ⇢ Horario pasado/próximo (hoy) → E-04 + alternativas.
4. **Mesa** → UF-05.
5. **Ocasión**: Ninguna por defecto; si ≠ Ninguna, instrucciones opcionales; si Otra, “¿Qué celebran?” obligatorio (E-31). ⟨¿Sugerencia BR-018?⟩ → “Cambiar a Mesa NN” (actualiza mesa) o “Mantener mi mesa”.
6. **Tus datos**: nombre, teléfono, comentario (BR-025). Errores E-08/E-09/E-27.
7. **Resumen**: revisa; “Editar” en cualquier bloque regresa a ese paso y, al continuar, vuelve al Resumen (revalidando). → UF-06.

**Cambios hacia atrás (FR-039):** cambiar personas u horario/fecha puede limpiar la mesa (E-32); los demás datos se conservan.
**Salir:** “Salir” con datos → diálogo de confirmación.

## UF-05 · Seleccionar mesa

1. `[S-04.4]` Plano con estados para el contexto; hasta 2 “Recomendada” (BR-016).
2. ⟨Opcional⟩ Marca preferencias (chips) → recomendación recalculada.
3. Enfoca/toca una mesa → ficha:
   - Disponible → “Elegir esta mesa” → Seleccionada.
   - ⇢ Ocupada (E-10), No disponible (E-11/E-12), Mantenimiento → no seleccionable, motivo visible.
4. ⟨Alternativa⟩ “Ver como lista” → misma selección en formato lista.
5. “Continuar con Mesa NN” → S-04.5.

⇢ Cambio en vivo que ocupa la mesa seleccionada (EC-18) → deselección + E-05 en línea.
⇢ Ninguna mesa compatible disponible (p. ej., cambio en vivo) → vuelve a S-04.3 con E-01.

## UF-06 · Confirmar reserva (y conflicto simultáneo)

1. `[S-04.7]` “Confirmar reserva” → botón en estado “Confirmando…” (bloquea doble envío, EC-22).
2. Sistema revalida con datos persistidos (BR-022):
   - ⟨Fecha/horario aún válidos (BR-006/BR-007)?⟩ No ⇢ E-03/E-04 → S-04.3.
   - ⟨Duplicado por teléfono (BR-030)?⟩ Sí ⇢ E-15 → “Ver mi reserva” / “Elegir otro horario”.
   - ⟨Mesa disponible?⟩ No ⇢ **E-05 “La disponibilidad acaba de cambiar”** → S-04.4 con la mesa en Ocupada y el resto conservado (BR-023). ⇢ Si no quedan mesas compatibles → S-04.3 con E-01.
   - Si “Simular reserva simultánea” está activo (G-03): antes de revalidar, el sistema crea una reserva “Demo” en la mesa elegida → se produce el camino E-05. El interruptor se desactiva solo tras dispararse una vez.
3. Todo válido → genera código (BR-027), guarda en **Pendiente** (BR-028), historial “Creada”, marca la reserva como verificada en la sesión, limpia el borrador.
4. `[S-05]` Confirmación → “Ver mi reserva” (→ S-07 sin pedir datos) / “Volver al inicio”.

## UF-07 · Consultar Mis reservas

1. `[S-06]` Ingresa código y teléfono.
2. Validación de formato (E-07/E-08).
3. Búsqueda (BR-031):
   - Coincide → `[S-07]`.
   - ⇢ No coincide → E-06 (sin revelar qué campo), valores conservados.
4. `[S-07]` Ve estado y datos. Acciones según estado y plazo:
   - Modificable → UF-08 / UF-09.
   - ⇢ < 2 h → acciones deshabilitadas con E-14 (motivo plazo) y Llamar `[Simulado]`.
   - ⇢ Cancelada/Completada → “Reservar de nuevo”.

## UF-08 · Modificar reserva (cliente)

**Precondición:** verificada y BR-032.

1. `[S-07]` “Modificar reserva” → `[S-08.1]` ⟨¿Qué cambiar?⟩
2. **Rama A · Fecha, horario, personas o mesa** → `[S-08.2]` flujo guiado en modo edición:
   1. Pasos con valores precargados; se puede saltar directamente al paso a cambiar desde el resumen.
   2. La propia reserva no ocupa su mesa (BR-034).
   3. Resumen con Antes/Después → “Guardar cambios”.
   4. Revalidación: E-05 (conflicto, EC-50), E-15 (duplicado, EC-49), E-04 (plazo/horario).
   5. Éxito: estado **Modificada**, historial, mesa anterior liberada, toast → `[S-07]`.
3. **Rama B · Datos y ocasión** → `[S-08.3]` formulario → “Guardar cambios” → Modificada + historial → `[S-07]`. Si cambió el teléfono: aviso EC-48.
4. ⇢ Sin cambios → CTA deshabilitado (EC-47). ⇢ Abandonar → la reserva original no cambia.

## UF-09 · Cancelar reserva (cliente)

1. `[S-07]` “Cancelar reserva” → diálogo `[S-09]` (foco en “Mantener mi reserva”).
2. ⟨Confirma⟩ “Sí, cancelar reserva” → estado **Cancelada**, mesa liberada, historial → pantalla “Tu reserva fue cancelada.”
3. “Reservar de nuevo” → `[S-04.1]` con N precargado (FR-044).
⇢ “Mantener mi reserva” → cierra el diálogo sin cambios.

## UF-10 · Acceder al panel admin

1. Footer “Acceso administrador (demo)” o G-03 → `[A-01]`.
2. Credenciales admin / mesa-demo → `[A-02]` (o destino original).
⇢ Incorrectas → E-19. ⇢ Ruta protegida sin sesión → A-01 → destino (EC-71).
3. “Cerrar sesión” → A-01.

## UF-11 · Gestionar una reserva (admin)

1. `[A-02]` Ve indicadores y mapa de hoy. ⟨Entrada⟩ reserva en “Próximas reservas”, mesa del mapa o `[A-03]` con búsqueda/filtros.
2. `[A-04]` Detalle con historial. ⟨Acción⟩
   - **Confirmar** (Pendiente/Modificada) → Confirmada + toast.
   - **Modificar** → `[A-05]` → cambia fecha/hora/personas/mesa/datos con validación en vivo → Guardar → Modificada → vuelve a A-04; el mapa del dashboard refleja el cambio.
   - **Cancelar** → diálogo → Cancelada; mesa liberada.
   - **Marcar como completada** → solo si inicio ≤ ahora (EC-73).
3. ⇢ La reserva cambió en otra pestaña → E-29 (EC-72).
4. Comprobación: `[A-02]` mapa en el horario afectado muestra el nuevo estado.

## UF-12 · Gestionar un platillo (admin)

1. `[A-06]` Lista por categoría. ⟨Acción⟩
   - **Nuevo platillo** → `[A-07]` → campos + imagen (biblioteca o subida) + alt → Guardar → al final de su categoría → visible en `/menu`.
   - **Editar** → `[A-07]` precargado → Guardar. ⇢ E-21/E-22/E-23/E-17. ⇢ Salir sin guardar → EC-78.
   - **Marcar agotado / disponible** → insignia en sitio público.
   - **Ocultar / Mostrar** → desaparece/reaparece del sitio.
   - **Eliminar** → confirmación → Papelera + toast con “Deshacer” (8 s). ⇢ Era destacado → EC-79.
2. `[A-08]` Papelera → Restaurar (vuelve al final de su categoría) o Eliminar definitivamente (segunda confirmación).

## UF-13 · Bloquear / desbloquear mesa (admin)

1. Entrada: `[A-02]` mapa → mesa → “Bloquear” o `[A-09]` → “Bloquear”.
2. `[A-10]` Elige Mantenimiento / No disponible y nota opcional.
   - ⟨¿Reservas activas futuras en la mesa?⟩ Sí → aviso con lista y enlaces a A-05.
3. “Bloquear” → mesa en Mantenimiento / No disponible en admin y en el flujo público (todas las fechas); reservas afectadas con aviso “Mesa bloqueada — reasignar”.
4. ⟨Opcional⟩ Reasignar cada reserva afectada → UF-11 (Modificar).
5. “Desbloquear” → la mesa recupera su estado calculado.

## UF-14 · Probar la demo y restablecer

1. G-03 “Prueba estas funciones” → elegir escenario:
   - Reserva en 2 minutos → UF-04.
   - Consulta una reserva → `[S-06]` precargado → UF-07.
   - Sin disponibilidad → `[S-04]` con 6 personas, 20:00 y la fecha DO+4 preseleccionada → E-01.
   - Día cerrado → `[S-04.3]` con indicación de elegir un lunes → E-02.
   - Reserva simultánea → activar interruptor → completar UF-04 → E-05 en UF-06.
   - Panel admin → UF-10.
2. “Restablecer datos de demo” → confirmación → BR-056 → toast “Datos de demo restablecidos.” → `/`.
