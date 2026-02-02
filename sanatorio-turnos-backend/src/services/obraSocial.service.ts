import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export const obraSocialService = {
  async getAll(activas = true) {
    const where: Prisma.ObraSocialWhereInput = activas
      ? { estado: 'ACTIVO' }
      : {};

    const obrasSociales = await prisma.obraSocial.findMany({
      where,
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        plan: true,
        telefono: true,
        email: true,
        estado: true,
        createdAt: true,
      },
    });

    return obrasSociales;
  },

  async getById(id: string) {
    const obraSocial = await prisma.obraSocial.findUnique({
      where: { id },
      include: {
        profesionales: {
          select: {
            profesional: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                especialidad: true,
              },
            },
          },
        },
        _count: {
          select: {
            pacientes: true,
            turnos: true,
          },
        },
      },
    });

    if (!obraSocial) {
      throw new Error('Obra social no encontrada');
    }

    return {
      ...obraSocial,
      profesionales: obraSocial.profesionales.map((p) => p.profesional),
    };
  },

  async create(data: any) {
    const obraSocial = await prisma.obraSocial.create({
      data: {
        nombre: data.nombre,
        codigo: data.codigo,
        plan: data.plan,
        telefono: data.telefono,
        email: data.email,
      },
    });

    return obraSocial;
  },

  async update(id: string, data: any) {
    const updateData: Prisma.ObraSocialUpdateInput = {
      ...(data.nombre && { nombre: data.nombre }),
      ...(data.codigo !== undefined && { codigo: data.codigo }),
      ...(data.plan !== undefined && { plan: data.plan }),
      ...(data.telefono !== undefined && { telefono: data.telefono }),
      ...(data.email !== undefined && { email: data.email }),
    };

    const obraSocial = await prisma.obraSocial.update({
      where: { id },
      data: updateData,
    });

    return obraSocial;
  },

  async delete(id: string) {
    // Verificar si tiene pacientes o turnos asociados
    const count = await prisma.obraSocial.findUnique({
      where: { id },
      select: {
        _count: {
          select: { pacientes: true, turnos: true },
        },
      },
    });

    if (count && (count._count.pacientes > 0 || count._count.turnos > 0)) {
      // Soft delete
      await prisma.obraSocial.update({
        where: { id },
        data: { estado: 'INACTIVO' },
      });
      return { message: 'Obra social desactivada (tiene registros asociados)' };
    }

    // Hard delete si no tiene registros
    await prisma.obraSocial.delete({
      where: { id },
    });

    return { message: 'Obra social eliminada correctamente' };
  },
};
