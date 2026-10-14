import type { ReactElement } from 'react';

/**
 * Escena abstracta del panel de marca: brillos de luz ambiental difuminados,
 * líneas curvas extremadamente finas (flujos de datos / ondas) y grano.
 *
 * Sin orbes, sin cristales y sin formas circulares sueltas: la decoración
 * se funde con el lienzo azul y se disuelve hacia la derecha para enlazar
 * de forma orgánica con el espacio blanco del formulario.
 */

const LINES = [
  'M-40 150 C 240 100, 430 250, 640 190 S 1060 80, 1300 140',
  'M-40 300 C 220 380, 470 280, 700 345 S 1080 220, 1300 320',
  'M-40 470 C 260 410, 520 520, 780 460 S 1100 400, 1300 490',
  'M-40 630 C 220 700, 500 585, 760 660 S 1060 575, 1300 640',
  'M-40 80 C 300 35, 560 120, 820 65 S 1180 15, 1300 55',
] as const;

interface Node {
  x: number;
  y: number;
}

type Band = readonly Node[];

/**
 * Nodos de la red global. Cada banda es una "constelación" que sigue una de
 * las curvas de flujo; los nodos se conectan entre bandas para sugerir una
 * infraestructura distribuida.
 */
const BANDS: readonly Band[] = [
  [{ x: 96, y: 92 }, { x: 318, y: 74 }, { x: 540, y: 104 }, { x: 766, y: 76 }, { x: 986, y: 106 }],
  [{ x: 64, y: 186 }, { x: 290, y: 202 }, { x: 512, y: 182 }, { x: 736, y: 208 }, { x: 954, y: 178 }, { x: 1172, y: 204 }],
  [{ x: 148, y: 302 }, { x: 372, y: 322 }, { x: 592, y: 298 }, { x: 824, y: 336 }, { x: 1044, y: 306 }],
  [{ x: 212, y: 456 }, { x: 442, y: 442 }, { x: 668, y: 476 }, { x: 898, y: 446 }, { x: 1122, y: 470 }],
  [{ x: 268, y: 620 }, { x: 508, y: 636 }, { x: 742, y: 606 }, { x: 968, y: 640 }, { x: 1184, y: 616 }],
];

/** Nodos "core": más brillantes y con pulso de señal. */
const CORE_KEYS = new Set([
  '290_202',
  '592_298',
  '668_476',
  '968_640',
  '96_92',
  '766_76',
]);

const key = ({ x, y }: Node): string => `${x}_${y}`;

const allNodes: readonly Node[] = BANDS.flat();

const toLine = (band: Band): string =>
  `M ${band.map((n) => `${n.x} ${n.y}`).join(' L ')}`;

/** Conexiones diagonales entre bandas vecinas: la "malla" de la red. */
const bridges: readonly string[] = BANDS.slice(0, -1).flatMap((upper, index) =>
  upper.slice(0, -1).map((n, i) => {
    const lower = BANDS[index + 1]?.[i + 1];
    if (!lower) return null;
    return `M ${n.x} ${n.y} L ${lower.x} ${lower.y}`;
  }).filter((v): v is string => Boolean(v)),
);

/** Rutas para pulsos de luz que viajan: reutilizan las bandas y la malla diagonal. */
const pulseRoutes: readonly string[] = [
  ...BANDS.map((band) => toLine(band)),
  ...bridges,
];

const PARTICLES = [
  { x: 152, y: 118, delay: 0, dur: 16 },
  { x: 420, y: 164, delay: 3.6, dur: 20 },
  { x: 614, y: 272, delay: 1.8, dur: 18 },
  { x: 802, y: 142, delay: 5.2, dur: 22 },
  { x: 1024, y: 246, delay: 2.4, dur: 17 },
  { x: 328, y: 416, delay: 7, dur: 21 },
  { x: 548, y: 526, delay: 4.4, dur: 19 },
  { x: 886, y: 458, delay: 6.2, dur: 23 },
] as const;

/** Capa de luz difuminada; sin borde visible, solo ambiente (no es un círculo). */
function Glow({ className }: { className: string }): ReactElement {
  return <span className={`abg__glow ${className}`} aria-hidden="true" />;
}

export function AnimatedBackground(): ReactElement {
  return (
    <div className="abg" aria-hidden="true">
      <span className="abg__canvas" />
      <Glow className="abg__glow--a" />
      <Glow className="abg__glow--b" />
      <svg
        className="abg__lines"
        viewBox="0 0 1200 780"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g className="abg__mesh">
          {bridges.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g className="abg__waves">
          {LINES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        {BANDS.map((band) => {
          const k0 = band[0]?.x;
          return <path key={k0 ?? Math.random()} className="abg__band" d={toLine(band)} />;
        })}
        <g className="abg__data-pulses">
          {pulseRoutes.map((d, i) => (
            <path key={`${i}-${d.slice(0, 12)}`} d={d} />
          ))}
        </g>
        {allNodes.map((node) => {
          const core = CORE_KEYS.has(key(node));
          return (
            <g key={key(node)} className="abg__node-group">
              <circle className="abg__node-rim" cx={node.x} cy={node.y} r={core ? 4.5 : 2.8} />
              {core && <circle className="abg__pulse" cx={node.x} cy={node.y} r={8} />}
              <circle
                className={core ? 'abg__node is-core' : 'abg__node'}
                cx={node.x}
                cy={node.y}
                r={core ? 2.7 : 1.7}
              />
            </g>
          );
        })}
        <g className="abg__particles">
          {PARTICLES.map((p) => (
            <circle
              key={`${p.x}-${p.y}`}
              className="abg__particle"
              cx={p.x}
              cy={p.y}
              r={1.4}
              style={{ animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
            />
          ))}
        </g>
      </svg>
      <span className="abg__noise" />
    </div>
  );
}