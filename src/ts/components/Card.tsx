import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { reducedVariants, sectionVariants } from '@/motion/presets';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type Variant = 'default' | 'plain' | 'accent' | 'success' | 'warning';

interface CardProps extends Omit<HTMLMotionProps<'section'>, 'variants' | 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: Variant;
  /** Anima la entrada de la tarjeta (respeta reduced-motion). */
  enter?: boolean;
  children: React.ReactNode;
}

/** Superficie base del panel: 16px de radio, borde azul marino y sombra suave. */
export function Card({
  title,
  subtitle,
  actions,
  footer,
  variant = 'default',
  enter = false,
  children,
  className: classNameProp,
  ...rest
}: CardProps) {
  const reduced = useReducedMotion();
  const className = ['card', variant !== 'default' && `card--${variant}`, classNameProp]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.section
      className={className}
      variants={enter ? (reduced ? reducedVariants : sectionVariants) : undefined}
      {...rest}
    >
      {(title || actions) && (
        <header className="card__header">
          <div className="card__title-group">
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      <div className="card__body">{children}</div>
      {footer && <footer className="card__footer">{footer}</footer>}
    </motion.section>
  );
}