import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { itemVariants, reducedVariants, staggerContainer } from '@/motion/presets';
import { useIncidente } from '@/hooks/queries';
import { Card } from '@/components/Card';
import { EmptyState } from '@/views/shared/EmptyState';
import { SkeletonRows } from '@/components/Skeletons';
import { BadgeCell } from '@/views/shared/DataTable';
import { formatDate, formatDateTime } from '@/utils/formatters';
import {
  ESTADO_INCIDENTE_LABEL,
  PRIORIDAD_LABEL,
  PRIORIDAD_TONE,
} from '@/utils/formatters';
import { IconExternal } from '@/components/Icons';

const ESTADO_TONE = {
  abierto: 'danger',
  'en-curso': 'accent',
  resuelto: 'success',
  cerrado: 'navy',
} as const;

export function IncidenteDetailView() {
  const { id } = useParams<{ id: string }>();
  const reduced = useReducedMotion();
  const { data: incidente, isLoading } = useIncidente(id);

  if (isLoading) {
    return (
      <Card>
        <SkeletonRows rows={4} />
      </Card>
    );
  }

  if (!incidente) {
    return (
      <Card>
        <EmptyState
          title="Incidencia no encontrada"
          desc="No existe ninguna incidencia con ese identificador."
        >
          <Link className="btn btn--primary" to="/incidentes">
            Volver a incidencias
          </Link>
        </EmptyState>
      </Card>
    );
  }

  return (
    <motion.div
      className="page"
      variants={reduced ? reducedVariants : staggerContainer(0.07)}
      initial="hidden"
      animate="show"
    >
      <motion.header className="page-head" variants={reduced ? reducedVariants : itemVariants}>
        <div className="page-head__text">
          <nav className="breadcrumb" aria-label="Ruta de navegación">
            <Link className="breadcrumb__item" to="/">
              Inicio
            </Link>
            <span className="breadcrumb__sep" aria-hidden="true">
              /
            </span>
            <Link className="breadcrumb__item" to="/incidentes">
              Incidentes
            </Link>
            <span className="breadcrumb__sep" aria-hidden="true">
              /
            </span>
            <span className="breadcrumb__item is-current" aria-current="page">
              {incidente.codigo}
            </span>
          </nav>
          <h1 className="page-head__title">{incidente.titulo}</h1>
          <p className="page-head__desc">
            <span className="mono">{incidente.codigo}</span> · creado el{' '}
            {formatDate(incidente.creado)}
          </p>
        </div>
        <div className="page-head__tools">
          <BadgeCell tone={PRIORIDAD_TONE[incidente.prioridad]}>
            {PRIORIDAD_LABEL[incidente.prioridad]}
          </BadgeCell>
          <BadgeCell tone={ESTADO_TONE[incidente.estado]}>
            {ESTADO_INCIDENTE_LABEL[incidente.estado]}
          </BadgeCell>
        </div>
      </motion.header>

      <motion.div variants={reduced ? reducedVariants : itemVariants}>
        <Card title="Detalle" subtitle={incidente.descripcion}>
          <div className="detail-grid">
            <div className="detail-grid__item">
              <span className="detail-grid__label">SLA</span>
              <span className="detail-grid__value">{incidente.slaHoras} h</span>
            </div>
            <div className="detail-grid__item">
              <span className="detail-grid__label">Creado</span>
              <span className="detail-grid__value">{formatDateTime(incidente.creado)}</span>
            </div>
            <div className="detail-grid__item">
              <span className="detail-grid__label">Actualizado</span>
              <span className="detail-grid__value">{formatDateTime(incidente.actualizado)}</span>
            </div>
            <div className="detail-grid__item">
              <span className="detail-grid__label">Equipo</span>
              <span className="detail-grid__value">{incidente.equipoId}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={reduced ? reducedVariants : itemVariants}>
        <Card>
          <div className="timeline-note">
            <p className="timeline-note__title">Historial</p>
            <p>
              La incidencia se registró automáticamente desde el monitor de helpdesk y se ha
              asignado al equipo de soporte de guardia.
            </p>
          </div>
          <Link className="btn btn--ghost self-start" to="/incidentes">
            Volver al listado
            <IconExternal />
          </Link>
        </Card>
      </motion.div>
    </motion.div>
  );
}