# 19 · Guion de demo (~5 minutos)

> Guion para presentar Mesa en una entrevista, video de portafolio o revisión. Recorrido cliente (≈ 3 min) y admin (≈ 2 min). Requiere datos recién restablecidos (G-03 → “Restablecer datos de demo”) y, de preferencia, dos pestañas: sitio y admin.

## Preparación (antes de empezar)

1. Abrir el sitio en desktop (1440 px) y restablecer datos de demo.
2. Pestaña 2: `/admin/login` (sin iniciar sesión todavía).
3. Anotar la fecha real de DO+4 (la muestra el panel “Prueba estas funciones”).
4. Verificar que el reloj no esté a menos de 2 h de las 20:00 de DO+2 (no afecta si DO+2 es futuro).

## Guion

| Tiempo | Pantalla | Acción | Qué decir (idea) |
|---|---|---|---|
| 0:00 | S-01 Hero | Cargar Home; hacer scroll lento | “Mesa es un restaurante mexicano contemporáneo ficticio. El texto manda; el taco 3D acompaña y reacciona al scroll.” |
| 0:20 | S-01.2–S-01.3 | Pasar por Concepto y Destacados | “Lo mexicano reinterpretado, sin clichés. Cuatro destacados: dos favoritos, uno nuevo, uno recomendado.” |
| 0:35 | S-01.4 | Filtrar reseñas “Aniversario”, luego Siguiente | “Reseñas simuladas filtrables por estrellas y ocasión.” |
| 0:45 | S-02 → S-03 | Ir al Menú, tocar tab “Platos fuertes”, abrir Pato en Adobo | “25 platillos, tabs sincronizadas con el scroll. Cada platillo tiene su experiencia de detalle.” |
| 1:05 | S-04.1–S-04.3 | “Reservar mesa”: 2 personas → 20:00 → fecha DO+2 | “Flujo guiado: personas, horario y fecha. El calendario muestra disponibilidad real por día.” |
| 1:25 | S-04.4 | Marcar preferencia “Cerca de ventana”; señalar M06 Ocupada (reserva de Valeria) y las recomendadas | “La disponibilidad es dinámica: esta mesa está ocupada a esa hora. El sistema recomienda, pero yo elijo.” Elegir M01. |
| 1:45 | S-04.5–S-04.7 | Ocasión Cumpleaños → aparece sugerencia → “Mantener mi mesa”; datos; Resumen | “Si la ocasión sugiere otra mesa, lo propone sin imponer.” |
| 2:00 | S-05 | Confirmar; copiar código | “Código único; estado Pendiente hasta que el restaurante confirme.” |
| 2:15 | S-07 → S-08 | “Ver mi reserva” → Modificar → horario 21:00 → Guardar | “Mis reservas con código y teléfono; modificar reutiliza el flujo guiado.” |
| 2:35 | G-03 → S-04 | Panel “Prueba estas funciones” → “Sin disponibilidad” | “Seis personas a las 20:00 ese día: no hay mesa; ofrece horarios y fechas alternativas.” Elegir 21:00. |
| 2:50 | G-03 | Activar “Simular reserva simultánea” (opcional si hay tiempo), elegir M10 y confirmar → E-05 | “Si alguien toma la mesa mientras reservo: ‘La disponibilidad acaba de cambiar’. Como ya no queda ninguna mesa de 6, vuelvo al calendario con alternativas y sin perder mis datos.” (Con un grupo de 2 regresaría directamente al mapa.) |
| 3:00 | A-01 → A-02 | Pestaña admin: admin / mesa-demo | “Panel demo. Indicadores del día y mapa del restaurante por horario.” |
| 3:20 | A-02 | Horario 21:00 del día de la reserva nueva (o DO0 20:00) | “Aquí aparece la reserva que acabo de hacer.” |
| 3:35 | A-03 → A-05 | Buscar “Leal” (MESA-B6RD) → Modificar 19:00 → 21:00 → Guardar; volver al dashboard y cambiar entre 19:00 y 21:00 | “Modifico desde admin y el mapa se actualiza al instante.” |
| 4:05 | A-04 | Abrir MESA-T2MV → Confirmar | “Estados: Pendiente, Confirmada, Modificada, Cancelada, Completada, con historial.” |
| 4:20 | A-06 | Marcar “Pato en Adobo” como agotado; mostrar el sitio | “Sigue visible como ‘Agotado temporalmente’.” |
| 4:35 | A-09/A-10 | Bloquear M06 como Mantenimiento con nota | “Aviso de reservas afectadas; la mesa aparece en mantenimiento para los clientes.” |
| 4:50 | Sitio | Recargar | “Todo persiste en el navegador: sin backend ni servicios externos.” |
| 5:00 | — | Cierre | “Producto, UX, UI, frontend e interacción en un mismo proyecto.” |

## Variantes

- **Móvil (2 min):** Home → Menú (tabs horizontales) → reserva completa con vista lista de mesas → Mis reservas → cancelar.
- **Accesibilidad (1 min):** flujo de reserva solo con teclado; activar “Reducir movimiento” en el footer.

## Plan de contingencia

| Problema | Acción |
|---|---|
| Datos alterados | Restablecer demo desde G-03 |
| El 3D no carga | Continuar: el respaldo estático es parte del diseño |
| Es lunes | El dashboard lo indica; usar “siguiente día operativo” |
| DO+2 está a < 2 h | Usar MESA-9QX2 (DO+3) para modificar |
