export const ROLES = {
  PACIENTE: 'PACIENTE',
  PROFESIONAL: 'PROFESIONAL',
  RECEPCION: 'RECEPCION',
  SUPERADMIN: 'SUPERADMIN',
} as const;

export const ESTADOS_TURNO = {
  PENDIENTE: 'PENDIENTE',
  CONFIRMADO: 'CONFIRMADO',
  EN_CURSO: 'EN_CURSO',
  COMPLETADO: 'COMPLETADO',
  CANCELADO_PACIENTE: 'CANCELADO_PACIENTE',
  CANCELADO_PROFESIONAL: 'CANCELADO_PROFESIONAL',
  AUSENTE: 'AUSENTE',
} as const;

export const PERMISOS = {
  [ROLES.PACIENTE]: {
    turnos: ['crear_propio', 'leer_propio', 'cancelar_propio'],
    profesionales: ['listar'],
    pacientes: ['leer_propio', 'actualizar_propio'],
  },
  [ROLES.PROFESIONAL]: {
    turnos: ['leer_propios', 'actualizar_propios', 'cancelar_propios'],
    pacientes: ['leer_todos_basicos'], // Solo datos básicos de todos los pacientes
    profesionales: ['leer_propio', 'actualizar_propio'],
    horarios: ['gestionar_propios'],
    obrasSociales: ['listar'],
  },
  [ROLES.RECEPCION]: {
    turnos: ['crear', 'leer', 'actualizar', 'cancelar'],
    pacientes: ['crear', 'leer', 'actualizar'],
    profesionales: ['leer', 'listar'],
    obrasSociales: ['crear', 'leer', 'actualizar', 'eliminar'],
  },
  [ROLES.SUPERADMIN]: {
    all: ['*'],
  },
} as const;

export const HORARIOS_DEFAULT = {
  DURACION_TURNO_MINUTOS: 30,
  ANTICIPACION_MAXIMA_DIAS: 60,
  CANCELACION_MIN_HORAS: 24,
  RECORDATORIO_HORAS_ANTES: 24,
};
