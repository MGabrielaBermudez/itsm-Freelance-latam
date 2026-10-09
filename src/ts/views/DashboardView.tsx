import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { KpiKey, Periodo } from '@/models';
import { useDashboard } from '@/hooks/queries';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  STAGGER,
  itemVariants,
  reducedVariants,
  staggerContainer,
} from '@/motion/presets';
import { KpiCard } from '@/components/KpiCard';
import { DonutChart } from '@/components/DonutChart';
import { TrendChart } from '@/components/TrendChart';
import { StatusBar } from '@/components/StatusBar';
import { ActivityFeed } from '@/components/ActivityFeed';
import { TicketsPendientes } from '@/components/TicketsPendientes';
import { Card } from '@/components/Card';
import { SkeletonsKpiGrid, SkeletonChart, SkeletonRows } from '@/components/Skeletons';
import { ErrorView } from '@/views/shared/LoadingView';
import { IconChevronRight } from '@/components/Icons';

const KPI_LABELS: Record<KpiKey, string> = {
  equipos: 'Total de equipos',
  freelancers: 'Freelancers activos',
  asignaciones: 'Asignaciones activas',
  incidentes: 'Incidentes abiertos',
  onboarding: 'Onboarding pendiente',
  stock: 'En stock',
};

export function DashboardView() {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useDashboard();
  const [periodo, setPeriodo] = useState<Periodo>(30);
  const [expandedKpi, setExpandedKpi] = useState<KpiKey | null>(null);

  const toggleKpi = useCallback((key: KpiKey) => {
    setExpandedKpi((current) => (current === key ? null : key));
  }, []);

  if (isError) {
    return <ErrorView message={error instanceof Error ? error.message : 'Error desconocido'} />;
  }

  return (
    <motion.div
      className="dashboard"
      variants={reduced ? reducedVariants : staggerContainer(STAGGER.base)}
      initial="hidden"
      animate="show"
    >
      {/* 4 · Indicadores clave: 3×2 (≥1024) · 2 (640-1023) · 1 en móvil */}
      <motion.section
        className="dashboard__section"
        aria-labelledby="kpi-title"
        variants={reduced ? reducedVariants : itemVariants}
      >
        <div className="dashboard__section-head">
          <h2 className="dashboard__section-title" id="kpi-title">
            Indicadores clave
          </h2>
          {expandedKpi && (
            <button
              type="button"
              className="btn btn--soft btn--sm"
              onClick={() => setExpandedKpi(null)}
            >
              Contraer desglose
              <IconChevronRight className="rotate-180" width={13} height={13} />
            </button>
          )}
        </div>

        {isLoading ? (
          <SkeletonsKpiGrid />
        ) : (
          <motion.div
            className="grid grid--kpi"
            layout
            variants={reduced ? reducedVariants : staggerContainer(STAGGER.tight)}
            initial="hidden"
            animate="show"
          >
            {data?.kpis.map((kpi) => (
              <KpiCard
                key={kpi.clave}
                kpi={kpi}
                label={KPI_LABELS[kpi.clave]}
                expanded={expandedKpi === kpi.clave}
                onToggleExpand={() => toggleKpi(kpi.clave)}
              />
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* 5 · Gráficos: dona (5 col.) y tendencia (7 col.) */}
      <div className="grid grid--charts">
        <Card
          enter
          className="grid__span-5"
          title="Equipos por estado"
          subtitle="Clic en un estado para filtrar el inventario"
        >
          {isLoading ? (
            <SkeletonChart size="donut" />
          ) : (
            <DonutChart data={data?.estados ?? []} />
          )}
        </Card>

        {isLoading ? (
          <Card
            enter
            className="grid__span-7"
            title={`Tendencia de incidentes (${periodo} días)`}
            subtitle="Abiertos vs Resueltos"
          >
            <SkeletonChart size="bar" />
          </Card>
        ) : (
          <TrendChart
            className="grid__span-7"
            data={data?.tendencia ?? []}
            periodo={periodo}
            onPeriodoChange={setPeriodo}
          />
        )}
      </div>

      {/* 6 · Operativa: Estado operativo (5 col.) y Actividad reciente (7 col.) */}
      <div className="grid grid--halves">
        <Card
          enter
          className="grid__span-5"
          title="Estado operativo"
          subtitle="Inventario en stock frente a equipos operativos"
        >
          {isLoading ? (
            <SkeletonRows rows={3} />
          ) : data ? (
            <StatusBar data={data.operativo} />
          ) : null}
        </Card>

        <Card
          enter
          className="grid__span-7"
          title="Actividad reciente"
          subtitle="Últimos eventos registrados en el sistema"
          actions={
            <div className="card-actions-inline">
              <span className="live-tag">
                <span className="live-tag__dot live-dot" aria-hidden="true" />
                En vivo
              </span>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => navigate('/incidentes')}
              >
                Ver todos
                <IconChevronRight width={13} height={13} />
              </button>
            </div>
          }
        >
          {isLoading ? (
            <SkeletonRows rows={6} />
          ) : (
            <ActivityFeed
              initialItems={data?.actividad ?? []}
              limit={10}
              intervalMs={15_000}
            />
          )}
        </Card>
      </div>

      {/* 7 · Tickets pendientes a ancho completo */}
      <TicketsPendientes items={data?.ticketsPendientes ?? []} isLoading={isLoading} />
    </motion.div>
  );
}
