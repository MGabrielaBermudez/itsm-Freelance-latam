/**
 * Tipos de dominio del panel ITSM.
 */

export type Id = string;

export type EstadoEquipo = 'asignado' | 'en-resguardo' | 'en-stock';

export type EstadoInventario =
  | 'en-stock'
  | 'en-resguardo'
  | 'asignado'
  | 'en-mantenimiento'
  | 'en-transito';

export type TipoMovimientoInventario =
  | 'entrada'
  | 'salida'
  | 'traslado'
  | 'asignacion'
  | 'devolucion'
  | 'mantenimiento';

export interface MovimientoInventario {
  id: Id;
  fecha: string;
  tipo: TipoMovimientoInventario;
  desde: string | null;
  hacia: string;
  usuario: string;
  nota?: string;
}

export interface InventarioItem {
  id: Id;
  codigo: string;
  nombre: string;
  categoria: string;
  marca: string;
  modelo: string;
  serial: string;
  estado: EstadoInventario;
  ubicacion: string;
  pais: string;
  almacen: string;
  responsableId: Id | null;
  enTransito: boolean;
  fechaUltimoMovimiento: string;
  diasEnUbicacion: number;
  valor: number;
  historial: MovimientoInventario[];
}

export interface ResumenInventario {
  total: number;
  disponibles: number;
  enResguardo: number;
  asignados: number;
  enMantenimiento: number;
  valorTotal: number;
  porCategoria: Array<{ categoria: string; unidades: number; valor: number }>;
  porPais: Array<{ pais: string; unidades: number; valor: number }>;
  porUbicacion: Array<{ ubicacion: string; unidades: number; valor: number }>;
}

export interface InventarioInput {
  nombre: string;
  categoria: string;
  marca: string;
  modelo: string;
  serial: string;
  estado: EstadoInventario;
  ubicacion: string;
  pais: string;
  almacen: string;
  valor: number;
}

export type PrioridadIncidente = 'critica' | 'alta' | 'media' | 'baja';

export type EstadoAsignacion = 'activa' | 'pausada' | 'finalizada';

export type EstadoIncidente = 'abierto' | 'en-curso' | 'resuelto' | 'cerrado';

export type EstadoOnboarding = 'pendiente' | 'en-curso' | 'completado';

export type TipoActividad =
  | 'asignacion'
  | 'incidente'
  | 'onboarding'
  | 'devolucion';

export type Severity = 'success' | 'warning' | 'danger' | 'accent' | 'navy' | 'neutral';

export interface Equipo {
  id: Id;
  nombre: string;
  tipo: string;
  marca: string;
  modelo: string;
  serial: string;
  estado: EstadoEquipo;
  ubicacion: string;
  responsableId: Id | null;
  freelancerId: Id | null;
  fechaUltimoMovimiento: string;
  diasEnStock: number;
  valor: number;
}

export interface Freelancer {
  id: Id;
  nombre: string;
  email: string;
  especialidad: string;
  nivel: 'junior' | 'mid' | 'senior';
  estado: 'activo' | 'pausado' | 'inactivo';
  tarifaHora: number;
  asignacionesActivas: number;
  equiposAsignados: number;
  valoracion: number;
  disponibilidad: number;
  alta: string;
}

export interface Asignacion {
  id: Id;
  codigo: string;
  equipoIds: Id[];
  freelancerId: Id;
  proyecto: string;
  estado: EstadoAsignacion;
  inicio: string;
  finPrevista: string;
  progreso: number;
  valorMensual: number;
}

export interface Incidente {
  id: Id;
  codigo: string;
  titulo: string;
  prioridad: PrioridadIncidente;
  estado: EstadoIncidente;
  equipoId: Id;
  asignadoA: Id | null;
  creado: string;
  actualizado: string;
  slaHoras: number;
  descripcion: string;
}

export interface OnboardingStep {
  id: Id;
  titulo: string;
  detalle: string;
  completada: boolean;
}

