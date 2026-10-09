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
        {LINES.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      <span className="abg__noise" />
    </div>
  );
}