import prisma from '../config/database';
import { Prisma, EstadoTurno } from '@prisma/client';

export const turnoService = {
  async getAll(filters?: {
    profesionalId?: string;
    pacienteId?: string;
    desde?: string;
    hasta?: string;
    estado?: EstadoTurno;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.TurnoWhereInput = {
      ...(filters?.profesionalId && { profesionalId: filters.profesionalId }),
      ...(filters?.pacienteId && { pacienteId: filters.pacienteId }),
      ...(filters?.estado && { estado: filters.estado }),
      ...(filters?.desde || filters?.hasta
        ? {
            fechaHora: {
              ...(filters.desde && { gte: new Date(filters.desde) }),
              ...(filters.hasta && { lte: new Date(filters.hasta) }),
            },
          }
        : {}),
    };

    const [turnos, total] = await Promise.all([
      prisma.turno.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaHora: 'asc' },
        include: {
          paciente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              dni: true,
              telefono: true,
              obraSocial: { select: { id: true, nombre: true } },
            },
          },
          profesional: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              especialidad: true,
            },
          },
          obraSocial: { select: { id: true, nombre: true } },
        },
      }),
      prisma.turno.count({ where }),
    ]);

    return {
      turnos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const turno = await prisma.turno.findUnique({
      where: { id },
      include: {
        paciente: {
          select: {
            id: true,
            dni: true,
            nombre: true,
            apellido: true,
            fechaNacimiento: true,
            telefono: true,
            email: true,
            obraSocial: { select: { id: true, nombre: true } },
            numeroAfiliado: true,
            observacionesMedicas: true,
          },
        },
        profesional: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            matricula: true,
            especialidad: true,
            telefono: true,
            email: true,
          },
        },
        obraSocial: true,
        usuarioCreadoPor: {
          select: { id: true, email: true, rol: true },
        },
      },
    });

    if (!turno) {
      throw new Error('Turno no encontrado');
    }

    return turno;
  },

  async create(data: any, creadoPor: string) {
    // Verificar que la fecha/hora esté disponible
    const fechaHora = new Date(data.fechaHora);
    const duracionMinutos = data.duracionMinutos || 30;

    const conflicto = await prisma.turno.findFirst({
      where: {
        profesionalId: data.profesionalId,
        fechaHora: {
          gte: new Date(fechaHora.getTime() - duracionMinutos * 60 * 1000),
          lt: new Date(fechaHora.getTime() + duracionMinutos * 60 * 1000),
        },
        estado: {
          notIn: ['CANCELADO_PACIENTE', 'CANCELADO_PROFESIONAL'],
        },
      },
    });

    if (conflicto) {
      throw new Error('Ya existe un turno en ese horario');
    }

    const turno = await prisma.turno.create({
      data: {
        pacienteId: data.pacienteId,
        profesionalId: data.profesionalId,
        fechaHora,
        duracionMinutos,
        tipo: data.tipo || 'CONTROL',
        motivoConsulta: data.motivoConsulta,
        obraSocialId: data.obraSocialId,
        creadoPor,
      },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            telefono: true,
            email: true,
          },
        },
        profesional: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true,
          },
        },
        obraSocial: { select: { id: true, nombre: true } },
      },
    });

    return turno;
  },

  async update(id: string, data: any, usuarioId?: string) {
    const updateData: Prisma.TurnoUpdateInput = {
      ...(data.fechaHora && { fechaHora: new Date(data.fechaHora) }),
      ...(data.estado && { estado: data.estado }),
      ...(data.motivoConsulta !== undefined && { motivoConsulta: data.motivoConsulta }),
      ...(data.notaSimple !== undefined && { notaSimple: data.notaSimple }),
      ...(data.motivoCancelacion && {
        motivoCancelacion: data.motivoCancelacion,
        canceladoPor: usuarioId,
        canceladoEn: new Date(),
      }),
    };

    const turno = await prisma.turno.update({
      where: { id },
      data: updateData,
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            telefono: true,
          },
        },
        profesional: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true,
          },
        },
      },
    });

    return turno;
  },

  async cancel(id: string, motivo: string, canceladoPor: string, rol: string) {
    const estado =
      rol === 'PACIENTE'
        ? EstadoTurno.CANCELADO_PACIENTE
        : EstadoTurno.CANCELADO_PROFESIONAL;

    const turno = await prisma.turno.update({
      where: { id },
      data: {
        estado,
        motivoCancelacion: motivo,
        canceladoPor,
        canceladoEn: new Date(),
      },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            telefono: true,
            email: true,
          },
        },
        profesional: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return turno;
  },

  async getDisponibilidad(profesionalId: string, fecha: string) {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);

    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    // Obtener configuración de horarios del profesional para ese día
    const diaSemana = fechaInicio.getDay();
    const horarios = await prisma.horarioProfesional.findMany({
      where: {
        profesionalId,
        diaSemana,
        estado: 'ACTIVO',
      },
    });

    if (horarios.length === 0) {
      return { disponibles: [], mensaje: 'El profesional no trabaja este día' };
    }

    // Obtener profesional para duración de turno
    const profesional = await prisma.profesional.findUnique({
      where: { id: profesionalId },
      select: { duracionTurnoMinutos: true },
    });

    const duracionMinutos = profesional?.duracionTurnoMinutos || 30;

    // Obtener turnos existentes
    const turnosExistentes = await prisma.turno.findMany({
      where: {
        profesionalId,
        fechaHora: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: {
          notIn: ['CANCELADO_PACIENTE', 'CANCELADO_PROFESIONAL'],
        },
      },
      select: { fechaHora: true, duracionMinutos: true },
    });

    // Generar slots disponibles
    const slotsDisponibles: string[] = [];

    for (const horario of horarios) {
      const [horaInicioH, horaInicioM] = horario.horaInicio.split(':').map(Number);
      const [horaFinH, horaFinM] = horario.horaFin.split(':').map(Number);

      let horaActual = new Date(fechaInicio);
      horaActual.setHours(horaInicioH, horaInicioM, 0, 0);

      const horaLimite = new Date(fechaInicio);
      horaLimite.setHours(horaFinH, horaFinM, 0, 0);

      while (horaActual < horaLimite) {
        // Verificar si no hay conflicto
        const hayConflicto = turnosExistentes.some((turno) => {
          const turnoInicio = new Date(turno.fechaHora);
          const turnoFin = new Date(
            turno.fechaHora.getTime() + turno.duracionMinutos * 60 * 1000
          );
          const slotFin = new Date(horaActual.getTime() + duracionMinutos * 60 * 1000);

          return (
            (horaActual >= turnoInicio && horaActual < turnoFin) ||
            (slotFin > turnoInicio && slotFin <= turnoFin)
          );
        });

        if (!hayConflicto) {
          slotsDisponibles.push(horaActual.toISOString());
        }

        horaActual = new Date(horaActual.getTime() + duracionMinutos * 60 * 1000);
      }
    }

    return { disponibles: slotsDisponibles };
  },
};
