import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { reducedVariants, itemVariants, staggerContainer } from '@/motion/presets';
import { useEquipos, useFreelancers } from '@/hooks/queries';
import { Card } from '@/components/Card';
import { EmptyState } from '@/views/shared/EmptyState';
import { SkeletonRows } from '@/components/Skeletons';
import { AvatarCell, BadgeCell } from '@/views/shared/DataTable';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';

export function EquipoDetailView() {
  const { id } = useParams<{ id: string }>();
  const reduced = useReducedMotion();
  const equiposQuery = useEquipos();
  const freelancersQuery = useFreelancers();

  const equipo = useMemo(
    () => (equiposQuery.data ?? []).find((e) => e.id === id) ?? null,
    [equiposQuery.data, id],
  );
  const responsable = freelancersQuery.data?.find((f) => f.id === equipo?.freelancerId);

  if (equiposQuery.isLoading) {
    return (
      <Card>
        <SkeletonRows rows={4} />
      </Card>
    );
  }

  if (!equipo) {
    return (
      <Card>
        <EmptyState
          title="Equipo no encontrado"
          desc="El identificador de la URL no corresponde a ningún equipo del inventario."
        >
          <Link className="btn btn--primary" to="/equipos">
            Volver a equipos
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
            <Link className="breadcrumb__item" to="/equipos">
              Equipos
            </Link>
            <span className="breadcrumb__sep" aria-hidden="true">
              /
            </span>
            <span className="breadcrumb__item is-current" aria-current="page">
              {equipo.nombre}
            </span>
          </nav>
          <h1 className="page-head__title">{equipo.nombre}</h1>
          <p className="page-head__desc">
            {equipo.marca} {equipo.modelo} · Serial <span className="mono">{equipo.serial}</span>
          </p>
        </div>
        <div className="page-head__tools">
          <BadgeCell tone={equipo.estado === 'asignado' ? 'success' : equipo.estado === 'en-stock' ? 'accent' : 'warning'}>
            {equipo.estado === 'asignado' ? 'Asignado' : equipo.estado === 'en-stock' ? 'En stock' : 'En resguardo'}
          </BadgeCell>
          <Link className="btn btn--primary" to="/equipos">
            Volver al inventario
          </Link>
        </div>
      </motion.header>

      <motion.div variants={reduced ? reducedVariants : itemVariants}>
        <Card title="Ficha del equipo">
          <div className="detail-grid">
            <div className="detail-grid__item">
              <span className="detail-grid__label">Tipo</span>
              <span className="detail-grid__value">{equipo.tipo}</span>
            </div>
            <div className="detail-grid__item">
              <span className="detail-grid__label">Ubicación</span>
              <span className="detail-grid__value">{equipo.ubicacion}</span>
            </div>
            <div className="detail-grid__item">
              <span className="detail-grid__label">Días en stock</span>
              <span className="detail-grid__value">{formatNumber(equipo.diasEnStock)}</span>
            </div>
            <div className="detail-grid__item">
              <span className="detail-grid__label">Valor</span>
              <span className="detail-grid__value">{formatCurrency(equipo.valor)}</span>
            </div>
            <div className="detail-grid__item">
              <span className="detail-grid__label">Último movimiento</span>
              <span className="detail-grid__value">{formatDate(equipo.fechaUltimoMovimiento)}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={reduced ? reducedVariants : itemVariants}>
        <Card title="Responsable actual">
          {responsable ? (
            <div className="cell-inline">
              <AvatarCell name={responsable.nombre} sub={responsable.email} />
              <BadgeCell tone="accent">{responsable.especialidad}</BadgeCell>
            </div>
          ) : (
            <p className="page-head__desc">
              Este equipo no tiene responsable asignado actualmente.
            </p>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}