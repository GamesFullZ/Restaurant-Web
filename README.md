# MESA — Restaurante mexicano contemporáneo

Sitio web y sistema de reservas de **MESA** (Barrio Antiguo, Monterrey). Está construido a partir de la planeación de [`/docs`](docs/README.md).

- **Sitio público:** hero 3D (Three.js), menú animado, detalle de platillo, reserva guiada en 7 pasos con plano interactivo y Mis reservas.
- **Panel de administración:** dashboard, reservas, menú con papelera y edición de imágenes, y mesas y bloqueos.

Todo funciona sin backend: los datos viven en `localStorage` (clave `mesa.v1.db`) y las imágenes subidas en IndexedDB.

## Requisitos

- Node 20+ (probado con Node 22)

## Comandos

```bash
npm install
npm run dev          # desarrollo en http://localhost:5173
npm run build        # typecheck + build de producción en dist/
npm run build:hash   # build portable (HashRouter, rutas relativas) en dist-hash/
npm run preview      # sirve dist/
npm test             # pruebas unitarias del dominio (Vitest)
npm run test:e2e     # pruebas E2E (Playwright: escritorio y móvil)
```

> Para desplegar `dist/` en un hosting estático, configura el *fallback* de SPA a `index.html`. Si no puedes, usa `npm run build:hash`.

## Datos de demostración

| Qué | Valor |
|---|---|
| Reserva de ejemplo | `MESA-4F7K` · teléfono `81 1234 5678` |
| Admin | usuario `admin` · contraseña `mesa-demo` |

- **Fechas del seed:** son relativas al día actual (el primer día de servicio a partir de hoy). Así la demo siempre tiene reservas vigentes.
- **Panel «Prueba estas funciones»:** está en la esquina inferior. Guía los casos clave (conflicto simulado, platillo agotado, etc.) y permite restablecer la demo.

## Estructura

```
src/
  domain/     reglas de negocio puras (disponibilidad, validación, menú, métricas)
  store/      persistencia (localStorage + IndexedDB), sesión y acciones
  data/       seed: menú (25 platillos), reservas y reseñas
  three/      kit procedural 3D: taco del hero y escenas de cada platillo
  components/ UI compartida (plano de mesas, calendario, diálogos, toasts…)
  pages/      home, menú, reservar, mis reservas
  admin/      panel de administración
  styles/     tokens y estilos base
tests/unit    pruebas del dominio (casos T-0xx de docs/12)
tests/e2e     flujos completos en navegador
```

## Fotografía de platillos

- **Imágenes actuales:** las de `public/images/dishes/*.webp` son **renders 3D procedurales**, generados con el estudio incluido.
  ```bash
  npm run render:dishes              # todos
  npm run render:dishes -- pato-en-adobo tostada-de-atun
  ```
  Para previsualizar una escena, abre `studio.html?dish=<slug>` con el servidor de desarrollo.
- **Fotos reales:** usa los prompts FP-01…FP-25 de `docs/MESA-VISUAL-PROMPTS.txt`. Luego súbelas desde **Admin → Menú → editar platillo**, o reemplaza el `.webp` con el mismo *slug*.

## Accesibilidad y movimiento

- **Accesibilidad:** navegación completa por teclado (plano de mesas y calendario incluidos), anuncios en vivo, foco gestionado entre pasos y contraste AA.
- **Menos movimiento:** respeta `prefers-reduced-motion`. En el pie de página hay además un interruptor «Reducir movimiento», que desactiva el 3D en vivo, el scroll suave y las animaciones.
