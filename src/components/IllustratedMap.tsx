import { useRef, useState } from 'react';
import { Crosshair, Minus, Plus } from 'lucide-react';

const W = 900;
const H = 640;
const PIN = { x: 505, y: 238 };

/** Mapa ilustrativo propio del Barrio Antiguo (FR-013). Sin servicios externos. */
export function IllustratedMap() {
  const [view, setView] = useState({ s: 1.25, x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const clamp = (v: { s: number; x: number; y: number }) => {
    const s = Math.min(3, Math.max(1, v.s));
    const maxX = (W * (s - 1)) / 2 + 60;
    const maxY = (H * (s - 1)) / 2 + 60;
    return { s, x: Math.min(maxX, Math.max(-maxX, v.x)), y: Math.min(maxY, Math.max(-maxY, v.y)) };
  };
  const zoom = (d: number) => setView((v) => clamp({ ...v, s: v.s + d }));
  const center = () => setView({ s: 1.6, x: -(PIN.x - W / 2) * 1.6, y: -(PIN.y - H / 2) * 1.6 });

  const onKey = (e: React.KeyboardEvent) => {
    const step = 40;
    const m: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (m[e.key]) {
      e.preventDefault();
      setView((v) => clamp({ ...v, x: v.x + m[e.key][0], y: v.y + m[e.key][1] }));
    }
    if (e.key === '+' || e.key === '=') zoom(0.25);
    if (e.key === '-') zoom(-0.25);
  };

  const hStreets = [
    { y: 112, name: 'Morelos' },
    { y: 250, name: 'Padre Mier' },
    { y: 388, name: 'Abasolo' },
    { y: 520, name: 'Matamoros' },
  ];
  const vStreets = [
    { x: 250, name: 'Zaragoza' },
    { x: 400, name: 'Dr. Coss' },
    { x: 560, name: 'Diego de Montemayor' },
    { x: 720, name: 'Mina' },
  ];

  return (
    <div className="imap">
      <span className="imap__label pill">Mapa ilustrativo</span>
      <div className="imap__controls">
        <button className="icon-btn" onClick={() => zoom(0.3)} aria-label="Acercar">
          <Plus aria-hidden />
        </button>
        <button className="icon-btn" onClick={() => zoom(-0.3)} aria-label="Alejar">
          <Minus aria-hidden />
        </button>
        <button className="icon-btn" onClick={center} aria-label="Centrar en Mesa">
          <Crosshair aria-hidden />
        </button>
      </div>
      <svg
        ref={svgRef}
        className="imap__svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        tabIndex={0}
        aria-label="Mapa ilustrativo del Barrio Antiguo de Monterrey. Mesa está sobre Padre Mier, a dos cuadras de la Macroplaza y frente a la plaza del Barrio Antiguo. Usa las flechas para desplazar el mapa y + o − para acercar."
        onKeyDown={onKey}
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
        }}
        onPointerMove={(e) => {
          if (!drag.current || !svgRef.current) return;
          const k = W / svgRef.current.clientWidth;
          setView((v) => clamp({ ...v, x: drag.current!.vx + (e.clientX - drag.current!.x) * k, y: drag.current!.vy + (e.clientY - drag.current!.y) * k }));
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onWheel={(e) => {
          if (!e.ctrlKey) return;
          e.preventDefault();
          zoom(e.deltaY < 0 ? 0.15 : -0.15);
        }}
      >
        <g
          className="imap__world"
          style={{ transform: `translate(${W / 2 + view.x}px, ${H / 2 + view.y}px) scale(${view.s}) translate(${-W / 2}px, ${-H / 2}px)` }}
        >
          <rect x="-400" y="-400" width={W + 800} height={H + 800} fill="#E4D5C3" />
          {/* manzanas */}
          {[0, 1, 2, 3, 4, 5].map((i) =>
            [0, 1, 2, 3, 4].map((j) => {
              const xs = [-60, 250, 400, 560, 720, 900];
              const ys = [-40, 112, 250, 388, 520, 640];
              if (i >= xs.length - 1 || j >= ys.length - 1) return null;
              return <rect key={`${i}-${j}`} x={xs[i] + 12} y={ys[j] + 12} width={xs[i + 1] - xs[i] - 24} height={ys[j + 1] - ys[j] - 24} rx="6" fill="#D5C1AA" />;
            }),
          )}
          {/* Macroplaza */}
          <rect x="40" y="124" width="198" height="384" rx="10" fill="#9DB39F" />
          <g stroke="#83A086" strokeWidth="1" fill="none" opacity="0.8">
            <circle cx="139" cy="220" r="34" />
            <circle cx="139" cy="400" r="24" />
            <path d="M139 124 V508" strokeDasharray="4 6" />
          </g>
          <text x="139" y="318" className="imap__place" textAnchor="middle">
            Macroplaza
          </text>
          {/* plaza del barrio */}
          <rect x="574" y="264" width="134" height="112" rx="8" fill="#B9C9B6" />
          <g fill="#8FA78E">
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} cx={600 + i * 28} cy={320} r="7" />
            ))}
          </g>
          <text x="641" y="296" className="imap__place imap__place--sm" textAnchor="middle">
            Plaza del Barrio Antiguo
          </text>
          {/* río */}
          <path d={`M-400 ${H - 34} C 200 ${H - 60}, 600 ${H - 10}, ${W + 400} ${H - 40} L ${W + 400} ${H + 400} L -400 ${H + 400} Z`} fill="#A9B8B6" />
          <text x="300" y={H - 12} className="imap__place imap__place--sm">
            Río Santa Catarina
          </text>
          {/* calles */}
          {hStreets.map((s) => (
            <g key={s.name}>
              <rect x="-400" y={s.y - 11} width={W + 800} height="22" fill="#F4EDE2" />
              <text x="780" y={s.y + 4} className="imap__street">
                {s.name}
              </text>
            </g>
          ))}
          {vStreets.map((s) => (
            <g key={s.name}>
              <rect x={s.x - 11} y="-400" width="22" height={H + 800} fill="#F4EDE2" />
              <text x={s.x + 4} y="60" className="imap__street" transform={`rotate(90 ${s.x + 4} 60)`}>
                {s.name}
              </text>
            </g>
          ))}
          <rect x="-400" y="582" width={W + 800} height="26" fill="#EFE6D8" />
          <text x="560" y="600" className="imap__street">
            Av. Constitución
          </text>
          {/* pin */}
          <g className="imap__pin" transform={`translate(${PIN.x} ${PIN.y})`}>
            <circle r="26" className="imap__pulse" />
            <path d="M0 -44 C 17 -44 26 -32 26 -20 C 26 -4 0 16 0 16 C 0 16 -26 -4 -26 -20 C -26 -32 -17 -44 0 -44 Z" fill="var(--chile)" transform="translate(0 -8)" />
            <circle cy="-28" r="8" fill="#FFF8F0" />
            <g transform="translate(34 -42)">
              <rect width="78" height="30" rx="15" fill="var(--obsidiana)" />
              <text x="39" y="20" textAnchor="middle" className="imap__pinlabel">
                Mesa
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
