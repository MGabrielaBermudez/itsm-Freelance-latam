import type { InventarioItem } from '@/models';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import { EstadoInventarioCell } from './inventarioUi';

/**
 * Ficha de un equipo del inventario: campos de control, trazabilidad
 * y el historial de movimientos. Compartida por las vistas del módulo.
 */
export function FichaEquipo({ item }: { item: InventarioItem }) {
  return (
    <div className="inv-ficha">
      <div className="detail-grid">
        <div className="detail-grid__item">
          <span className="detail-grid__label">Estado</span>
          <EstadoInventarioCell estado={item.estado} />
        </div>
        <div className="detail-grid__item">
          <span className="detail-grid__label">Categoría</span>
          <span className="detail-grid__value">{item.categoria}</span>
        </div>
        <div className="detail-grid__item">
          <span className="detail-grid__label">Ubicación</span>
          <span className="detail-grid__value">{item.ubicacion}</span>
        </div>
        <div className="detail-grid__item">
          <span className="detail-grid__label">País</span>
          <span className="detail-grid__value">{item.pais}</span>
        </div>
        <div className="detail-grid__item">
          <span className="detail-grid__label">Almacén</span>
          <span className="detail-grid__value">{item.almacen}</span>
        </div>
        <div className="detail-grid__item">
          <span className="detail-grid__label">N.º de serie</span>
          <span className="detail-grid__value mono">{item.serial}</span>
        </div>
        <div className="detail-grid__item">
          <span className="detail-grid__label">Valor</span>
          <span className="detail-grid__value text-tabular">{formatCurrency(item.valor)}</span>
        </div>
        <div className="detail-grid__item">
          <span className="detail-grid__label">Último movimiento</span>
          <span className="detail-grid__value">{formatRelativeTime(item.fechaUltimoMovimiento)}</span>
        </div>
      </div>

      <div className="inv-ficha__hist">
        <h4 className="inv-ficha__hist-title">Historial</h4>
        <ul className="inv-hist">
          {item.historial.map((mov) => (
            <li key={mov.id} className="inv-hist__item">
              <span className="badge badge--navy">{mov.tipo}</span>
              <span className="inv-hist__body">
                <span className="inv-hist__title">{mov.hacia}</span>
                {mov.desde && <span className="inv-hist__sub">desde {mov.desde}</span>}
              </span>
              <span className="inv-hist__meta">
                {formatRelativeTime(mov.fecha)} · {mov.usuario}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}