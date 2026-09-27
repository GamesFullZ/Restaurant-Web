import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Box, CalendarCheck, Code2, Gauge, LayoutDashboard, MapPinned, Smartphone, Sparkles, Ticket } from 'lucide-react';
import { useReveal } from '@/lib/reveal';
import { useTitle } from '@/lib/useTitle';
import { DishImage } from '@/components/DishImage';
import { DEMO, PORTFOLIO } from '@/domain/constants';
import { LIBRARY_IMAGES } from '@/data/seed';
import './project.css';

const FEATURES = [
  { icon: CalendarCheck, t: 'Reserva guiada en 7 pasos', d: 'Personas, horario, fecha, mesa, ocasión, datos y resumen. Cada paso se valida, se puede editar desde el resumen y el borrador sobrevive a una recarga.' },
  { icon: MapPinned, t: 'Eliges tu mesa en el plano', d: 'Plano SVG accesible por teclado con estados en vivo, recomendaciones según tus preferencias y aviso si alguien toma la mesa mientras decides.' },
  { icon: Ticket, t: 'Mis reservas sin cuenta', d: 'Código + teléfono para consultar, modificar (con comparación antes/después) o cancelar, respetando el límite de 2 horas.' },
  { icon: LayoutDashboard, t: 'Panel de administración', d: 'Ocupación del día, mapa por horario, filtros por URL, historial de cambios, bloqueos de mesa, menú con papelera y subida de fotos.' },
  { icon: Box, t: 'Taco 3D en vivo', d: 'Escena Three.js que se abre en capas con el scroll y sigue al cursor; en teléfonos usa un render idéntico para cuidar la batería.' },
  { icon: Sparkles, t: 'Movimiento con intención', d: 'Scroll suave, textos que entran por líneas, transiciones entre páginas y un interruptor para reducir movimiento en todo el sitio.' },
];

const PALETTE = [
  { name: 'Nixtamal', hex: '#F4EFE6', ink: true },
  { name: 'Obsidiana', hex: '#161412' },
  { name: 'Chile', hex: '#C4432A' },
  { name: 'Nopal', hex: '#2E4A3B' },
  { name: 'Cantera', hex: '#D8C3AE', ink: true },
  { name: 'Maíz', hex: '#DDA43A', ink: true },
];

/** Medido con Lighthouse 13 y axe-core sobre el build de producción (ver README). */
const QUALITY = [
  { n: '98', l: 'Rendimiento Lighthouse (escritorio, portada)' },
  { n: '100', l: 'Accesibilidad Lighthouse' },
  { n: '0', l: 'Violaciones axe en 15 rutas × 2 anchos' },
  { n: '37', l: 'Pruebas automáticas (unitarias + E2E)' },
];

const STACK = ['React 19', 'TypeScript', 'Vite', 'React Router', 'Three.js', 'GSAP + ScrollTrigger', 'Lenis', 'View Transitions', 'Vitest', 'Playwright', 'IndexedDB', 'CSS a mano (sin framework)'];

const PROCESS = [
  { n: '01', t: 'Planeación', d: '24 documentos: PRD, personas, flujos, reglas de negocio, casos límite, pruebas y dirección de arte.' },
  { n: '02', t: 'Sistema', d: 'Paleta de materiales mexicanos, tipografía condensada de cartel con itálica serif y una retícula de mesas vista desde arriba.' },
  { n: '03', t: 'Construcción', d: 'Motor de disponibilidad puro y probado, estado persistente entre pestañas y cada pantalla con sus estados vacío, error y carga.' },
  { n: '04', t: 'Pulido', d: 'Auditorías de rendimiento y accesibilidad, pruebas E2E en escritorio y móvil, y revisión visual pantalla por pantalla.' },
];

