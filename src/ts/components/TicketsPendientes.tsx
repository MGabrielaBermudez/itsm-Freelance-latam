import { type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TicketPendiente } from '@/models';
import {
  ESTADO_INCIDENTE_LABEL,
  PRIORIDAD_LABEL,
  PRIORIDAD_TONE,
  formatRelativeTime,
} from '@/utils/formatters';
import { Card } from '@/components/Card';
import { EmptyState } from '@/views/shared/EmptyState';
import { SkeletonRows } from '@/components/Skeletons';
import { BadgeCell } from '@/views/shared/DataTable';
import { IconChevronRight, IconInbox } from '@/components/Icons';

interface TicketsPendientesProps {
  items: TicketPendiente[];
  isLoading?: boolean;
}

/**
 * Tabla compacta de tickets pendientes a ancho completo.
 * Muestra estado de carga, estado vacío y filas navegables.
 */
export function TicketsPendientes({ items, isLoading = false }: TicketsPendientesProps) {
  const navigate = useNavigate();

  const openRow = (href: string): void => navigate(href);

  const handleKey = (event: KeyboardEvent<HTMLTableRowElement>, href: string): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      openRow(href);
    }
  };

  return (
    <Card
      enter
      title="Tickets pendientes"
      subtitle="Incidencias que esperan asignación o primera respuesta"
      actions={
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => navigate('/incidentes?estado=pendiente')}
        >
          Ver todos
          <IconChevronRight width={13} height={13} />
        </button>
      }
    >
      {isLoading ? (
        <SkeletonRows rows={3} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay tickets pendientes"
          desc="Todo está asignado. Los nuevos tickets aparecerán aquí automáticamente."
        >
          <span className="empty-cta">
            <IconInbox width={15} height={15} />
            Bandeja al día
          </span>
        </EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="table table--compact">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Título</th>
                <th scope="col">Prioridad</th>
                <th scope="col">Estado</th>
                <th scope="col" className="table__num">
                  Tiempo
                </th>
                <th scope="col" aria-label="Abrir" />
              </tr>
            </thead>
            <tbody>
              {items.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="link-row"
                  tabIndex={0}
                  role="link"
                  aria-label={`${ticket.codigo}: ${ticket.titulo}. Abrir detalle`}
                  onClick={() => openRow(ticket.href)}
                  onKeyDown={(event) => handleKey(event, ticket.href)}
                >
                  <td className="mono">{ticket.codigo}</td>
                  <td className="cell-main__title">{ticket.titulo}</td>
                  <td>
                    <BadgeCell tone={PRIORIDAD_TONE[ticket.prioridad]}>
                      {PRIORIDAD_LABEL[ticket.prioridad]}
                    </BadgeCell>
                  </td>
                  <td>{ESTADO_INCIDENTE_LABEL[ticket.estado]}</td>
                  <td className="table__num">{formatRelativeTime(ticket.fecha)}</td>
                  <td className="table__chevron">
                    <IconChevronRight width={15} height={15} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
