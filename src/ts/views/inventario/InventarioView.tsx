import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import type { InventarioInput, InventarioItem } from '@/models';
import { QUERY_KEYS } from '@/services/api';
import { actualizarInventarioItem, crearInventarioItem } from '@/services/inventarioService';
import { useInventario, useInventarioResumen } from '@/hooks/queries';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { STAGGER, itemVariants, reducedVariants, staggerContainer } from '@/motion/presets';
import { getPageMeta } from '@/services/mock';
import { formatCurrency, formatNumber, matchesSearch } from '@/utils/formatters';
import { FilterSelect } from '@/views/shared/DataTable';
import { FichaEquipo } from './inventarioFicha';
import { Card } from '@/components/Card';
import { Spinner } from '@/components/Spinner';
import { Toast } from '@/components/Toast';
import { Modal } from '@/components/Modal';
import { IconBox, IconClose, IconEdit, IconEye, IconGrid, IconList, IconMap, IconPlus, IconUpload } from '@/components/Icons';
import { InventarioTable, type InvColumn, type InvSort } from './InventarioTable';
import { InventarioTabs } from './InventarioTabs';
import { InventarioForm } from './InventarioForm';
import { EstadoInventarioCell, ESTADO_INVENTARIO_OPTIONS, valoresUnicos, valorDeFiltro } from './inventarioUi';

type ModalState =
  | { tipo: 'crear' }
  | { tipo: 'editar'; item: InventarioItem }
  | { tipo: 'ficha'; item: InventarioItem };

type Vista = 'lista' | 'racks' | 'ubicacion';

const VISTAS: Array<{ value: Vista; label: string; Icon: typeof IconList }> = [
  { value: 'lista', label: 'Lista', Icon: IconList },
  { value: 'racks', label: 'En racks', Icon: IconGrid },
  { value: 'ubicacion', label: 'Por ubicación', Icon: IconMap },
];

