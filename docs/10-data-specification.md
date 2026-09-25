# 10 · Especificación de datos

> Define entidades, campos, relaciones, estados, ejemplos y valores iniciales. **No es código**: los nombres de campo son conceptuales y la implementación puede traducirlos a su convención, respetando significado, tipos y restricciones.
> Reglas asociadas: `09-business-rules.md`. Estados y transiciones: `11-state-specification.md`.

## 1. Mapa de entidades

```
Restaurante (config, 1)
 ├── Turno (2) ── HorarioReservable (11)
 ├── Mesa (10) ── BloqueoMesa (0..1 activo por mesa)
 ├── Reserva (n) ── EventoHistorial (1..n)
 │       └── referencia → Mesa (1)
 ├── Categoría (5) ── Platillo (≈25) ── Imagen (1)
 │                        └── Etiqueta (0..7, de catálogo fijo)
 ├── Reseña (10)
 ├── SesiónAdmin (0..1, por pestaña)
 └── MetaDemo (1)
```

Relaciones clave:

- Una **Reserva** pertenece a **una Mesa**; una Mesa tiene muchas Reservas (en distintos intervalos).
- Una **Mesa** tiene como máximo **un BloqueoMesa activo**.
- Un **Platillo** pertenece a **una Categoría** y referencia **una Imagen** (de la biblioteca inicial o subida).
- Las **Etiquetas**, **Ocasiones**, **Categorías**, **Horarios** y **Estados** son catálogos fijos.
- La **disponibilidad no es una entidad persistida**: se deriva (BR-021).

## 2. Restaurante (configuración fija)

| Campo | Tipo | Valor |
|---|---|---|
| nombre | texto | Mesa |
| slogan | texto | Un taco. Una mesa. Un lugar para disfrutar. |
| descripciónCorta | texto | Cocina mexicana contemporánea en el corazón de Monterrey. |
| dirección | texto | Calle Padre Mier 1047 Ote., Barrio Antiguo, Centro, 64000 Monterrey, N.L. *(ficticia)* |
| referencia | texto | A dos cuadras de la Macroplaza, frente a la plaza del Barrio Antiguo. *(ficticia)* |
| coordenadasSimuladas | par numérico | Posición del pin en el mapa ilustrado (no coordenadas reales). |
| teléfono | texto | 81 5550 1947 *(ficticio; “Llamar” es simulado)* |
| redes | texto | @mesa.mty *(ficticio, no enlaza)* |
| zonaHoraria | texto | America/Monterrey |
| díasOperación | lista | martes–domingo |
| duraciónReserva | minutos | 90 |
| ventanaReservaDías | entero | 60 |
| anticipaciónMínimaMin | entero | 60 |
| plazoCambioClienteMin | entero | 120 |
| maxPersonasEnLínea | entero | 6 |

## 3. Turnos y horarios reservables

| Turno | Servicio | Horarios reservables |
|---|---|---|
| Comida | 13:00–17:00 | 13:00, 13:30, 14:00, 14:30 |
| Cena | 18:00–22:30 | 18:00, 18:30, 19:00, 19:30, 20:00, 20:30, 21:00 |

**HorarioReservable**: `hora` (HH:MM, 24 h), `turno` (Comida | Cena). Catálogo fijo de 11 elementos (BR-003).

## 4. Mesa

| Campo | Tipo | Restricciones | Ejemplo |
|---|---|---|---|
| id | texto | M01–M10, fijo | M06 |
| nombreVisible | texto | “Mesa 06” | Mesa 06 |
| capacidad | entero | 2, 4 o 6 | 4 |
| zona | enum | Ventanal, Interior, Barra, Terraza | Ventanal |
| características | lista de enum | ver catálogo §4.1 | [Tranquila, Cerca de ventana] |
| descripciónCorta | texto | ≤ 80 caracteres | “Junto al ventanal, lejos del paso.” |
| posiciónPlano | coordenadas relativas | posición y forma en el mapa | — |
| bloqueo | BloqueoMesa \| vacío | máx. 1 activo | vacío |

