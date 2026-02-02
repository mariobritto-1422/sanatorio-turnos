import { z } from 'zod';
import { Rol, Genero, EstadoTurno, TipoTurno } from '@prisma/client';

// ============================================
// AUTH VALIDATORS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  rol: z.enum([Rol.PACIENTE, Rol.PROFESIONAL, Rol.RECEPCION, Rol.SUPERADMIN]),
});

// ============================================
// PACIENTE VALIDATORS
// ============================================

export const createPacienteSchema = z.object({
  dni: z.string().min(7, 'DNI inválido').max(8),
  nombre: z.string().min(2, 'Nombre muy corto'),
  apellido: z.string().min(2, 'Apellido muy corto'),
  fechaNacimiento: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  genero: z.enum([Genero.MASCULINO, Genero.FEMENINO, Genero.OTRO, Genero.NO_ESPECIFICA]),
  telefono: z.string().min(8, 'Teléfono inválido'),
  email: z.string().email('Email inválido').optional().nullable(),
  direccion: z.string().optional().nullable(),
  localidad: z.string().optional().nullable(),
  provincia: z.string().optional().nullable(),
  obraSocialId: z.string().uuid().optional().nullable(),
  numeroAfiliado: z.string().optional().nullable(),
  observacionesMedicas: z.string().optional().nullable(),
  familiarResponsableNombre: z.string().optional().nullable(),
  familiarResponsableTelefono: z.string().optional().nullable(),
  familiarResponsableRelacion: z.string().optional().nullable(),
  usuarioEmail: z.string().email().optional(), // Para crear usuario asociado
  usuarioPassword: z.string().min(8).optional(),
});

export const updatePacienteSchema = createPacienteSchema.partial().omit({
  dni: true,
});

// ============================================
// PROFESIONAL VALIDATORS
// ============================================

export const createProfesionalSchema = z.object({
  usuarioEmail: z.string().email('Email inválido'),
  usuarioPassword: z.string().min(8, 'Contraseña muy corta'),
  nombre: z.string().min(2, 'Nombre muy corto'),
  apellido: z.string().min(2, 'Apellido muy corto'),
  matricula: z.string().min(4, 'Matrícula inválida'),
  especialidad: z.string().min(3, 'Especialidad requerida'),
  telefono: z.string().min(8, 'Teléfono inválido').optional(),
  email: z.string().email('Email inválido'),
  duracionTurnoMinutos: z.number().min(15).max(120).default(30),
  colorCalendario: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  aceptaNuevosPacientes: z.boolean().default(true),
  bio: z.string().optional(),
  obrasSocialesIds: z.array(z.string().uuid()).optional(),
});

export const updateProfesionalSchema = createProfesionalSchema
  .partial()
  .omit({ usuarioEmail: true, usuarioPassword: true, matricula: true });

// ============================================
// TURNO VALIDATORS
// ============================================

export const createTurnoSchema = z.object({
  pacienteId: z.string().uuid('Paciente inválido'),
  profesionalId: z.string().uuid('Profesional inválido'),
  fechaHora: z.string().datetime('Fecha/hora inválida'),
  duracionMinutos: z.number().min(15).max(120).default(30),
  tipo: z.enum([TipoTurno.PRIMERA_VEZ, TipoTurno.CONTROL, TipoTurno.URGENCIA]).default(TipoTurno.CONTROL),
  motivoConsulta: z.string().optional(),
  obraSocialId: z.string().uuid().optional().nullable(),
});

export const updateTurnoSchema = z.object({
  fechaHora: z.string().datetime().optional(),
  estado: z.enum([
    EstadoTurno.PENDIENTE,
    EstadoTurno.CONFIRMADO,
    EstadoTurno.EN_CURSO,
    EstadoTurno.COMPLETADO,
    EstadoTurno.CANCELADO_PACIENTE,
    EstadoTurno.CANCELADO_PROFESIONAL,
    EstadoTurno.AUSENTE,
  ]).optional(),
  motivoConsulta: z.string().optional(),
  notaSimple: z.string().optional(),
  motivoCancelacion: z.string().optional(),
});

// ============================================
// OBRA SOCIAL VALIDATORS
// ============================================

export const createObraSocialSchema = z.object({
  nombre: z.string().min(2, 'Nombre muy corto'),
  codigo: z.string().optional(),
  plan: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
});

export const updateObraSocialSchema = createObraSocialSchema.partial();

// ============================================
// HORARIO VALIDATORS
// ============================================

export const createHorarioSchema = z.object({
  profesionalId: z.string().uuid(),
  diaSemana: z.number().min(0).max(6),
  horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  horaFin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

export const createBloqueoSchema = z.object({
  profesionalId: z.string().uuid(),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime(),
  motivo: z.string().optional(),
  tipo: z.enum(['VACACIONES', 'LICENCIA', 'CONGRESO', 'OTRO']),
});
