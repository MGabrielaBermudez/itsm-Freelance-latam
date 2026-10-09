import type { Actividad, Asignacion, Equipo, Freelancer, Incidente, Onboarding, PageMeta } from '@/models';

const BASE_DATE = '2025-10-01T00:00:00.000Z';

export function addDays(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function subDays(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function round(value: number): number {
  return Math.round(value);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/* ---------------- Equipos ---------------- */

export const equiposMock: Equipo[] = [
  {
    id: 'eq-001',
    nombre: 'MacBook Pro 16',
    tipo: 'Portátil',
    marca: 'Apple',
    modelo: 'M3 Max',
    serial: 'MBP001',
    estado: 'asignado',
    ubicacion: 'Bilbao',
    responsableId: 'fr-001',
    freelancerId: 'fr-001',
    fechaUltimoMovimiento: subDays(BASE_DATE, 1),
    diasEnStock: 0,
    valor: 2800,
  },
  {
    id: 'eq-002',
    nombre: 'ThinkPad X1',
    tipo: 'Portátil',
    marca: 'Lenovo',
    modelo: 'X1 Gen 11',
    serial: 'TPX002',
    estado: 'asignado',
    ubicacion: 'Madrid',
    responsableId: 'fr-002',
    freelancerId: 'fr-002',
    fechaUltimoMovimiento: subDays(BASE_DATE, 3),
    diasEnStock: 0,
    valor: 1800,
  },
  {
    id: 'eq-003',
    nombre: 'Monitor UltraWide',
    tipo: 'Monitor',
    marca: 'LG',
    modelo: '34GP83',
    serial: 'LG003',
    estado: 'en-resguardo',
    ubicacion: 'Almacén Norte',
    responsableId: null,
    freelancerId: null,
    fechaUltimoMovimiento: subDays(BASE_DATE, 12),
    diasEnStock: 12,
    valor: 800,
  },
  {
    id: 'eq-004',
    nombre: 'Dell Precision 7760',
    tipo: 'Workstation',
    marca: 'Dell',
    modelo: '7760',
    serial: 'DP004',
    estado: 'en-stock',
    ubicacion: 'Almacén Central',
    responsableId: null,
    freelancerId: null,
    fechaUltimoMovimiento: subDays(BASE_DATE, 20),
    diasEnStock: 20,
    valor: 3200,
  },
  {
    id: 'eq-005',
    nombre: 'iPad Pro 12.9',
    tipo: 'Tablet',
    marca: 'Apple',
    modelo: 'M2',
    serial: 'IPD005',
    estado: 'en-stock',
    ubicacion: 'Almacén Central',
    responsableId: null,
    freelancerId: null,
    fechaUltimoMovimiento: subDays(BASE_DATE, 8),
    diasEnStock: 8,
    valor: 1150,
  },
  {
    id: 'eq-006',
    nombre: 'Docking Station TB4',
    tipo: 'Accesorio',
    marca: 'CalDigit',
    modelo: 'TS4',
    serial: 'CDK006',
    estado: 'en-stock',
    ubicacion: 'Almacén Norte',
    responsableId: null,
    freelancerId: null,
    fechaUltimoMovimiento: subDays(BASE_DATE, 5),
    diasEnStock: 5,
    valor: 420,
  },
];

/* ---------------- Freelancers ---------------- */

export const freelancersMock: Freelancer[] = [
  {
    id: 'fr-001',
    nombre: 'Ana Martín',
    email: 'ana.martin@itsm.test',
    especialidad: 'Frontend',
    nivel: 'senior',
    estado: 'activo',
    tarifaHora: 48,
    asignacionesActivas: 2,
    equiposAsignados: 2,
    valoracion: 4.9,
    disponibilidad: 85,
    alta: subDays(BASE_DATE, 90),
  },
  {
    id: 'fr-002',
    nombre: 'Javier Ochoa',
    email: 'javier.ochoa@itsm.test',
    especialidad: 'Backend',
    nivel: 'senior',
    estado: 'activo',
    tarifaHora: 46,
    asignacionesActivas: 1,
    equiposAsignados: 1,
    valoracion: 4.8,
    disponibilidad: 90,
    alta: subDays(BASE_DATE, 120),
  },
  {
    id: 'fr-003',
    nombre: 'Lucía Fernández',
    email: 'lucia.fernandez@itsm.test',
    especialidad: 'QA',
    nivel: 'mid',
    estado: 'activo',
    tarifaHora: 32,
    asignacionesActivas: 1,
    equiposAsignados: 0,
    valoracion: 4.7,
    disponibilidad: 95,
    alta: subDays(BASE_DATE, 60),
  },
  {
    id: 'fr-004',
    nombre: 'Iñaki Ruiz',
    email: 'inaki.ruiz@itsm.test',
    especialidad: 'DevOps',
    nivel: 'senior',
    estado: 'pausado',
    tarifaHora: 52,
    asignacionesActivas: 0,
    equiposAsignados: 0,
    valoracion: 4.9,
    disponibilidad: 40,
    alta: subDays(BASE_DATE, 150),
  },
  {
    id: 'fr-005',
    nombre: 'Sara Vega',
    email: 'sara.vega@itsm.test',
    especialidad: 'UX/UI',
    nivel: 'mid',
    estado: 'activo',
    tarifaHora: 38,
    asignacionesActivas: 0,
    equiposAsignados: 0,
    valoracion: 4.8,
    disponibilidad: 100,
    alta: subDays(BASE_DATE, 45),
  },
];

/* ---------------- Asignaciones ---------------- */

export const asignacionesMock: Asignacion[] = [
  {
    id: 'as-001',
    codigo: 'AS-001',
    equipoIds: ['eq-001'],
    freelancerId: 'fr-001',
    proyecto: 'Plataforma Web',
    estado: 'activa',
    inicio: subDays(BASE_DATE, 30),
    finPrevista: addDays(BASE_DATE, 60),
    progreso: 62,
    valorMensual: 7200,
  },
  {
    id: 'as-002',
    codigo: 'AS-002',
    equipoIds: ['eq-002'],
    freelancerId: 'fr-002',
    proyecto: 'API Core',
    estado: 'activa',
    inicio: subDays(BASE_DATE, 45),
    finPrevista: addDays(BASE_DATE, 45),
    progreso: 55,
    valorMensual: 6400,
  },
  {
    id: 'as-003',
    codigo: 'AS-003',
    equipoIds: [],
    freelancerId: 'fr-003',
    proyecto: 'Testing E2E',
    estado: 'activa',
    inicio: subDays(BASE_DATE, 14),
    finPrevista: addDays(BASE_DATE, 30),
    progreso: 38,
    valorMensual: 2800,
  },
  {
    id: 'as-004',
    codigo: 'AS-004',
    equipoIds: [],
    freelancerId: 'fr-004',
    proyecto: 'Formación Interna',
    estado: 'pausada',
    inicio: subDays(BASE_DATE, 7),
    finPrevista: addDays(BASE_DATE, 7),
    progreso: 24,
    valorMensual: 1500,
  },
  {
    id: 'as-005',
    codigo: 'AS-005',
    equipoIds: [],
    freelancerId: 'fr-005',
    proyecto: 'Rediseño UX',
    estado: 'finalizada',
    inicio: subDays(BASE_DATE, 75),
    finPrevista: subDays(BASE_DATE, 15),
    progreso: 100,
    valorMensual: 3200,
  },
];

/* ---------------- Incidentes ---------------- */

export const incidentesMock: Incidente[] = [
  {
    id: 'inc-001',
    codigo: 'INC-001',
    titulo: 'Pantalla parpadea',
    prioridad: 'media',
    estado: 'abierto',
    equipoId: 'eq-001',
    asignadoA: 'fr-001',
    creado: subDays(BASE_DATE, 1),
    actualizado: subDays(BASE_DATE, 0.5),
    slaHoras: 6,
    descripcion: 'Parpadeo intermitente al ajustar el brillo en Office.',
  },
  {
    id: 'inc-002',
    codigo: 'INC-002',
    titulo: 'Wi-Fi inestable',
    prioridad: 'alta',
    estado: 'en-curso',
    equipoId: 'eq-002',
    asignadoA: 'fr-002',
    creado: subDays(BASE_DATE, 2),
    actualizado: subDays(BASE_DATE, 0.25),
    slaHoras: 4,
    descripcion: 'Caídas de conectividad recurrentes en la sede de Madrid.',
  },
  {
    id: 'inc-003',
    codigo: 'INC-003',
    titulo: 'Overheating',
    prioridad: 'critica',
    estado: 'abierto',
    equipoId: 'eq-004',
    asignadoA: null,
    creado: subDays(BASE_DATE, 0.5),
    actualizado: subDays(BASE_DATE, 0.2),
    slaHoras: 2,
    descripcion: 'Temperaturas elevadas bajo carga sostenida.',
  },
  {
    id: 'inc-004',
    codigo: 'INC-004',
    titulo: 'Bluetooth no detecta periféricos',
    prioridad: 'baja',
    estado: 'resuelto',
    equipoId: 'eq-005',
    asignadoA: 'fr-003',
    creado: subDays(BASE_DATE, 5),
    actualizado: subDays(BASE_DATE, 1),
    slaHoras: 8,
    descripcion: 'Resuelto actualizando controladores.',
  },
  {
    id: 'inc-005',
    codigo: 'INC-005',
    titulo: 'Puerto USB-C no carga',
    prioridad: 'media',
    estado: 'cerrado',
    equipoId: 'eq-006',
    asignadoA: 'fr-003',
    creado: subDays(BASE_DATE, 10),
    actualizado: subDays(BASE_DATE, 3),
    slaHoras: 6,
    descripcion: 'Cerrado tras cambiar el cable de prueba.',
  },
];

/* ---------------- Onboarding ---------------- */

export const onboardingMock: Onboarding[] = [
  {
    id: 'on-001',
    freelancerId: 'fr-005',
    puesto: 'UX/UI',
    estado: 'en-curso',
    inicio: subDays(BASE_DATE, 14),
    pasosCompletados: 4,
    pasosTotales: 6,
    mentorId: 'fr-001',
    pasos: [
      { id: 'on1s1', titulo: 'Bienvenida y RRHH', detalle: 'Documentación firmada', completada: true },
      { id: 'on1s2', titulo: 'Herramientas', detalle: 'Accesos a Figma y Slack', completada: true },
      { id: 'on1s3', titulo: 'Seguridad', detalle: 'Políticas y MFA', completada: true },
      { id: 'on1s4', titulo: 'Dominio del producto', detalle: 'Design System', completada: true },
      { id: 'on1s5', titulo: 'Onboarding técnico', detalle: 'Flujos críticos', completada: false },
      { id: 'on1s6', titulo: 'Revisión final', detalle: 'Checklist con mentor', completada: false },
    ],
  },
  {
    id: 'on-002',
    freelancerId: 'fr-003',
    puesto: 'QA',
    estado: 'pendiente',
    inicio: subDays(BASE_DATE, 2),
    pasosCompletados: 1,
    pasosTotales: 5,
    mentorId: 'fr-002',
    pasos: [
      { id: 'on2s1', titulo: 'RRHH', detalle: 'Contratación', completada: true },
      { id: 'on2s2', titulo: 'Accesos', detalle: 'Git y CI', completada: false },
      { id: 'on2s3', titulo: 'Suite de tests', detalle: 'E2E con Playwright', completada: false },
      { id: 'on2s4', titulo: 'Ambientes', detalle: 'Staging', completada: false },
      { id: 'on2s5', titulo: 'Validación', detalle: 'Smoke test', completada: false },
    ],
  },
  {
    id: 'on-003',
    freelancerId: 'fr-001',
    puesto: 'Senior Frontend',
    estado: 'completado',
    inicio: subDays(BASE_DATE, 40),
    pasosCompletados: 6,
    pasosTotales: 6,
    mentorId: null,
    pasos: [
      { id: 'on3s1', titulo: 'Inducción', detalle: 'Cultura y procesos', completada: true },
      { id: 'on3s2', titulo: 'Accesos', detalle: 'Repos y entornos', completada: true },
      { id: 'on3s3', titulo: 'Arquitectura', detalle: 'Mapa del sistema', completada: true },
      { id: 'on3s4', titulo: 'Buenas prácticas', detalle: 'Guías de estilo', completada: true },
      { id: 'on3s5', titulo: 'Code review', detalle: 'Flujo de revisiones', completada: true },
      { id: 'on3s6', titulo: 'Cierre', detalle: 'Checklist firmado', completada: true },
    ],
  },
];

/* ---------------- Actividad ---------------- */

export const actividadMock: Actividad[] = [
  {
    id: 'a-001',
    tipo: 'incidente',
    titulo: 'Incidente <em>INC-003</em> abierto (Crítico)',
    detalle: 'Overheating · SLA 2 h',
    usuario: 'Helpdesk',
    timestamp: subDays(BASE_DATE, 0.12),
    href: '/incidentes/inc-003',
  },
  {
    id: 'a-002',
    tipo: 'onboarding',
    titulo: 'Onboarding <em>Sara Vega</em> en curso',
    detalle: '4/6 pasos completados · mentor Ana Martín',
    usuario: 'RRHH',
    timestamp: subDays(BASE_DATE, 0.2),
    href: '/onboarding/on-001',
  },
  {
    id: 'a-003',
    tipo: 'incidente',
    titulo: 'Incidente <em>INC-002</em> en curso',
    detalle: 'Wi-Fi inestable · prioridad Alta',
    usuario: 'Javier Ochoa',
    timestamp: subDays(BASE_DATE, 0.4),
    href: '/incidentes/inc-002',
  },
  {
    id: 'a-004',
    tipo: 'incidente',
    titulo: 'Incidente <em>INC-001</em> abierto',
    detalle: 'Pantalla parpadea · prioridad Media',
    usuario: 'Helpdesk',
    timestamp: subDays(BASE_DATE, 0.8),
    href: '/incidentes/inc-001',
  },
  {
    id: 'a-005',
    tipo: 'asignacion',
    titulo: 'Equipo <em>MacBook Pro 16</em> asignado a <em>Ana Martín</em>',
    detalle: 'Proyecto Plataforma Web · AS-001',
    usuario: 'Ops',
    timestamp: subDays(BASE_DATE, 1),
    href: '/asignaciones/as-001',
  },
  {
    id: 'a-006',
    tipo: 'onboarding',
    titulo: 'Onboarding <em>Lucía Fernández</em> pendiente',
    detalle: '1/5 pasos completados',
    usuario: 'RRHH',
    timestamp: subDays(BASE_DATE, 1.5),
    href: '/onboarding/on-002',
  },
  {
    id: 'a-007',
    tipo: 'devolucion',
    titulo: 'Equipo <em>Monitor UltraWide</em> devuelto a resguardo',
    detalle: 'Asignado → En resguardo',
    usuario: 'Logística',
    timestamp: subDays(BASE_DATE, 3),
    href: '/equipos/eq-003',
  },
  {
    id: 'a-008',
    tipo: 'asignacion',
    titulo: 'Asignación <em>AS-002</em> activada',
    detalle: 'ThinkPad X1 → Javier Ochoa',
    usuario: 'Ops',
    timestamp: subDays(BASE_DATE, 2),
    href: '/asignaciones/as-001',
  },
  {
    id: 'a-009',
    tipo: 'incidente',
    titulo: 'Incidente <em>INC-004</em> resuelto',
    detalle: 'Bluetooth OK · prioridad Baja',
    usuario: 'Lucía Fernández',
    timestamp: subDays(BASE_DATE, 2.5),
    href: '/incidentes/inc-004',
  },
  {
    id: 'a-010',
    tipo: 'asignacion',
    titulo: 'Asignación <em>AS-003</em> activada',
    detalle: 'Testing E2E · Lucía Fernández',
    usuario: 'Ops',
    timestamp: subDays(BASE_DATE, 4),
    href: '/asignaciones/as-001',
  },
];

/* ---------------- Metadatos de página ---------------- */

const PAGE_META: Record<string, PageMeta> = {
  '/': {
    titulo: 'Dashboard',
    descripcion: 'Vista general del inventario IT',
  },
  '/equipos': {
    titulo: 'Equipos',
    descripcion: 'Inventario de hardware con estados, responsables y tiempo en stock.',
  },
  '/freelancers': {
    titulo: 'Freelancers',
    descripcion: 'Talento activo, disponibilidad, especialidades y valoraciones.',
  },
  '/asignaciones': {
    titulo: 'Asignaciones',
    descripcion: 'Seguimiento de entregas, progreso y valor mensual.',
  },
  '/incidentes': {
    titulo: 'Incidentes',
    descripcion: 'Gestión por prioridad y estado con enfoque en SLA.',
  },
  '/onboarding': {
    titulo: 'Onboarding',
    descripcion: 'Seguimiento de pasos, mentor y estado de incorporación.',
  },
  '/stock': {
    titulo: 'Stock',
    descripcion: 'Equipos sin asignar, antigüedad y rotación.',
  },
  '/inventario': {
    titulo: 'Inventario',
    descripcion: 'Catálogo de hardware con estados, ubicaciones y valor total.',
  },
  '/inventario/resguardo': {
    titulo: 'En resguardo',
    descripcion: 'Equipos en custodia por ubicación y almacén.',
  },
  '/inventario/dashboard': {
    titulo: 'Panel de inventario',
    descripcion: 'Indicadores clave, composición y rotación del activo.',
  },
};

export function getPageMeta(pathname: string): PageMeta {
  return PAGE_META[pathname] ?? PAGE_META['/'] as PageMeta;
}