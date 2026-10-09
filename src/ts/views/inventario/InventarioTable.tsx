import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { InventarioItem } from '@/models';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { itemVariants, reducedVariants } from '@/motion/presets';
import { SkeletonTable } from '@/components/Skeletons';
import { EmptyState } from '@/views/shared/EmptyState';
import { IconChevronDown } from '@/components/Icons';

export interface InvColumn {
  key: string;
  header: string;
  align?: 'left' | 'right';
  width?: string;
  /** Valor de comparación para el orden; si falta, la columna no es ordenable. */
  sortValue?: (row: InventarioItem) => string | number;
  render: (row: InventarioItem) => ReactNode;
}

export type SortDir = 'asc' | 'desc';

export interface InvSort {
  key: string;
  dir: SortDir;
}

interface InventarioTableProps {
  columns: InvColumn[];
  rows: InventarioItem[];
  rowKey: (row: InventarioItem) => string;
  sort: InvSort | null;
  onSortChange: (sort: InvSort) => void;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  isLoading: boolean;
  emptyTitle: string;
  emptyDesc: string;
}

/**
 * Tabla del módulo de inventario: cabeceras ordenables, columna de
 * selección con "selccionar todo" y celdas de acciones libres.
 */
export function InventarioTable({
  columns,
  rows,
  rowKey,
  sort,
  onSortChange,
  selectedIds,
  onToggleRow,
  onToggleAll,
  isLoading,
  emptyTitle,
  emptyDesc,
}: InventarioTableProps) {
  const reduced = useReducedMotion();
  const allChecked = rows.length > 0 && rows.every((row) => selectedIds.has(rowKey(row)));
  const someChecked = rows.some((row) => selectedIds.has(rowKey(row)));

  const toggleSort = (column: InvColumn): void => {
    if (!column.sortValue) return;
    if (sort?.key === column.key) {
      onSortChange({ key: column.key, dir: sort.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ key: column.key, dir: 'asc' });
    }
  };

  return (
    <motion.div
      variants={reduced ? reducedVariants : itemVariants}
      initial="hidden"
      animate="show"
    >
      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} desc={emptyDesc} />
      ) : (
        <div className="table-wrap">
          <table className="table inv-table">
            <caption className="sr-only">Inventario</caption>
            <thead>
              <tr>
                <th scope="col" className="inv-check-col">
                  <span className="inv-checkbox">
                    <input
                      type="checkbox"
                      aria-label="Seleccionar todo"
                      checked={allChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = someChecked && !allChecked;
                      }}
                      onChange={() => onToggleAll(rows.map(rowKey))}
                    />
                    <span aria-hidden="true" className="inv-checkbox__box" />
                  </span>
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width }}
                    className={col.align === 'right' ? 'table__num' : undefined}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        className="table__sort inv-sort"
                        onClick={() => toggleSort(col)}
                        aria-sort={
                          sort?.key === col.key
                            ? sort.dir === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : 'none'
                        }
                      >
                        {col.header}
                        <IconChevronDown
                          className={`inv-sort__icon${sort?.key === col.key ? ' is-active' : ''}${
                            sort?.key === col.key && sort.dir === 'desc' ? ' is-desc' : ''
                          }`}
                          width={13}
                          height={13}
                        />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = rowKey(row);
                const checked = selectedIds.has(id);
                return (
                  <tr key={id} className={checked ? 'is-selected' : undefined}>
                    <td className="inv-check-col">
                      <span className="inv-checkbox">
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar ${row.nombre}`}
                          checked={checked}
                          onChange={() => onToggleRow(id)}
                        />
                        <span aria-hidden="true" className="inv-checkbox__box" />
                      </span>
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className={col.align === 'right' ? 'table__num' : undefined}>
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}