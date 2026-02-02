import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { hashPassword } from '../utils/password';

export const profesionalService = {
  async getAll(activos = true) {
    const where: Prisma.ProfesionalWhereInput = activos
      ? { estado: 'ACTIVO' }
      : {};

    const profesionales = await prisma.profesional.findMany({
      where,
      orderBy: { apellido: 'asc' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        matricula: true,
        especialidad: true,
        telefono: true,
        email: true,
        duracionTurnoMinutos: true,
        colorCalendario: true,
        aceptaNuevosPacientes: true,
        bio: true,
        estado: true,
        obrasSociales: {
          select: {
            obraSocial: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    return profesionales.map((prof) => ({
      ...prof,
      obrasSociales: prof.obrasSociales.map((os) => os.obraSocial),
    }));
  },

  async getById(id: string) {
    const profesional = await prisma.profesional.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, email: true, estado: true } },
        obrasSociales: {
          select: {
            obraSocial: true,
          },
        },
        horarios: {
          where: { estado: 'ACTIVO' },
          orderBy: { diaSemana: 'asc' },
        },
      },
    });

    if (!profesional) {
      throw new Error('Profesional no encontrado');
    }

    return {
      ...profesional,
      obrasSociales: profesional.obrasSociales.map((os) => os.obraSocial),
    };
  },

  async create(data: any) {
    // Crear usuario primero
    const usuario = await prisma.usuario.create({
      data: {
        email: data.usuarioEmail,
        passwordHash: await hashPassword(data.usuarioPassword),
        rol: 'PROFESIONAL',
      },
    });

    // Crear profesional
    const profesional = await prisma.profesional.create({
      data: {
        usuarioId: usuario.id,
        nombre: data.nombre,
        apellido: data.apellido,
        matricula: data.matricula,
        especialidad: data.especialidad,
        telefono: data.telefono,
        email: data.email,
        duracionTurnoMinutos: data.duracionTurnoMinutos || 30,
        colorCalendario: data.colorCalendario,
        aceptaNuevosPacientes: data.aceptaNuevosPacientes ?? true,
        bio: data.bio,
        ...(data.obrasSocialesIds && {
          obrasSociales: {
            create: data.obrasSocialesIds.map((osId: string) => ({
              obraSocialId: osId,
            })),
          },
        }),
      },
      include: {
        usuario: { select: { id: true, email: true } },
        obrasSociales: {
          select: { obraSocial: true },
        },
      },
    });

    return {
      ...profesional,
      obrasSociales: profesional.obrasSociales.map((os) => os.obraSocial),
    };
  },

  async update(id: string, data: any) {
    const updateData: any = {
      ...(data.nombre && { nombre: data.nombre }),
      ...(data.apellido && { apellido: data.apellido }),
      ...(data.especialidad && { especialidad: data.especialidad }),
      ...(data.telefono !== undefined && { telefono: data.telefono }),
      ...(data.email && { email: data.email }),
      ...(data.duracionTurnoMinutos && { duracionTurnoMinutos: data.duracionTurnoMinutos }),
      ...(data.colorCalendario !== undefined && { colorCalendario: data.colorCalendario }),
      ...(data.aceptaNuevosPacientes !== undefined && { aceptaNuevosPacientes: data.aceptaNuevosPacientes }),
      ...(data.bio !== undefined && { bio: data.bio }),
    };

    // Si se actualizan obras sociales, primero eliminar las existentes
    if (data.obrasSocialesIds) {
      await prisma.profesionalObraSocial.deleteMany({
        where: { profesionalId: id },
      });

      updateData.obrasSociales = {
        create: data.obrasSocialesIds.map((osId: string) => ({
          obraSocialId: osId,
        })),
      };
    }

    const profesional = await prisma.profesional.update({
      where: { id },
      data: updateData,
      include: {
        obrasSociales: {
          select: { obraSocial: true },
        },
      },
    });

    return {
      ...profesional,
      obrasSociales: profesional.obrasSociales.map((os) => os.obraSocial),
    };
  },

  async delete(id: string) {
    // Soft delete
    await prisma.profesional.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });

    return { message: 'Profesional desactivado correctamente' };
  },

  async getHorarios(profesionalId: string) {
    const horarios = await prisma.horarioProfesional.findMany({
      where: {
        profesionalId,
        estado: 'ACTIVO',
      },
      orderBy: { diaSemana: 'asc' },
    });

    return horarios;
  },

  async createHorario(data: any) {
    const horario = await prisma.horarioProfesional.create({
      data: {
        profesionalId: data.profesionalId,
        diaSemana: data.diaSemana,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
      },
    });

    return horario;
  },

  async deleteHorario(id: string) {
    await prisma.horarioProfesional.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });

    return { message: 'Horario eliminado correctamente' };
  },
};
