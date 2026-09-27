import { useRef } from 'react';
import { useReveal } from '@/lib/reveal';
import { DishImage } from '@/components/DishImage';

const IDEAS = [
  { n: '01', t: 'Raíz', d: 'Técnicas y sabores mexicanos como punto de partida.' },
  { n: '02', t: 'Presente', d: 'Presentaciones limpias y producto de temporada.' },
  { n: '03', t: 'Mesa', d: 'Cocina para compartir, sin prisa.' },
];

export function Concept() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section ref={ref} id="concepto" className="concept" aria-labelledby="concept-title">
      <div className="container concept__grid">
        <div className="concept__head">
          <p className="eyebrow accent" data-reveal>
            Concepto
          </p>
          <h2 id="concept-title" className="h2 reveal-group">
            <span className="split-line" style={{ ['--i' as string]: 0 }}>
              <span>Lo mexicano,</span>
            </span>
            <span className="split-line" style={{ ['--i' as string]: 1 }}>
              <span className="serif-i">reinterpretado.</span>
            </span>
          </h2>
        </div>
        <p className="concept__text lead" data-reveal>
          Partimos de sabores que conocemos de toda la vida —el maíz, el chile, el fuego lento— y los llevamos a una cocina contemporánea, precisa y sin adornos
          innecesarios. Aquí la comida se comparte: cada platillo está pensado para ponerse al centro y disfrutarse entre todos.
        </p>
        <div className="concept__table" aria-hidden data-reveal="scale">
          <div className="concept__plate concept__plate--a">
            <DishImage imageId="lib:tostada-de-atun" alt="" name="Tostada de Atún" />
          </div>
          <div className="concept__plate concept__plate--b">
            <DishImage imageId="lib:mole-de-pollo" alt="" name="Mole de Pollo" />
          </div>
          <div className="concept__plate concept__plate--c">
            <DishImage imageId="lib:sopes-de-birria" alt="" name="Sopes de Birria" />
          </div>
          <svg className="concept__ring" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeDasharray="1 10" strokeWidth="2" />
          </svg>
        </div>
        <ol className="concept__ideas">
          {IDEAS.map((it, i) => (
            <li key={it.n} data-reveal style={{ ['--i' as string]: i }}>
              <span className="mono concept__n">{it.n}</span>
              <h3 className="h3">{it.t}</h3>
              <p>{it.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