### 4.1 Catálogo de características

Cerca de ventana · Terraza · Tranquila · Zona social · Más privada · Cerca de barra · Interior · Accesible · Ideal para grupos.

### 4.2 Mesas iniciales

| Mesa | Cap. | Zona | Características | Descripción corta |
|---|---|---|---|---|
| M01 | 2 | Ventanal | Cerca de ventana, Tranquila | Rincón junto al ventanal, ideal para conversar. |
| M02 | 2 | Barra | Zona social, Cerca de barra | Frente a la barra, con vista a la coctelería. |
| M03 | 2 | Interior | Más privada, Interior | Mesa resguardada al fondo del salón. |
| M04 | 2 | Terraza | Terraza, Cerca de ventana | En el borde de la terraza, junto al ventanal. |
| M05 | 4 | Barra | Zona social, Interior | En el centro del salón, cerca del ambiente. |
| M06 | 4 | Ventanal | Tranquila, Cerca de ventana | Junto al ventanal, lejos del paso. |
| M07 | 4 | Terraza | Terraza, Accesible | Acceso sin escalones y espacio para silla de ruedas. |
| M08 | 4 | Interior | Más privada, Interior | Mesa semiprivada con biombo de celosía. |
| M09 | 6 | Barra | Ideal para grupos, Zona social | Mesa larga para compartir cerca de la barra. |
| M10 | 6 | Terraza | Más privada, Terraza | Esquina reservada de la terraza. |

**[Supuesto]** Solo M07 está marcada como Accesible; todas las mesas son alcanzables, pero M07 garantiza acceso sin escalones y espacio de maniobra. Se registra el riesgo R-07 (no existe mesa accesible de 6).

### 4.3 Plano esquemático (referencia de composición, no diseño final)

```
┌──────────────────── FACHADA · VENTANALES ─────────────────────┬──────────────┐
│  (M01·2)            (M06·4)                                     │   TERRAZA    │
│                                                                 │   (M04·2)    │
│  (M03·2)                 (M05·4)             (M09·6)            │   (M07·4) ♿  │
│  (M08·4)   INTERIOR                                             │   (M10·6)    │
│                    ════════ BARRA ════════   (M02·2)            │              │
│  ▸ Entrada                                         Cocina ▪     │              │
└─────────────────────────────────────────────────────────────────┴──────────────┘
```

## 5. BloqueoMesa

| Campo | Tipo | Restricciones |
|---|---|---|
| tipo | enum | Mantenimiento \| No disponible |
| nota | texto | opcional, ≤ 140 caracteres |
| creadoEn | fecha-hora | automático |
| creadoPor | texto | “admin” |

Al desbloquear, el bloqueo se elimina (no se conserva histórico en el MVP).

## 6. Reserva

| Campo | Tipo | Restricciones | Ejemplo |
|---|---|---|---|
| id | identificador interno | único | r_001 |
| código | texto | `MESA-XXXX`, único, inmutable (BR-027) | MESA-4F7K |
| fecha | fecha (AAAA-MM-DD) | día operativo, dentro de ventana | 2026-09-29 |
| horario | HorarioReservable | uno de los 11 | 20:00 |
| personas | entero | 1–6 | 2 |
| mesaId | referencia Mesa | compatible (BR-010) | M06 |
| ocasión | enum | Ninguna, Cumpleaños, Aniversario, Sorpresa, Otra | Aniversario |
| ocasiónOtra | texto | obligatorio si ocasión = Otra; 2–40 | — |
| instruccionesOcasión | texto | opcional; ≤ 200; solo si ocasión ≠ Ninguna | “Traeremos un pastel pequeño.” |
| nombre | texto | 2–60 | Valeria Treviño |
| teléfono | texto normalizado | 10 dígitos | 8112345678 |
| comentario | texto | opcional; ≤ 300 | “Preferimos lejos del aire acondicionado.” |
| estado | enum | Pendiente, Confirmada, Modificada, Cancelada, Completada | Confirmada |
| origen | enum | Cliente \| Datos iniciales \| Demo (conflicto simulado) | Cliente |
| creadaEn | fecha-hora | automático | — |
| actualizadaEn | fecha-hora | automático | — |
| historial | lista de EventoHistorial | ≥ 1 (creación) | — |