export interface Onboarding {
  id: Id;
  freelancerId: Id;
  puesto: string;
  estado: EstadoOnboarding;
  inicio: string;
  pasosCompletados: number;
  pasosTotales: number;
  mentorId: Id | null;
  pasos: OnboardingStep[];
}

export interface Actividad {
  id: Id;
  tipo: TipoActividad;
  titulo: string;
  detalle: string;
  usuario: string;
  timestamp: string;
  href: string;
}

export interface SerieTemporal {
  puntos: number[];
  etiquetas: string[];
}

export interface ResumenKpi {
  clave: KpiKey;
  valor: number;
  anterior: number;
  serie: number[];
  desglose: KpiBreakdownItem[];
}

export interface KpiBreakdownItem {
  id: Id;
  nombre: string;
  valor: number;
  color: string;
  secundario?: string;
}

export type KpiKey =
  | 'equipos'
  | 'freelancers'
  | 'asignaciones'
  | 'incidentes'
  | 'onboarding'
  | 'stock';

export interface EstadoOperativo {
  enStock: number;
  asignado: number;
  enResguardo: number;
  total: number;
}

export interface DistribucionEstado {
  estado: EstadoEquipo;
  valor: number;
}

export interface IncidentesPorPrioridad {
  prioridad: PrioridadIncidente;
  valor: number;
}

export interface IncidentesSerie {
  prioridad: PrioridadIncidente;
  puntos: number[];
  etiquetas: string[];
}

/** Punto de la tendencia diaria de incidentes (Abiertos vs Resueltos). */
export interface TendenciaDia {
  /** Fecha ISO (yyyy-mm-dd) para el enlace de filtrado. */
  fecha: string;
  /** Fin del rango cuando el punto agrupa varios días (opcional). */
  fechaFin?: string;
  /** Etiqueta corta para el eje X. */
  etiqueta: string;
  abiertos: number;
  resueltos: number;
}

/** Ticket pendiente de atención (bandeja de entrada). */
export interface TicketPendiente {
  id: Id;
  codigo: string;
  titulo: string;
  prioridad: PrioridadIncidente;
  estado: EstadoIncidente;
  fecha: string;
  href: string;
}

export type Periodo = 7 | 30 | 90;

export interface Notificacion {
  id: Id;
  titulo: string;
  detalle: string;
  tiempo: string;
  leida: boolean;
  tono: Severity;
}

export interface DashboardData {
  kpis: ResumenKpi[];
  estados: DistribucionEstado[];
  operativo: EstadoOperativo;
  incidentesPorPrioridad: IncidentesPorPrioridad[];
  incidentesSerie: IncidentesSerie[];
  /** Tendencia diaria de los últimos 90 días (se recorta por periodo en la UI). */
  tendencia: TendenciaDia[];
  /** Bandeja de tickets pendientes; puede venir vacía. */
  ticketsPendientes: TicketPendiente[];
  actividad: Actividad[];
}

export interface PageMeta {
  titulo: string;
  descripcion: string;
}

export interface ApiFailMode {
  activo: boolean;
  recursos: Set<string>;
}

/* =============================================================
   Autenticación
   ============================================================= */

/** Roles soportados por el sistema. */
export type Role = 'admin' | 'tecnico' | 'lector';

/** Acciones que se pueden restringir por rol. */
export type Permission = 'create' | 'edit' | 'delete' | 'refresh' | 'manage';

export interface User {
  id: Id;
  nombre: string;
  email: string;
  cargo: string;
  role: Role;
}

export interface Session {
  token: string;
  user: User;
  /** Marca de tiempo de emisión (epoch ms). */
  issuedAt: number;
  /** Caducidad simulada (epoch ms). */
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  /** Persistir en localStorage en lugar de sessionStorage. */
  remember: boolean;
}

export type AuthErrorCode = 'invalid_credentials' | 'account_disabled' | 'network';

/** Cuenta de demostración que ofrece el servicio mock. */
export interface DemoAccount {
  role: Role;
  roleLabel: string;
  email: string;
  /** Solo en el mock; en una API real nunca viaja al cliente. */
  password: string;
  nombre: string | null;
  cargo: string | null;
  disabled?: boolean;
}