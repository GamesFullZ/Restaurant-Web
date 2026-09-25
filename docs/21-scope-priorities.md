# 21 · Alcance y prioridades

> Prioridades definidas por la especificación: **P0** reserva, disponibilidad, mesas, Mis reservas, admin, persistencia y responsive. **P1** menú, detalle, reseñas y ubicación. **P2** refinamientos visuales, microinteracciones y detalles experimentales. Accesibilidad básica y manejo de errores se tratan como P0 porque sin ellos los flujos P0 no son utilizables por todos (ver nota en §6).

## 1. P0 · Imprescindible (sin esto no hay producto)

| Área | Incluye | Requisitos |
|---|---|---|
| Navegación | Header, menú móvil, CTA de reserva | FR-001 – FR-003 |
| Reserva | Flujo de 7 pasos, personas, horarios, fecha, mapa de mesas, ficha de mesa, recomendación por capacidad, ocasión, datos, resumen, confirmación y código | FR-025 – FR-036 (FR-031 preferencias: P1) |
| Disponibilidad | Cálculo dinámico, solapamiento, sin disponibilidad con alternativas, fuera de horario, conflicto simultáneo | FR-036 – FR-038, FR-045 |
| Mis reservas | Acceso, detalle, modificar, cancelar | FR-040 – FR-043 |
| Persistencia | Datos iniciales, persistencia local, restablecer demo | FR-046, FR-048 |
| Admin | Login demo, rutas protegidas, dashboard con indicadores y mapa, gestión de reservas, CRUD de menú, imágenes, papelera, bloqueo de mesas | FR-049 – FR-065 |
| Transversal | Errores consistentes, reduced motion, responsive, accesibilidad | FR-067, FR-069 – FR-071 |
| Motion funcional | Estados y selección de mesa, conflicto visible | M-09, M-10 |

## 2. P1 · Importante (completa la experiencia)

| Área | Incluye | Requisitos |
|---|---|---|
| Home | Hero (texto + imagen estática del taco), Concepto, Destacados, Reseñas con filtros y navegación, Restaurante y ubicación, mapa ilustrativo, Cómo llegar, CTA, footer | FR-004, FR-006 – FR-015 |
| Menú | Categorías, tabs con scroll, tarjetas, etiquetas, agotado, ocultos | FR-016 – FR-021 |
| Detalle | Página por platillo | FR-022 |
| Reserva | Preferencias de mesa, conservación del progreso, reservar de nuevo | FR-031 (prefs), FR-039, FR-044 |
| Sistema | Sincronización entre pestañas, skeletons, “Prueba estas funciones”, 404 | FR-047, FR-066, FR-068, FR-072 |
| Motion | Tabs, cambio de paso, reseñas, toasts/skeletons, mapa dashboard | M-04, M-05, M-08, M-12, M-13 |
| Contenido | 25 fotografías consistentes | BR-050 |

## 3. P2 · Deseable (pulido y diferenciación)

| Área | Incluye | Requisitos |
|---|---|---|
| Taco 3D | Modelo fotorealista reactivo al scroll | FR-005, M-01 |
| Hero | Animación de fondo | M-02 |
| Detalle | Animación por etapas, gráficos que se transforman, transición compartida, navegación Anterior/Siguiente y “También te puede gustar” | FR-023, FR-024, M-06, M-07 |
| Home | Entradas de sección experimentales | M-03 |
| Confirmación | Composición premium animada | M-11 |
| Menú | Filtro por etiquetas dietéticas | FR-019 (filtro) |

## 4. Orden de construcción sugerido

1. Datos y reglas (P0) → 2. Flujo de reserva + disponibilidad (P0) → 3. Mis reservas (P0) → 4. Admin (P0) → 5. Responsive y accesibilidad de P0 → 6. Home, Menú, Detalle, Reseñas, Ubicación (P1) → 7. Estados de carga, demo helper, sincronización (P1) → 8. Motion y 3D (P2) → 9. Pulido.

Regla: no se empieza P2 mientras haya pruebas P0 en rojo.

## 5. Fuera de alcance

| Excluido | Motivo / alternativa en la demo |
|---|---|
| Pagos reales, depósitos o garantías | No aplica; no se piden datos de pago |
| Autenticación de producción, cuentas de cliente, recuperación de contraseña | Admin demo fijo; clientes usan código + teléfono |
| Backend y base de datos reales | Persistencia local del navegador |
| Notificaciones reales (SMS, email, WhatsApp, push) | Mensajes “[Simulado]” |
| Integraciones externas indispensables (Google Maps real, calendarios, TPV) | Mapa ilustrativo; acciones simuladas |
| Email del cliente | Excluido por decisión de producto |
| Pedidos a domicilio, pedidos en línea, carrito | No forma parte del producto |
| Publicación de reseñas por usuarios | Reseñas simuladas de solo lectura |
| Creación de reservas desde admin (walk-ins), lista de espera | Fuera del MVP |
| Combinar mesas, grupos > 6 en línea | Mensaje con teléfono simulado |
| Edición de horarios, mesas, capacidades o características | Datos fijos |
| Drag & drop para ordenar el menú | Orden fijo por categoría |
| Multi-idioma | Solo español (es-MX) |
| Reportes históricos, exportaciones, analítica | Solo indicadores del día |
| Roles y múltiples usuarios admin | Un único usuario demo |
| Ingredientes y alérgenos detallados | La especificación prohíbe mostrar ingredientes; solo etiquetas |
| Modo oscuro | Supuesto; ver DP-04 |

## 6. Nota sobre accesibilidad

La especificación exige “accesibilidad completa” pero no la ubica en P0/P1/P2. Se considera **P0** para los flujos P0 (reserva, Mis reservas, admin) y se aplica a P1/P2 conforme se construyen. Las animaciones P2 siempre incluyen su alternativa de *reduced motion* como parte de su definición de terminado.
