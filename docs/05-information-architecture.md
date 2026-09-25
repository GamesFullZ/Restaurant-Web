# 05 · Arquitectura de información

> Jerarquía completa de páginas, secciones, rutas y conexiones. Los identificadores de pantalla (`G-`, `S-`, `A-`) se usan en todos los documentos. Detalle de cada pantalla: `06-screen-specification.md`.

## 1. Mapa del sitio

```
MESA
├── Sitio público
│   ├── S-01  Inicio ........................................ /
│   │   ├── S-01.1 Hero (texto protagonista + taco 3D)
│   │   ├── S-01.2 Concepto
│   │   ├── S-01.3 Destacados (4 platillos)
│   │   ├── S-01.4 Reseñas (10, filtrables)
│   │   ├── S-01.5 Restaurante y ubicación (filosofía, dirección, horarios, mapa, cómo llegar)
│   │   ├── S-01.6 CTA de reserva
│   │   └── G-02   Footer
│   ├── S-02  Menú .......................................... /menu
│   │   └── 5 categorías: Entradas · Antojitos · Platos fuertes · Postres · Bebidas y cervezas
│   ├── S-03  Detalle de platillo ........................... /menu/<slug>
│   ├── S-04  Reservar (flujo guiado) ....................... /reservar
│   │   ├── S-04.1 Personas
│   │   ├── S-04.2 Horario
│   │   ├── S-04.3 Fecha
│   │   ├── S-04.4 Mesa (mapa)
│   │   ├── S-04.5 Ocasión
│   │   ├── S-04.6 Tus datos
│   │   └── S-04.7 Resumen
│   ├── S-05  Confirmación .................................. /reservar/confirmacion
│   ├── S-06  Mis reservas · acceso ......................... /mis-reservas
│   ├── S-07  Mi reserva (detalle) .......................... /mis-reservas/<código>
│   ├── S-08  Modificar reserva ............................. /mis-reservas/<código>/modificar
│   │   ├── S-08.1 ¿Qué quieres cambiar?
│   │   ├── S-08.2 Flujo guiado en modo edición (reutiliza S-04.1–S-04.7)
│   │   └── S-08.3 Editar datos y ocasión
│   ├── S-09  Cancelar reserva (diálogo + estado “Reserva cancelada”)
│   └── S-10  No encontrado (404 genérico y de platillo)
│
├── Panel administrativo (demo)
│   ├── A-01  Acceso ........................................ /admin/login
│   ├── A-02  Dashboard ..................................... /admin
│   ├── A-03  Reservas ...................................... /admin/reservas
│   │   └── A-04 Detalle de reserva (panel lateral / pantalla completa en móvil)
│   ├── A-05  Modificar reserva (admin) ..................... /admin/reservas/<código>/modificar
│   ├── A-06  Menú .......................................... /admin/menu
│   ├── A-07  Editor de platillo ............................ /admin/menu/nuevo · /admin/menu/<id>
│   ├── A-08  Papelera ...................................... /admin/menu/papelera
│   ├── A-09  Mesas ......................................... /admin/mesas
│   └── A-10  Diálogo de bloqueo de mesa (desde A-02 y A-09)
│
└── Elementos globales
    ├── G-01  Header / navegación
    ├── G-02  Footer
    ├── G-03  “Prueba estas funciones” (panel de demo)
    ├── G-04  Avisos (toasts) y diálogos de confirmación
    └── G-05  Aviso de persistencia no disponible
```

## 2. Navegación principal

### Público

| Orden | Elemento | Destino | Notas |
|---|---|---|---|
| 1 | **Mesa** (logo) | `/` | Siempre visible. |
| 2 | Inicio | `/` | Estado activo en Home. |
| 3 | Menú | `/menu` | Activo también en `/menu/<slug>`. |
| 4 | Reservar | `/reservar` | Enlace de texto. |
| 5 | Mis reservas | `/mis-reservas` | Activo en `/mis-reservas/*`. |
| CTA | **Reservar mesa** | `/reservar` | Botón destacado a la derecha. Oculto dentro de `/reservar` para no competir con el flujo. |

En móvil: logo + CTA “Reservar” compacto + botón de menú que abre un panel a pantalla completa con Inicio, Menú, Reservar, Mis reservas (ver `13-responsive-specification.md §3`).

### Admin

Dashboard · Reservas · Menú · Mesas · *Ver sitio* (abre `/` en la misma pestaña) · *Cerrar sesión*. La Papelera se accede desde Menú.

## 3. Rutas

