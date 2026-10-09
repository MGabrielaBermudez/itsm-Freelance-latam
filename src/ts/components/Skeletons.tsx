import type { ReactNode } from 'react';

/**
 * Geometría de los esqueletos definida como tokens en CSS
 * (`src/css/components/skeleton.css`) para no usar estilos inline.
 * El TSX elige el token; el valor vive en la hoja de estilos.
 */
export type SkeletonWidth =
  | '18'
  | '22'
  | '32'
  | '36'
  | '42'
  | '45'
  | '47'
  | '59'
  | '64'
  | '72'
  | 'pct-22'
  | 'pct-28'
  | 'pct-32'
  | 'pct-42'
  | 'pct-45'
  | 'pct-47'
  | 'pct-59'
  | 'pct-60'
  | 'pct-62'
  | 'pct-70'
  | 'pct-71'
  | 'pct-78'
  | 'pct-80'
  | 'pct-83'
  | 'pct-95'
  | 'full';

export type SkeletonHeight =
  | '9'
  | '10'
  | '11'
  | '12'
  | '18'
  | '22'
  | '26'
  | '32'
  | '34'
  | '36'
  | '40'
  | 'fill';

export type SkeletonRadius = '6' | '8' | '9' | '10' | '12' | 'pill';

interface SkeletonProps {
  width?: SkeletonWidth;
  height?: SkeletonHeight;
  className?: string;
  radius?: SkeletonRadius;
}

export function Skeleton({ width, height = '12', className, radius }: SkeletonProps) {
  const classes = ['skeleton'];
  if (width) classes.push(`sk-w--${width}`);
  if (height) classes.push(`sk-h--${height}`);
  if (radius) classes.push(`sk-r--${radius}`);
  if (className) classes.push(className);

  return <span className={classes.join(' ')} aria-hidden="true" />;
}

const CARD_LINE_WIDTHS: SkeletonWidth[] = ['pct-95', 'pct-83', 'pct-71', 'pct-59', 'pct-47'];

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card__body">
      <Skeleton height="12" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={CARD_LINE_WIDTHS[i] ?? 'pct-47'} height="12" />
      ))}
    </div>
  );
}

export function SkeletonKpi() {
  return (
    <div className="kpi kpi--skeleton" aria-hidden="true">
      <div className="kpi__main">
        <div className="kpi__left">
          <div className="kpi__head">
            <span className="kpi__icon">
              <Skeleton width="18" height="18" radius="6" />
            </span>
            <Skeleton width="42" height="11" />
          </div>
          <Skeleton width="64" height="26" radius="6" />
        </div>
        <div className="kpi__right">
          <Skeleton width="full" height="fill" radius="12" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonsKpiGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid--kpi">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonKpi key={i} />
      ))}
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="sk-stack">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="sk-row" key={i}>
          <Skeleton width="36" height="36" radius="10" />
          <div className="sk-row__grow">
            <Skeleton width="pct-42" height="11" />
            <div className="sk-gap" />
            <Skeleton width="pct-62" height="9" />
          </div>
          <Skeleton width="64" height="22" radius="pill" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Elemento</th>
            <th>Estado</th>
            <th>Detalle</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td>
                <div className="cell-inline">
                  <Skeleton width="32" height="32" radius="9" />
                  <div className="sk-row__grow sk-row__grow--wide">
                    <Skeleton width="pct-70" height="11" />
                    <div className="sk-gap" />
                    <Skeleton width="pct-45" height="9" />
                  </div>
                </div>
              </td>
              <td>
                <Skeleton width="72" height="22" radius="pill" />
              </td>
              <td>
                <Skeleton width="pct-80" height="10" />
              </td>
              <td>
                <Skeleton width="64" height="10" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonChart({ size = 'donut' }: { size?: 'donut' | 'bar' }) {
  return (
    <div className={`sk-col ${size === 'bar' ? 'sk-col--bar' : 'sk-col--donut'}`}>
      <Skeleton width="full" height="fill" radius="12" />
      <div className="sk-row sk-row--legend">
        <Skeleton width="pct-32" height="10" />
        <Skeleton width="pct-28" height="10" />
        <Skeleton width="pct-22" height="10" />
      </div>
    </div>
  );
}

export function SkeletonChildren({ children }: { children: ReactNode }) {
  return <>{children}</>;
}