import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { itemVariants, reducedVariants, staggerContainer } from '@/motion/presets';
import { useFreelancers, useOnboarding } from '@/hooks/queries';
import { Card } from '@/components/Card';
import { EmptyState } from '@/views/shared/EmptyState';
import { SkeletonRows } from '@/components/Skeletons';
import { AvatarCell, BadgeCell } from '@/views/shared/DataTable';
import { formatDate } from '@/utils/formatters';

const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  'en-curso': 'En curso',
  completado: 'Completado',
} as const;

const ESTADO_TONE = {
  pendiente: 'warning',
  'en-curso': 'accent',
  completado: 'success',
} as const;

export function OnboardingDetailView() {
  const { id } = useParams<{ id: string }>();
  const reduced = useReducedMotion();
  const onboardingQuery = useOnboarding();
  const freelancersQuery = useFreelancers();

  const onboarding = (onboardingQuery.data ?? []).find((o) => o.id === id) ?? null;
  const persona = freelancersQuery.data?.find((f) => f.id === onboarding?.freelancerId);

  if (onboardingQuery.isLoading) {
    return (
      <Card>
        <SkeletonRows rows={5} />
      </Card>
    );
  }

  if (!onboarding) {
    return (
      <Card>
        <EmptyState
          title="Onboarding no encontrado"
          desc="No existe ningún proceso de onboarding con ese identificador."
        >
          <Link className="btn btn--primary" to="/onboarding">
            Volver a onboarding
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
            <Link className="breadcrumb__item" to="/onboarding">
              Onboarding
            </Link>
            <span className="breadcrumb__sep" aria-hidden="true">
              /
            </span>
            <span className="breadcrumb__item is-current" aria-current="page">
              {persona?.nombre ?? onboarding.id}
            </span>
          </nav>
          <h1 className="page-head__title">Onboarding · {onboarding.puesto}</h1>
          <p className="page-head__desc">
            {onboarding.pasosCompletados} de {onboarding.pasosTotales} pasos completados ·
            inicio {formatDate(onboarding.inicio)}
          </p>
        </div>
        <div className="page-head__tools">
          <BadgeCell tone={ESTADO_TONE[onboarding.estado]}>{ESTADO_LABEL[onboarding.estado]}</BadgeCell>
        </div>
      </motion.header>

      <motion.div variants={reduced ? reducedVariants : itemVariants}>
        <Card title="Persona" subtitle="Datos de la incorporación">
          {persona ? (
            <div className="cell-inline">
              <AvatarCell name={persona.nombre} sub={persona.email} />
              <BadgeCell tone="neutral">{persona.nivel}</BadgeCell>
            </div>
          ) : (
            <p className="page-head__desc">Sin persona vinculada.</p>
          )}
        </Card>
      </motion.div>

      <motion.div variants={reduced ? reducedVariants : itemVariants}>
        <Card title="Checklist" subtitle="Pasos del proceso en orden">
          <ol className="step-list">
            {onboarding.pasos.map((paso, index) => {
              const isCurrent = !paso.completada && index === onboarding.pasosCompletados;
              return (
                <li
                  key={paso.id}
                  className={`step-item${paso.completada ? ' is-done' : ''}${
                    isCurrent ? ' is-current' : ''
                  }`}
                >
                  <span className="step-item__rail" aria-hidden="true">
                    <span className="step-item__line" />
                    <span className="step-item__dot" />
                  </span>
                  <span className="step-item__body">
                    <span className="step-item__title">{paso.titulo}</span>
                    <span className="step-item__meta">
                      {paso.detalle || (paso.completada ? 'Completado' : 'Pendiente')}
                    </span>
                  </span>
                  {paso.completada && <BadgeCell tone="success">Hecho</BadgeCell>}
                  {isCurrent && <BadgeCell tone="accent">En curso</BadgeCell>}
                </li>
              );
            })}
          </ol>
        </Card>
      </motion.div>
    </motion.div>
  );
}