| Ruta | Pantalla | Acceso | Parámetros |
|---|---|---|---|
| `/` | S-01 | Público | Anclas: `#concepto`, `#destacados`, `#resenas`, `#ubicacion` |
| `/menu` | S-02 | Público | Ancla por categoría: `#entradas`, `#antojitos`, `#platos-fuertes`, `#postres`, `#bebidas` |
| `/menu/<slug>` | S-03 | Público | Slug inválido, oculto o en papelera → S-10 |
| `/reservar` | S-04 | Público | Opcional `?personas=N` (desde “Reservar de nuevo”) |
| `/reservar/confirmacion` | S-05 | Público | Solo accesible justo después de confirmar (sin datos → redirige a `/reservar`) |
| `/mis-reservas` | S-06 | Público | Opcional `?codigo=MESA-XXXX` (precarga el código) |
| `/mis-reservas/<código>` | S-07 | Requiere verificación código+teléfono en la sesión | Sin verificación → S-06 con código precargado |
| `/mis-reservas/<código>/modificar` | S-08 | Igual que S-07 y reserva modificable (BR-032) | No modificable → S-07 con motivo |
| `/admin/login` | A-01 | Público | Con sesión activa → A-02 |
| `/admin` | A-02 | Sesión admin | Sin sesión → A-01 (y regresa al destino tras el login) |
| `/admin/reservas` | A-03/A-04 | Sesión admin | Filtros en la URL (fecha, estado, búsqueda); `?reserva=<código>` abre A-04 |
| `/admin/reservas/<código>/modificar` | A-05 | Sesión admin | Reserva final → A-04 con motivo |
| `/admin/menu` | A-06 | Sesión admin | Filtros: categoría, disponibilidad, búsqueda |
| `/admin/menu/nuevo` | A-07 | Sesión admin | — |
| `/admin/menu/<id>` | A-07 | Sesión admin | Id inexistente → A-06 con aviso |
| `/admin/menu/papelera` | A-08 | Sesión admin | — |
| `/admin/mesas` | A-09 | Sesión admin | — |
| cualquier otra | S-10 | Público | — |

## 4. Conexiones entre pantallas

```
                 ┌──────────── G-01 Header (todas las públicas) ────────────┐
                 ▼                ▼                 ▼                        ▼
               S-01 ──(Ver menú)──▶ S-02 ──(platillo)──▶ S-03 ──(Reservar mesa)──┐
                │  └─(destacado)──────────────────────▶ S-03                    │
                │  └─(Reservar mesa / CTA)──────────────────────────────────────▶ S-04
                │  └─(Cómo llegar: Abrir mapas = Simulado · Copiar dirección)
                ▼
             S-04.1 → .2 → .3 → .4 → .5 → .6 → .7 ──(Confirmar)──▶ S-05
                                   ▲                   │ conflicto (BR-023)
                                   └───────────────────┘
             S-05 ──(Ver mi reserva)──▶ S-07 (verificada automáticamente en la sesión)
             S-06 ──(código + teléfono)──▶ S-07 ──(Modificar)──▶ S-08 ──▶ S-07
                                                  └─(Cancelar)──▶ S-09 ──(Reservar de nuevo)──▶ S-04

  G-02 Footer ──(Acceso administrador · demo)──▶ A-01 ──▶ A-02
  A-02 ⇄ A-03 ⇄ A-04 ──▶ A-05 ──▶ A-04
  A-02 (mapa) ──(mesa)──▶ A-10 ◀── A-09
  A-06 ──▶ A-07 ; A-06 ──▶ A-08
  G-03 “Prueba estas funciones” ──▶ S-04 · S-06 (precargado) · A-01 · Restablecer demo
```

## 5. Jerarquía de contenido por pantalla (resumen)

| Pantalla | Nivel 1 (lo primero) | Nivel 2 | Nivel 3 |
|---|---|---|---|
| S-01 | Slogan + CTA Reservar mesa | Taco 3D, concepto, destacados | Reseñas, ubicación, footer |
| S-02 | Tabs de categoría | Tarjetas de platillo | Etiquetas, estado agotado |
| S-03 | Foto + nombre + precio | Descripción + etiquetas | Navegación a otros platillos, CTA reservar |
| S-04 | Pregunta del paso actual | Opciones / mapa | Progreso, resumen acumulado |
| S-05 | “Tu mesa está apartada” + código | Detalle de la reserva | Acciones (Ver mi reserva, Volver al inicio) |
| S-07 | Estado + fecha/hora/mesa | Datos y ocasión | Acciones Modificar/Cancelar |
| A-02 | Indicadores del día | Mapa del restaurante | Próxima reserva, accesos rápidos |
| A-03 | Búsqueda + filtros | Tabla/tarjetas | Panel de detalle |
| A-06 | Lista por categoría | Estado de cada platillo | Acciones |

## 6. Etiquetado (vocabulario controlado)

Se usan siempre los mismos términos en cliente y admin: **Reserva**, **Mesa**, **Horario**, **Personas**, **Ocasión**, **Código de reserva**, **Mis reservas**, **Platillo**, **Agotado temporalmente**, **Oculto**, **Papelera**, **Mantenimiento**, **No disponible**. Catálogo completo de textos: `15-content-specification.md`.