Reservas de origen **Demo** (creadas por “Simular reserva simultánea”, FR-068): nombre “Reserva simultánea (demo)”, teléfono 81 0000 0000, ocasión Ninguna, estado Pendiente; se muestran con la etiqueta “Demo” en admin y están exentas de BR-030.

Campos derivados (no se guardan): `inicio`, `fin` (inicio + 90 min), `esActiva` (estado ∈ Pendiente, Confirmada, Modificada), `ocupaMesa` (BR-019), `esModificablePorCliente` (BR-032), `avisos` (“Mesa bloqueada — reasignar”, “Pendiente de cerrar”).

Teléfono en pantalla: formato `81 1234 5678`. En la vista pública de Mis reservas se muestra enmascarado `81 •••• 5678`.

### 6.1 EventoHistorial

| Campo | Tipo | Ejemplo |
|---|---|---|
| fechaHora | fecha-hora | 2026-09-25 18:40 |
| actor | enum Cliente \| Admin \| Sistema | Cliente |
| acción | enum Creada, Confirmada, Modificada, Cancelada, Completada | Modificada |
| cambios | lista {campo, antes, después} | [{horario, 19:00, 20:00}] |

## 7. Menú

### 7.1 Categoría (catálogo fijo, BR-040)

| Orden | id | Nombre visible |
|---|---|---|
| 1 | entradas | Entradas |
| 2 | antojitos | Antojitos |
| 3 | platos-fuertes | Platos fuertes |
| 4 | postres | Postres |
| 5 | bebidas | Bebidas y cervezas |

### 7.2 Etiqueta (catálogo fijo, BR-044)

Vegetariano · Picante · Vegano · Sin gluten · Recomendado · Nuevo · Favorito de la casa.

### 7.3 Platillo

| Campo | Tipo | Restricciones |
|---|---|---|
| id | identificador | único, inmutable |
| slug | texto | derivado del nombre (BR-048) |
| nombre | texto | 2–60, único |
| descripción | texto | 10–160 |
| precio | entero MXN | 1–9 999 |
| categoríaId | referencia | una de las 5 |
| posición | entero | orden dentro de la categoría (BR-041) |
| etiquetas | lista | 0–7 del catálogo |
| imagenId | referencia Imagen | obligatoria (placeholder si falta) |
| disponibilidad | enum | Disponible \| Agotado temporalmente \| Oculto |
| eliminadoEn | fecha-hora \| vacío | con valor = en Papelera |
| actualizadoEn | fecha-hora | automático |

**No existe campo de ingredientes** (BR-043).

### 7.4 Imagen

| Campo | Tipo | Restricciones |
|---|---|---|
| id | identificador | único |
| origen | enum | Inicial \| Subida |
| recurso | archivo local / referencia a almacenamiento local | ≤ 1 600 px lado mayor |
| alt | texto | 5–120 |
| creadaEn | fecha-hora | — |

Las 25 imágenes iniciales viven como archivos estáticos del sitio; las subidas se guardan en el almacenamiento local del navegador (ver §10).

### 7.5 Menú inicial (25 elementos)

Descripciones de Platos fuertes, Postres y Bebidas y la línea de las cervezas son **[Supuesto]** (la especificación solo daba nombre, precio y etiquetas). Etiquetas de bebidas: **[Supuesto]**.