export default function ProjectPage() {
  useTitle('Caso de estudio');
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const pick = ['taco-de-short-rib', 'pescado-a-la-talla', 'tostada-de-atun', 'pato-en-adobo', 'taco-de-camaron', 'mole-de-pollo', 'sopes-de-birria', 'margarita-de-la-casa', 'esquites-cremosos', 'flan-de-cajeta', 'agua-de-jamaica', 'chocolate-y-chile'];
  const gallery = pick.map((slug) => LIBRARY_IMAGES.find((l) => l.id === `lib:${slug}`)!).filter(Boolean);
  return (
    <div ref={ref} className="case">
      <header className="case-hero">
        <div className="container">
          <p className="eyebrow accent" data-reveal>
            Caso de estudio · {PORTFOLIO.year}
          </p>
          <h1 className="case-hero__title reveal-group">
            <span className="split-line display" style={{ ['--i' as string]: 0 }}>
              <span>Mesa:</span>
            </span>
            <span className="split-line display" style={{ ['--i' as string]: 1 }}>
              <span>
                reservar <em className="accent">la mesa</em>
              </span>
            </span>
            <span className="split-line serif-i case-hero__serif" style={{ ['--i' as string]: 2 }}>
              <span>exacta, no solo la hora.</span>
            </span>
          </h1>
          <dl className="case-meta" data-reveal>
            <div>
              <dt>Rol</dt>
              <dd>{PORTFOLIO.role}</dd>
            </div>
            <div>
              <dt>Autor</dt>
              <dd>{PORTFOLIO.author}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>Restaurante ficticio · web + sistema de reservas</dd>
            </div>
            <div>
              <dt>Código</dt>
              <dd>
                <a href={PORTFOLIO.repo} target="_blank" rel="noreferrer" className="link">
                  GitHub <ArrowUpRight aria-hidden width={14} />
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="case-sec container" aria-labelledby="reto-t">
        <div className="case-sec__head">
          <span className="mono case-sec__n">01</span>
          <h2 id="reto-t" className="h2">El reto</h2>
        </div>
        <div className="case-sec__body">
          <p className="lead case-lead" data-reveal>
            Los restaurantes pequeños reservan por WhatsApp o por teléfono, y el comensal nunca sabe dónde lo van a sentar. Mesa propone lo contrario: ver el salón,
            elegir <strong>la mesa exacta</strong> —junto al ventanal, en la terraza, lejos de la barra— y tener la confirmación en menos de dos minutos.
          </p>
          <p data-reveal>
            La identidad tenía que sentirse de Monterrey y contemporánea, sin clichés: nada de papel picado ni sombreros. La referencia fueron carteles de comida con
            tipografía enorme, color con carácter y producto como protagonista.
          </p>
        </div>
      </section>

      <section className="case-sec container" aria-labelledby="hice-t">
        <div className="case-sec__head">
          <span className="mono case-sec__n">02</span>
          <h2 id="hice-t" className="h2">Qué construí</h2>
        </div>
        <ul className="case-features">
          {FEATURES.map((f, i) => (
            <li key={f.t} data-reveal style={{ ['--i' as string]: i % 3 }}>
              <f.icon aria-hidden />
              <h3 className="h3">{f.t}</h3>
              <p>{f.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="case-system on-dark" aria-labelledby="sis-t">
        <div className="container">
          <div className="case-sec__head">
            <span className="mono case-sec__n">03</span>
            <h2 id="sis-t" className="h2">
              Sistema <span className="serif-i">visual</span>
            </h2>
          </div>
          <ul className="case-swatches">
            {PALETTE.map((c, i) => (
              <li key={c.name} data-reveal style={{ ['--i' as string]: i, background: c.hex, color: c.ink ? 'var(--obsidiana)' : 'var(--nixtamal)' }}>
                <span className="case-swatches__name">{c.name}</span>
                <span className="mono">{c.hex}</span>
              </li>
            ))}
          </ul>
          <div className="case-type">
            <div data-reveal>
              <p className="eyebrow maiz">Display · Archivo condensada</p>
              <p className="case-type__display display">Un taco. Una mesa.</p>
            </div>
            <div data-reveal>
              <p className="eyebrow maiz">Acento · Instrument Serif itálica</p>
              <p className="case-type__serif serif-i">Un lugar para disfrutar.</p>
            </div>
            <div data-reveal>
              <p className="eyebrow maiz">Datos · JetBrains Mono</p>
              <p className="case-type__mono mono">MESA-4F7K · 20:00 · Mesa 05</p>
            </div>
          </div>
        </div>
      </section>

      <section className="case-sec container" aria-labelledby="3d-t">
        <div className="case-sec__head">
          <span className="mono case-sec__n">04</span>
          <h2 id="3d-t" className="h2">
            Fotografía <span className="serif-i">procedural</span>
          </h2>
        </div>
        <div className="case-sec__body">
          <p className="lead case-lead" data-reveal>
            Sin sesión de fotos, los 25 platillos se modelan en código con Three.js: geometrías, texturas de maíz, parrilla y cerámica generadas con ruido, y una luz
            lateral de ventana. Un estudio automatizado con Playwright los renderiza en WebP; el panel de administración permite reemplazarlos por fotos reales.
          </p>
        </div>
        <div className="case-gallery" aria-label="Renders de platillos">
          {gallery.map((d, i) => (
            <figure key={d.id} data-reveal style={{ ['--i' as string]: i % 4 }}>
              <DishImage imageId={d.id} alt={d.alt} name={d.name} />
              <figcaption>{d.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="case-sec container" aria-labelledby="cal-t">
        <div className="case-sec__head">
          <span className="mono case-sec__n">05</span>
          <h2 id="cal-t" className="h2">Calidad medible</h2>
        </div>
        <ul className="case-quality">
          {QUALITY.map((q, i) => (
            <li key={q.l} data-reveal style={{ ['--i' as string]: i }}>
              <span className="case-quality__n display">{q.n}</span>
              <span>{q.l}</span>
            </li>
          ))}
        </ul>
        <div className="case-notes" data-reveal>
          <p>
            <Gauge aria-hidden /> three.js se descarga solo tras la primera interacción; el hero pinta antes con un render de 60&nbsp;KB idéntico a la escena.
          </p>
          <p>
            <Smartphone aria-hidden /> Probado en 390&nbsp;px y 1440&nbsp;px: sin desbordes, objetivos táctiles de 44&nbsp;px y navegación completa por teclado.
          </p>
          <p>
            <Code2 aria-hidden /> Reglas de negocio en funciones puras (disponibilidad, 90&nbsp;min por mesa, compatibilidad por tamaño) con pruebas unitarias.
          </p>
        </div>
      </section>

      <section className="case-sec container" aria-labelledby="proc-t">
        <div className="case-sec__head">
          <span className="mono case-sec__n">06</span>
          <h2 id="proc-t" className="h2">Proceso</h2>
        </div>
        <ol className="case-process">
          {PROCESS.map((p, i) => (
            <li key={p.n} data-reveal style={{ ['--i' as string]: i }}>
              <span className="mono case-sec__n">{p.n}</span>
              <h3 className="h3">{p.t}</h3>
              <p>{p.d}</p>
            </li>
          ))}
        </ol>
        <ul className="case-stack" aria-label="Tecnologías" data-reveal>
          {STACK.map((s) => (
            <li key={s} className="chip chip--sm">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="case-try on-dark" aria-labelledby="try-t">
        <div className="container case-try__inner">
          <h2 id="try-t" className="h2" data-reveal>
            Pruébalo <span className="serif-i">tú.</span>
          </h2>
          <p className="lead" data-reveal>
            Todo funciona en tu navegador: las reservas se guardan localmente y el panel «Prueba estas funciones» guía los casos clave.
          </p>
          <div className="case-try__cards" data-reveal>
            <Link viewTransition to="/reservar" className="case-try__card">
              <strong>Reservar una mesa</strong>
              <span>El flujo completo, de 1 a 6 personas.</span>
              <ArrowUpRight aria-hidden />
            </Link>
            <Link viewTransition to={`/mis-reservas?codigo=${DEMO.code}`} className="case-try__card">
              <strong>Mis reservas</strong>
              <span className="mono">
                {DEMO.code} · {DEMO.phone}
              </span>
              <ArrowUpRight aria-hidden />
            </Link>
            <Link viewTransition to="/admin/login" className="case-try__card">
              <strong>Panel de administración</strong>
              <span className="mono">
                {DEMO.adminUser} · {DEMO.adminPass}
              </span>
              <ArrowUpRight aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