export function InventarioView() {
  const reduced = useReducedMotion();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: items, isLoading } = useInventario();
  const { data: resumen } = useInventarioResumen();

  const [sort, setSort] = useState<InvSort | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' | 'info' } | null>(null);

  const todos = useMemo(() => items ?? [], [items]);

  const estado = searchParams.get('estado') ?? '';
  const categoria = searchParams.get('categoria') ?? '';
  const ubicacion = searchParams.get('ubicacion') ?? '';
  const pais = searchParams.get('pais') ?? '';
  const q = searchParams.get('q') ?? '';
  const vistaParam = (searchParams.get('vista') ?? 'lista') as Vista;

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
      if (estado && item.estado !== estado) return false;
      if (categoria && item.categoria !== categoria) return false;
      if (ubicacion && item.ubicacion !== ubicacion) return false;
      if (pais && item.pais !== pais) return false;
      return matchesSearch([item.nombre, item.marca, item.modelo, item.serial, item.codigo, item.ubicacion], q);
    },
    [estado, categoria, ubicacion, pais, q],
  );

  const filtrados = useMemo(() => todos.filter(filtrar), [todos, filtrar]);

  const opcionesCategoria = useMemo(() => valoresUnicos(todos, (i) => i.categoria), [todos]);
  const opcionesUbicacion = useMemo(() => valoresUnicos(todos, (i) => i.ubicacion), [todos]);
  const opcionesPais = useMemo(() => valoresUnicos(todos, (i) => i.pais), [todos]);

  const meta = useMemo(() => getPageMeta('/inventario'), []);

  const filtrosActivos = useMemo<Array<{ param: string; label: string; value: string }>>(
    () =>
      [
        { param: 'estado', label: 'Estado', value: estado },
        { param: 'categoria', label: 'Categoría', value: categoria },
        { param: 'ubicacion', label: 'Ubicación', value: ubicacion },
        { param: 'pais', label: 'País', value: pais },
        { param: 'q', label: 'Búsqueda', value: q },
      ].filter((f) => f.value !== ''),
    [estado, categoria, ubicacion, pais, q],
  );

  const cambiarVista = (vista: Vista): void => {
    if (vista === vistaParam && vista === 'lista') return;
    if (vista === 'racks' || vista === 'ubicacion') {
      setToast({ message: `La vista «${VISTAS.find((v) => v.value === vista)?.label}» llega en la Fase 2.`, tone: 'info' });
      return;
    }
    setParam('vista', vista);
  };

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

  const guardar = async (input: InventarioInput): Promise<void> => {
    setBusy(true);
    try {
      if (modal?.tipo === 'editar') {
        await actualizarInventarioItem(modal.item.id, input);
        setToast({ message: 'Equipo actualizado correctamente.', tone: 'success' });
      } else {
        await crearInventarioItem(input);
        setToast({ message: 'Equipo registrado en el inventario.', tone: 'success' });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventario });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventarioResumen });
      setModal(null);
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'No se pudo guardar.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const tituloEditar = modal?.tipo === 'editar' ? modal.item.nombre : '';

  const columnas = useMemo<InvColumn[]>(
    () => [
      {
        key: 'equipo',
        header: 'Equipo',
        sortValue: (row) => row.nombre,
        render: (row) => (
          <span className="cell-inline">
            <span className="avatar avatar--sm" aria-hidden="true">
              {row.marca.slice(0, 2).toUpperCase()}
            </span>
            <span className="cell-main">
              <span className="cell-main__title">{row.nombre}</span>
              <span className="cell-main__sub mono">{row.codigo}</span>
            </span>
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
            <span className="cell-main__sub">{row.pais}</span>
          </span>
        ),
      },
      {
        key: 'dias',
        header: 'Días en ubicación',
        align: 'right',
        sortValue: (row) => row.diasEnUbicacion,
        render: (row) => formatNumber(row.diasEnUbicacion),
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
        width: '92px',
        render: (row) => (
          <span className="inv-actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => setModal({ tipo: 'ficha', item: row })}
              aria-label={`Ver ficha de ${row.nombre}`}
              title="Ver ficha"
            >
              <IconEye width={16} height={16} />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => setModal({ tipo: 'editar', item: row })}
              aria-label={`Editar ${row.nombre}`}
              title="Editar"
            >
              <IconEdit width={16} height={16} />
            </button>
            <span className="inv-actions__box" aria-hidden="true">
              <IconBox width={15} height={15} />
            </span>
          </span>
        ),
      },
    ],
    [],
  );

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
  }, [filtrados, sort, columnas]);

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
              onClick={() => setToast({ message: 'La importación masiva llega en la Fase 3.', tone: 'info' })}
            >
              <IconUpload width={15} height={15} />
              Importar
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setModal({ tipo: 'crear' })}>
              <IconPlus width={15} height={15} />
              Nuevo equipo
            </button>
          </div>
        </motion.header>

        <motion.div variants={reduced ? reducedVariants : itemVariants}>
          <InventarioTabs
            counters={{
              '/inventario': resumen?.total ?? todos.length,
              '/inventario/resguardo': resumen?.enResguardo ?? 0,
            }}
          />
        </motion.div>

        {resumen && (
          <motion.div className="summary-row" variants={reduced ? reducedVariants : itemVariants}>
            <div className="summary-tile">
              <span className="summary-tile__label">Unidades gestionadas</span>
              <span className="summary-tile__value">{formatNumber(resumen.total)}</span>
              <span className="summary-tile__hint">activo total</span>
            </div>
            <div className="summary-tile">
              <span className="summary-tile__label">Disponibles</span>
              <span className="summary-tile__value">{formatNumber(resumen.disponibles)}</span>
              <span className="summary-tile__hint">listas para asignar</span>
            </div>
            <div className="summary-tile">
              <span className="summary-tile__label">En resguardo</span>
              <span className="summary-tile__value">{formatNumber(resumen.enResguardo)}</span>
              <span className="summary-tile__hint">en custodia</span>
            </div>
            <div className="summary-tile">
              <span className="summary-tile__label">Valor total</span>
              <span className="summary-tile__value">{formatCurrency(resumen.valorTotal)}</span>
              <span className="summary-tile__hint">costo del activo</span>
            </div>
          </motion.div>
        )}

        <motion.div variants={reduced ? reducedVariants : itemVariants}>
          <Card
            footer={
              <span className="inv-footer">
                <span>
                  {formatNumber(filtrados.length)} de {formatNumber(todos.length)} equipos
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
                    aria-label="Buscar en inventario"
                    value={q}
                    onChange={(e) => setParam('q', e.target.value)}
                  />
                </div>
                <FilterSelect label="Categoría" param="categoria" placeholder="Todas" options={opcionesCategoria} />
                <FilterSelect label="Estado" param="estado" placeholder="Todos" options={ESTADO_INVENTARIO_OPTIONS} />
                <FilterSelect label="Ubicación" param="ubicacion" placeholder="Todas" options={opcionesUbicacion} />
                <FilterSelect label="País" param="pais" placeholder="Todos" options={opcionesPais} />
              </div>

              <div className="inv-toolbar__view" role="group" aria-label="Selección de vista">
                {VISTAS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={`chip chip--lg${vistaParam === value && value === 'lista' ? ' is-active' : ''}`}
                    onClick={() => cambiarVista(value)}
                    aria-pressed={vistaParam === value && value === 'lista'}
                  >
                    <Icon width={15} height={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {(filtrosActivos.length > 0 || selectedIds.size > 0) && (
              <div className="inv-chips">
                <span className="inv-chips__label">Filtros</span>
                {filtrosActivos.map((f) => {
                  const conteo =
                    f.param === 'q'
                      ? filtrados.length
                      : todos.filter((i) => String(valorDeFiltro(i, f.param) ?? '') === f.value).length;
                  return (
                    <button key={f.param} type="button" className="chip" onClick={() => setParam(f.param, '')} aria-label={`Quitar filtro ${f.label}`}>
                      {f.label}: <strong>{f.value}</strong>
                      <span className="chip__count">{conteo}</span>
                      <IconClose width={12} height={12} />
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
                <Spinner label="Cargando inventario" />
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
                emptyTitle="No hay equipos con estos filtros"
                emptyDesc="Ajusta la búsqueda o quita algún filtro para ampliar el listado."
              />
            )}
          </Card>
        </motion.div>
      </motion.div>

      <Modal open={modal?.tipo === 'crear'} onClose={() => setModal(null)} title="Nuevo equipo en inventario" subtitle="Los campos obligatorios están marcados." size="lg">
        <InventarioForm busy={busy} onCancel={() => setModal(null)} onSubmit={guardar} />
      </Modal>

      <Modal open={modal?.tipo === 'editar'} onClose={() => setModal(null)} title={tituloEditar} subtitle="Actualiza la ficha del equipo." size="lg">
        {modal?.tipo === 'editar' && <InventarioForm initial={modal.item} busy={busy} onCancel={() => setModal(null)} onSubmit={guardar} />}
      </Modal>

      <Modal
        open={modal?.tipo === 'ficha'}
        onClose={() => setModal(null)}
        title={modal?.tipo === 'ficha' ? modal.item.nombre : ''}
        subtitle={modal?.tipo === 'ficha' ? `${modal.item.codigo} · ${modal.item.marca} ${modal.item.modelo}` : ''}
      >
        {modal?.tipo === 'ficha' && <FichaEquipo item={modal.item} />}
      </Modal>

      <Toast message={toast?.message ?? null} onClose={() => setToast(null)} tone={toast?.tone ?? 'info'} />
    </>
  );
}