| # | Categoría | Nombre | Precio | Descripción | Etiquetas |
|---|---|---|---|---|---|
| 1 | Entradas | Tostada de Atún | $185 | Atún fresco, aguacate, chile serrano y cítricos. | Recomendado |
| 2 | Entradas | Queso Fundido al Mezcal | $165 | Queso fundido, mezcal, chile poblano y tortillas. | Favorito de la casa |
| 3 | Entradas | Esquites Cremosos | $125 | Maíz asado, crema de chile ancho, queso fresco y limón. | Vegetariano |
| 4 | Entradas | Coliflor Rostizada | $145 | Coliflor, mole ligero, semillas tostadas y hierbas. | Vegano, Sin gluten |
| 5 | Antojitos | Taco de Short Rib | $195 | Short rib, cebolla encurtida y salsa de chile morita. | Favorito de la casa |
| 6 | Antojitos | Taco de Camarón | $175 | Camarón, crema de aguacate, col y cítricos. | Recomendado |
| 7 | Antojitos | Quesadilla de Hongos | $155 | Hongos, queso Oaxaca y salsa verde. | Vegetariano |
| 8 | Antojitos | Sopes de Birria | $165 | Birria de res, frijoles, queso fresco y cebolla encurtida. | Nuevo |
| 9 | Platos fuertes | Mole de Pollo | $265 | Pollo en mole de la casa, ajonjolí tostado y arroz rojo. | Recomendado, Sin gluten |
| 10 | Platos fuertes | Pescado a la Talla | $295 | Pesca del día a las brasas con adobo rojo y verde. | Sin gluten |
| 11 | Platos fuertes | Costilla de Res | $345 | Costilla braseada lentamente con jugo de chiles secos. | Favorito de la casa |
| 12 | Platos fuertes | Enchiladas de Mole | $235 | Enchiladas de queso fresco bañadas en mole poblano. | Vegetariano |
| 13 | Platos fuertes | Pato en Adobo | $325 | Pato confitado en adobo de chiles secos y camote asado. | Nuevo |
| 14 | Platos fuertes | Arroz Cremoso de Hongos | $225 | Arroz cremoso con hongos de temporada y epazote. | Vegetariano |
| 15 | Platos fuertes | Cerdo en Salsa de Chile | $255 | Cerdo cocinado lentamente en salsa de guajillo y árbol. | Picante |
| 16 | Postres | Pastel de Elote | $135 | Pastel húmedo de elote con cajeta tibia. | Favorito de la casa |
| 17 | Postres | Flan de Cajeta | $125 | Flan sedoso con cajeta y nuez garapiñada. | Recomendado |
| 18 | Postres | Chocolate y Chile | $145 | Chocolate oscuro con un final picante de chile ancho. | Picante |
| 19 | Postres | Buñuelo de Canela | $115 | Buñuelo crujiente con azúcar de canela y piloncillo. | Vegetariano |
| 20 | Bebidas y cervezas | Agua de Jamaica | $65 | Infusión fría de flor de jamaica, ligeramente dulce. | Vegano |
| 21 | Bebidas y cervezas | Horchata de Vainilla | $70 | Horchata tradicional con un toque de vainilla. | Vegetariano |
| 22 | Bebidas y cervezas | Agua de Pepino y Limón | $70 | Pepino fresco, limón y hierbabuena. | Vegano |
| 23 | Bebidas y cervezas | Margarita de la Casa | $155 | Tequila blanco, cítricos y sal de chile. | — |
| 24 | Bebidas y cervezas | Cerveza Clara | $85 | Cerveza artesanal regional, ligera y refrescante. | — |
| 25 | Bebidas y cervezas | Cerveza Ámbar | $90 | Cerveza artesanal regional con notas tostadas. | — |

Todos inician en **Disponible**, sin `eliminadoEn`. Destacados de Home (BR-047): #5, #11, #13, #1.

## 8. Reseña

| Campo | Tipo | Restricciones |
|---|---|---|
| id | identificador | único |
| nombre | texto | nombre + inicial del apellido |
| avatar | imagen ilustrada / iniciales | no fotografías de personas reales |
| estrellas | entero | 1–5 |
| fecha | fecha | relativa a la fecha de carga (desplazamiento en días) |
| comentario | texto | 80–280 caracteres |
| etiqueta | enum | Cena en pareja, Aniversario, Cumpleaños, Con amigos, En familia, Comida de negocios, Sorpresa |

