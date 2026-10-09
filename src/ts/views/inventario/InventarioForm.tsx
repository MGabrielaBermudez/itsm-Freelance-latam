import { useState, type FormEvent } from 'react';
import type { EstadoInventario, InventarioInput, InventarioItem } from '@/models';
import { ESTADO_INVENTARIO_OPTIONS } from './inventarioUi';

interface InventarioFormProps {
  initial?: InventarioItem;
  busy?: boolean;
  onSubmit: (input: InventarioInput) => void;
  onCancel: () => void;
}

export const CATEGORIAS = ['Portátil', 'Workstation', 'Monitor', 'Tablet', 'Periférico', 'Accesorio', 'Red'];
export const PAISES = ['España', 'Panamá', 'México', 'Colombia'];
export const UBICACIONES = ['Almacén Central', 'Almacén Norte', 'Oficina Madrid', 'Oficina Bilbao', 'En tránsito'];

export function InventarioForm({ initial, busy = false, onSubmit, onCancel }: InventarioFormProps) {
  const [form, setForm] = useState<InventarioInput>(() => ({
    nombre: initial?.nombre ?? '',
    categoria: initial?.categoria ?? CATEGORIAS[0]!,
    marca: initial?.marca ?? '',
    modelo: initial?.modelo ?? '',
    serial: initial?.serial ?? '',
    estado: (initial?.estado ?? 'en-stock') as EstadoInventario,
    ubicacion: initial?.ubicacion ?? UBICACIONES[0]!,
    pais: initial?.pais ?? PAISES[0]!,
    almacen: initial?.almacen ?? 'Almacén Central',
    valor: initial?.valor ?? 0,
  }));

  const set = <K extends keyof InventarioInput>(key: K, value: InventarioInput[K]): void =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="inv-form" onSubmit={submit}>
      <div className="inv-form__grid">
        <label className="inv-form__field inv-form__field--wide">
          <span className="inv-form__label">Nombre</span>
          <input
            required
            className="inv-input"
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="MacBook Pro 16"
          />
        </label>

        <label className="inv-form__field">
          <span className="inv-form__label">Categoría</span>
          <select className="select" value={form.categoria} onChange={(e) => set('categoria', e.target.value)}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="inv-form__field">
          <span className="inv-form__label">Estado</span>
          <select className="select" value={form.estado} onChange={(e) => set('estado', e.target.value as EstadoInventario)}>
            {ESTADO_INVENTARIO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="inv-form__field">
          <span className="inv-form__label">Marca</span>
          <input required className="inv-input" value={form.marca} onChange={(e) => set('marca', e.target.value)} placeholder="Apple" />
        </label>

        <label className="inv-form__field">
          <span className="inv-form__label">Modelo</span>
          <input required className="inv-input" value={form.modelo} onChange={(e) => set('modelo', e.target.value)} placeholder="M3 Max" />
        </label>

        <label className="inv-form__field">
          <span className="inv-form__label">N.º de serie</span>
          <input required className="inv-input mono" value={form.serial} onChange={(e) => set('serial', e.target.value)} placeholder="INV-000" />
        </label>

        <label className="inv-form__field">
          <span className="inv-form__label">País</span>
          <select className="select" value={form.pais} onChange={(e) => set('pais', e.target.value)}>
            {PAISES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="inv-form__field">
          <span className="inv-form__label">Ubicación</span>
          <select className="select" value={form.ubicacion} onChange={(e) => set('ubicacion', e.target.value)}>
            {UBICACIONES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>

        <label className="inv-form__field">
          <span className="inv-form__label">Almacén</span>
          <input className="inv-input" value={form.almacen} onChange={(e) => set('almacen', e.target.value)} placeholder="Almacén Central" />
        </label>

        <label className="inv-form__field">
          <span className="inv-form__label">Valor (EUR)</span>
          <input
            required
            type="number"
            min={0}
            step={10}
            className="inv-input text-tabular"
            value={form.valor || ''}
            onChange={(e) => set('valor', Number(e.target.value))}
            placeholder="1200"
          />
        </label>
      </div>

      {!!initial && (
        <p className="inv-form__hint">
          La actualización registra un movimiento de traslado en el historial del equipo.
        </p>
      )}

      <div className="inv-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear equipo'}
        </button>
      </div>
    </form>
  );
}