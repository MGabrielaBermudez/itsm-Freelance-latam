import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { InventarioItem } from '@/models';
import { useInventario, useInventarioResumen } from '@/hooks/queries';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { STAGGER, itemVariants, reducedVariants, staggerContainer } from '@/motion/presets';
import { getPageMeta } from '@/services/mock';
import { formatCurrency, formatNumber, matchesSearch } from '@/utils/formatters';
import { FilterSelect } from '@/views/shared/DataTable';
import { Card } from '@/components/Card';
import { Spinner } from '@/components/Spinner';
import { Toast } from '@/components/Toast';
import { Modal } from '@/components/Modal';
import { IconArrowDown, IconBox, IconEye } from '@/components/Icons';
import { InventarioTable, type InvColumn, type InvSort } from './InventarioTable';
import { InventarioTabs } from './InventarioTabs';
import { EstadoInventarioCell, valoresUnicos, valorDeFiltro } from './inventarioUi';
import { FichaEquipo } from './inventarioFicha';

/**
 * Equipos en resguardo: el mismo inventario, filtrado a la custodia.
 * Fase 1: vista de control (consulta + ficha). Las devoluciones
 * masivas llegan en la Fase 2.
 */
export function ResguardoView() {
  const reduced = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: items, isLoading } = useInventario();
  const { data: resumen } = useInventarioResumen();

  const [sort, setSort] = useState<InvSort | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [ficha, setFicha] = useState<InventarioItem | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' | 'info' } | null>(null);

  const enResguardo = useMemo(() => (items ?? []).filter((i) => i.estado === 'en-resguardo'), [items]);

  const columnas = useMemo<InvColumn[]>(
    () => [
      {
        key: 'equipo',
        header: 'Equipo',
        sortValue: (row) => row.nombre,
        render: (row) => (
          <span className="cell-main">
            <span className="cell-main__title">{row.nombre}</span>
            <span className="cell-main__sub mono">{row.codigo}</span>
          </span>
        ),
      },
      {
        key: 'categoria',
        header: 'Categoría',
        sortValue: (row) => row.categoria,
        render: (row) => row.categoria,
      },
      {
        key: 'estado',
        header: 'Estado',
        sortValue: (row) => row.estado,
        render: (row) => <EstadoInventarioCell estado={row.estado} />,
      },
      {
        key: 'ubicacion',
        header: 'Ubicación',
        sortValue: (row) => row.ubicacion,
        render: (row) => (
          <span className="cell-main">
            <span className="cell-main__title">{row.ubicacion}</span>
            <span className="cell-main__sub">{row.almacen}</span>
          </span>
        ),
      },
      {
        key: 'antiguedad',
        header: 'Antigüedad',
        align: 'right',
        sortValue: (row) => row.diasEnUbicacion,
        render: (row) => (
          <span className="cell-main">
            <span className="cell-main__title text-tabular">{formatNumber(row.diasEnUbicacion)}</span>
            <span className="cell-main__sub">días en custodia</span>
          </span>
        ),
      },
      {
        key: 'valor',
        header: 'Valor',
        align: 'right',
        sortValue: (row) => row.valor,
        render: (row) => formatCurrency(row.valor),
      },
      {
        key: 'acciones',
        header: '',
        width: '48px',
        render: (row) => (
          <span className="inv-actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => setFicha(row)}
              aria-label={`Ver ficha de ${row.nombre}`}
              title="Ver ficha"
            >
              <IconEye width={16} height={16} />
            </button>
          </span>
        ),
      },
    ],
    [],
  );

  const ubicacion = searchParams.get('ubicacion') ?? '';
  const pais = searchParams.get('pais') ?? '';
  const q = searchParams.get('q') ?? '';

  const setParam = useCallback(
    (key: string, value: string): void => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set(key, value);
      else params.delete(key);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const filtrar = useCallback(
    (item: InventarioItem): boolean => {
      if (ubicacion && item.ubicacion !== ubicacion) return false;
      if (pais && item.pais !== pais) return false;
      return matchesSearch(
        [item.nombre, item.marca, item.modelo, item.serial, item.codigo, item.ubicacion],
        q,
      );
    },
    [ubicacion, pais, q],
  );

  const filtrados = useMemo(() => enResguardo.filter(filtrar), [enResguardo, filtrar]);

  const sorted = useMemo(() => {
    if (!sort) return filtrados;
    const col = columnas.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtrados;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtrados].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), 'es') * dir;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrados, sort, columnas]);

  const opcionesUbicacion = useMemo(() => valoresUnicos(enResguardo, (i) => i.ubicacion), [enResguardo]);
  const opcionesPais = useMemo(() => valoresUnicos(enResguardo, (i) => i.pais), [enResguardo]);

  const resumenResguardo = useMemo(() => {
    const valor = enResguardo.reduce((acc, i) => acc + i.valor, 0);
    const ubicaciones = new Set(enResguardo.map((i) => i.ubicacion)).size;
    const antiguedad = enResguardo.length
      ? Math.round(enResguardo.reduce((acc, i) => acc + i.diasEnUbicacion, 0) / enResguardo.length)
      : 0;
    return { unidades: enResguardo.length, valor, ubicaciones, antiguedad };
  }, [enResguardo]);

  const meta = useMemo(() => getPageMeta('/inventario/resguardo'), []);

  const filtrosActivos = useMemo<Array<{ param: string; label: string; value: string }>>(
    () =>
      [
        { param: 'ubicacion', label: 'Ubicación', value: ubicacion },
        { param: 'pais', label: 'País', value: pais },
        { param: 'q', label: 'Búsqueda', value: q },
      ].filter((f) => f.value !== ''),
    [ubicacion, pais, q],
  );

  const toggleRow = (id: string): void =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = (ids: string[]): void =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const todosSeleccionados = ids.every((id) => next.has(id));
      if (todosSeleccionados) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });

  return (
    <>
      <motion.div
        className="page inv-page"
        variants={reduced ? reducedVariants : staggerContainer(STAGGER.base)}
        initial="hidden"
        animate="show"
      >
        <motion.header className="page-head" variants={reduced ? reducedVariants : itemVariants}>
          <div className="page-head__text">
            <nav className="breadcrumb" aria-label="Ruta de navegación">
              <a className="breadcrumb__item" href="/">
                Inicio
              </a>
              <span className="breadcrumb__sep" aria-hidden="true">
                /
              </span>
              <span className="breadcrumb__item is-current" aria-current="page">
                {meta.titulo}
              </span>
            </nav>
            <h1 className="page-head__title">{meta.titulo}</h1>
            <p className="page-head__desc">{meta.descripcion}</p>
          </div>
          <div className="page-head__tools">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setToast({ message: 'Las devoluciones masivas llegan en la Fase 2.', tone: 'info' })}
            >
              <IconArrowDown width={15} height={15} />
              Devolver selección
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setToast({ message: 'La exportación masiva llega en la Fase 3.', tone: 'info' })}
            >
              <IconArrowDown width={15} height={15} />
              Exportar
            </button>
          </div>
        </motion.header>

        <motion.div variants={reduced ? reducedVariants : itemVariants}>
          <InventarioTabs
            counters={{
              '/inventario': resumen?.total ?? enResguardo.length,
              '/inventario/resguardo': resumen?.enResguardo ?? enResguardo.length,
            }}
          />
        </motion.div>

        <motion.div className="summary-row" variants={reduced ? reducedVariants : itemVariants}>
          <div className="summary-tile">
            <span className="summary-tile__label">Unidades en custodia</span>
            <span className="summary-tile__value">{formatNumber(resumenResguardo.unidades)}</span>
            <span className="summary-tile__hint">total en resguardo</span>
          </div>
          <div className="summary-tile">
            <span className="summary-tile__label">Valor en resguardo</span>
            <span className="summary-tile__value">{formatCurrency(resumenResguardo.valor)}</span>
            <span className="summary-tile__hint">costo del activo</span>
          </div>
          <div className="summary-tile">
            <span className="summary-tile__label">Ubicaciones</span>
            <span className="summary-tile__value">{formatNumber(resumenResguardo.ubicaciones)}</span>
            <span className="summary-tile__hint">puntos de custodia</span>
          </div>
          <div className="summary-tile">
            <span className="summary-tile__label">Antigüedad media</span>
            <span className="summary-tile__value">{formatNumber(resumenResguardo.antiguedad)} días</span>
            <span className="summary-tile__hint">desde el último movimiento</span>
          </div>
        </motion.div>

        <motion.div variants={reduced ? reducedVariants : itemVariants}>
          <Card
            footer={
              <span className="inv-footer">
                <span>
                  {formatNumber(filtrados.length)} de {formatNumber(enResguardo.length)} equipos en custodia
                </span>
                <span className="text-tabular">{sort ? `Ordenado por ${sort.key}` : 'Sin ordenar'}</span>
              </span>
            }
          >
            <div className="inv-toolbar">
              <div className="inv-toolbar__filters">
                <div className="search-field">
                  <input
                    type="search"
                    placeholder="Buscar por nombre, marca, serial…"
                    aria-label="Buscar en resguardo"
                    value={q}
                    onChange={(e) => setParam('q', e.target.value)}
                  />
                </div>
                <FilterSelect label="Ubicación" param="ubicacion" placeholder="Todas" options={opcionesUbicacion} />
                <FilterSelect label="País" param="pais" placeholder="Todos" options={opcionesPais} />
              </div>

              <span className="inv-toolbar__hint" aria-hidden="true">
                <IconBox width={14} height={14} />
                {selectedIds.size} seleccionados
              </span>
            </div>

            {(filtrosActivos.length > 0 || selectedIds.size > 0) && (
              <div className="inv-chips">
                <span className="inv-chips__label">Filtros</span>
                {filtrosActivos.map((f) => {
                  const conteo =
                    f.param === 'q'
                      ? filtrados.length
                      : enResguardo.filter((i) => String(valorDeFiltro(i, f.param) ?? '') === f.value).length;
                  return (
                    <button
                      key={f.param}
                      type="button"
                      className="chip"
                      onClick={() => setParam(f.param, '')}
                      aria-label={`Quitar filtro ${f.label}`}
                    >
                      {f.label}: <strong>{f.value}</strong>
                      <span className="chip__count">{conteo}</span>
                    </button>
                  );
                })}
                {selectedIds.size > 0 && (
                  <button type="button" className="chip" onClick={() => setSelectedIds(new Set())}>
                    {selectedIds.size} seleccionados
                    <span className="chip__count">quitar</span>
                  </button>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="inv-loading">
                <Spinner label="Cargando resguardo" />
              </div>
            ) : (
              <InventarioTable
                columns={columnas}
                rows={sorted}
                rowKey={(row) => row.id}
                sort={sort}
                onSortChange={setSort}
                selectedIds={selectedIds}
                onToggleRow={toggleRow}
                onToggleAll={toggleAll}
                isLoading={false}
                emptyTitle="No hay equipos en custodia con estos filtros"
                emptyDesc="Ajusta la búsqueda o quita algún filtro para ampliar el listado."
              />
            )}
          </Card>
        </motion.div>
      </motion.div>

      <Modal
        open={ficha !== null}
        onClose={() => setFicha(null)}
        title={ficha?.nombre ?? ''}
        subtitle={ficha ? `${ficha.codigo} · ${ficha.marca} ${ficha.modelo}` : ''}
      >
        {ficha && <FichaEquipo item={ficha} />}
      </Modal>

      <Toast message={toast?.message ?? null} onClose={() => setToast(null)} tone={toast?.tone ?? 'info'} />
    </>
  );
}