### 8.1 Reseñas iniciales (ficticias)

| # | Nombre | ★ | Hace (días) | Etiqueta | Comentario |
|---|---|---|---|---|---|
| 1 | Mariana G. | 5 | 3 | Aniversario | Nos dieron una mesa junto al ventanal y todo fluyó. El taco de short rib es de otro nivel y el servicio estuvo atento sin ser invasivo. |
| 2 | Carlos R. | 5 | 6 | Con amigos | Fuimos seis y la mesa larga cerca de la barra fue perfecta para compartir. El queso fundido al mezcal desapareció en minutos. |
| 3 | Lucía M. | 4 | 9 | En familia | Buen ambiente para ir con mis papás. La costilla de res se deshace. Me hubiera gustado un poco más de variedad en postres. |
| 4 | Jorge P. | 5 | 12 | Cumpleaños | Reservé en dos minutos desde el celular y elegí la mesa en el mapa. Llegamos y todo estaba listo para el festejo. |
| 5 | Ana Sofía T. | 4 | 16 | Cena en pareja | La tostada de atún es fresquísima y la margarita de la casa está muy bien balanceada. El lugar se llena, conviene reservar. |
| 6 | Roberto V. | 3 | 21 | Comida de negocios | La comida muy buena, pero en hora pico el servicio fue algo lento. Aun así volvería por el mole de pollo. |
| 7 | Fernanda L. | 5 | 27 | Sorpresa | Organicé una sorpresa y dejé instrucciones en la reserva; el equipo las siguió al pie de la letra. Muy recomendable. |
| 8 | Diego H. | 4 | 33 | Con amigos | Los sopes de birria son nuevos y valen totalmente la pena. La terraza de noche tiene muy buena vibra. |
| 9 | Patricia C. | 5 | 40 | En familia | Fuimos con mi mamá en silla de ruedas y la mesa accesible en la terraza fue muy cómoda. Gracias por el cuidado. |
| 10 | Emilio S. | 4 | 48 | Cena en pareja | Una cocina mexicana distinta, sin clichés. El pastel de elote cierra perfecto. Volveremos para probar el pato. |

Promedio: 4.4 ★ (10 reseñas).

## 9. Reservas iniciales

**Notación:** `DO0` = primer día operativo igual o posterior a hoy (si hoy es martes–domingo, es hoy). `DO+n` = n-ésimo día operativo posterior a DO0. `DO-1` = día operativo anterior a DO0. Los lunes nunca cuentan como día operativo.

| Código | Nombre | Teléfono | Pers. | Fecha | Hora | Mesa | Ocasión | Estado | Propósito en la demo |
|---|---|---|---|---|---|---|---|---|---|
| MESA-4F7K | Valeria Treviño | 81 1234 5678 | 2 | DO+2 | 20:00 | M06 | Aniversario | Confirmada | **Demo Mis reservas** (modificar/cancelar) |
| MESA-9QX2 | Rodrigo Garza | 81 2345 6789 | 4 | DO+3 | 19:00 | M05 | Ninguna | Pendiente | Segunda reserva de prueba |
| MESA-H3N8 | Mariana Cantú | 81 3456 7890 | 2 | DO0 | 13:30 | M01 | Ninguna | Confirmada | Dashboard “hoy” |
| MESA-K7PW | Luis Villarreal | 81 4567 8901 | 4 | DO0 | 14:00 | M07 | Ninguna | Confirmada | Dashboard “hoy” |
| MESA-T2MV | Sofía Salinas | 81 5678 9012 | 6 | DO0 | 14:30 | M09 | Cumpleaños | Pendiente | Acción Confirmar |
| MESA-B6RD | Andrés Leal | 81 6789 0123 | 2 | DO0 | 19:00 | M02 | Ninguna | Confirmada | Dashboard “hoy” |
| MESA-Z8CE | Daniela Elizondo | 81 7890 1234 | 4 | DO0 | 20:00 | M08 | Sorpresa | Modificada | Estado Modificada con historial |
| MESA-P4JS | Jorge Martínez | 81 8901 2345 | 6 | DO0 | 20:30 | M10 | Ninguna | Pendiente | Dashboard “hoy” |
| MESA-W5GA | Paulina Montemayor | 81 9012 3456 | 2 | DO0 | 21:00 | M04 | Aniversario | Confirmada | Próxima reserva nocturna |
| MESA-C9UF | Emilio Zambrano | 81 0123 4567 | 3 | DO-1 | 14:00 | M06 | Ninguna | Completada | Histórico |
| MESA-R3XH | Carla Ibarra | 81 1122 3344 | 2 | DO-1 | 20:00 | M03 | Cumpleaños | Completada | Histórico |
| MESA-N7YB | Héctor Sepúlveda | 81 2233 4455 | 4 | DO+1 | 13:00 | M05 | Ninguna | Cancelada | Estado final |
| MESA-D2KT | Fernanda Rocha | 81 3344 5566 | 6 | DO+4 | 20:00 | M09 | Cumpleaños | Confirmada | **Escenario sin disponibilidad** |
| MESA-G8VM | Ricardo Guajardo | 81 4455 6677 | 5 | DO+4 | 19:30 | M10 | Ninguna | Confirmada | **Escenario sin disponibilidad** |

Escenario sin disponibilidad: en DO+4 a las 20:00, M09 y M10 (las únicas mesas de 6) están ocupadas → un grupo de 5 o 6 personas no tiene disponibilidad y recibe alternativas.

Todos los teléfonos cumplen BR-025 (10 dígitos, primer dígito 8) y son ficticios.

Cada reserva inicial tiene un evento de historial “Creada” (actor Sistema); MESA-Z8CE además tiene un evento “Modificada” (horario 19:30 → 20:00, actor Cliente) y MESA-C9UF / MESA-R3XH un evento “Completada” (actor Admin).

**Bloqueos iniciales:** ninguno (el bloqueo se demuestra en vivo, ver `19-demo-script.md`).

## 10. Persistencia local

| Conjunto | Contenido | Almacenamiento del navegador |
|---|---|---|
| meta | versión de esquema, fecha de generación de datos iniciales, preferencia de demo (“simular conflicto”) | almacenamiento clave-valor |
| reservas | todas las reservas con historial | almacenamiento clave-valor |
| mesas | bloqueos por mesa (las mesas en sí son fijas) | almacenamiento clave-valor |
| platillos | todos los platillos, incluidos los de papelera | almacenamiento clave-valor |
| imágenesSubidas | binarios de imágenes subidas por admin | almacenamiento de objetos del navegador (mayor capacidad) |
| sesiónAdmin | indicador de sesión | almacenamiento de sesión (por pestaña) |
| sesiónCliente | reservas verificadas en Mis reservas, borrador del flujo de reserva | almacenamiento de sesión (por pestaña) |

- Todas las claves usan el prefijo de espacio de nombres `mesa.v1`.
- Si la versión de esquema guardada no coincide con la actual, o los datos no pueden leerse, se ofrece restablecer (E-18).
- Si el almacenamiento no está disponible (p. ej., navegación privada restrictiva) la app funciona en memoria y muestra el aviso E-16.
- Los cambios en otra pestaña se reflejan en la pestaña actual (BR-021).

## 11. SesiónAdmin y MetaDemo

| Entidad | Campo | Descripción |
|---|---|---|
| SesiónAdmin | usuario | “admin” |
| | iniciadaEn | fecha-hora |
| MetaDemo | versiónEsquema | entero (inicia en 1) |
| | datosGeneradosEn | fecha en que se crearon los datos iniciales |
| | simularConflicto | sí/no (lo activa el panel “Prueba estas funciones”) |
