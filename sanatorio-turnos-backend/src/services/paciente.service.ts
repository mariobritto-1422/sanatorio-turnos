import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { hashPassword } from '../utils/password';

export const pacienteService = {
  async getAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.PacienteWhereInput = search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido: { contains: search, mode: 'insensitive' } },
            { dni: { contains: search } },
          ],
          estado: 'ACTIVO',
        }
      : { estado: 'ACTIVO' };

    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { apellido: 'asc' },
        select: {
          id: true,
          dni: true,
          nombre: true,
          apellido: true,
          fechaNacimiento: true,
          genero: true,
          telefono: true,
          email: true,
          obraSocial: { select: { id: true, nombre: true } },
          numeroAfiliado: true,
          estado: true,
          createdAt: true,
        },
      }),
      prisma.paciente.count({ where }),
    ]);

    return {
      pacientes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, email: true, estado: true } },
        obraSocial: true,
      },
    });

    if (!paciente) {
      throw new Error('Paciente no encontrado');
    }

    return paciente;
  },

  async getByDni(dni: string) {
    const paciente = await prisma.paciente.findUnique({
      where: { dni },
      include: {
        obraSocial: { select: { id: true, nombre: true } },
      },
    });

    if (!paciente) {
      throw new Error('Paciente no encontrado');
    }

    return paciente;
  },

  async create(data: any) {
    // Si se proporciona email y password, crear usuario
    let usuarioId: string | undefined;

    if (data.usuarioEmail && data.usuarioPassword) {
      const usuario = await prisma.usuario.create({
        data: {
          email: data.usuarioEmail,
          passwordHash: await hashPassword(data.usuarioPassword),
          rol: 'PACIENTE',
        },
      });
      usuarioId = usuario.id;
    }

    const paciente = await prisma.paciente.create({
      data: {
        usuarioId,
        dni: data.dni,
        nombre: data.nombre,
        apellido: data.apellido,
        fechaNacimiento: new Date(data.fechaNacimiento),
        genero: data.genero,
        telefono: data.telefono,
        email: data.email,
        direccion: data.direccion,
        localidad: data.localidad,
        provincia: data.provincia,
        obraSocialId: data.obraSocialId,
        numeroAfiliado: data.numeroAfiliado,
        observacionesMedicas: data.observacionesMedicas,
        familiarResponsableNombre: data.familiarResponsableNombre,
        familiarResponsableTelefono: data.familiarResponsableTelefono,
        familiarResponsableRelacion: data.familiarResponsableRelacion,
      },
      include: {
        obraSocial: { select: { id: true, nombre: true } },
        usuario: { select: { id: true, email: true } },
      },
    });

    return paciente;
  },

  async update(id: string, data: any) {
    const updateData: Prisma.PacienteUpdateInput = {
      ...(data.nombre && { nombre: data.nombre }),
      ...(data.apellido && { apellido: data.apellido }),
      ...(data.fechaNacimiento && { fechaNacimiento: new Date(data.fechaNacimiento) }),
      ...(data.genero && { genero: data.genero }),
      ...(data.telefono && { telefono: data.telefono }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.direccion !== undefined && { direccion: data.direccion }),
      ...(data.localidad !== undefined && { localidad: data.localidad }),
      ...(data.provincia !== undefined && { provincia: data.provincia }),
      ...(data.obraSocialId !== undefined && { obraSocialId: data.obraSocialId }),
      ...(data.numeroAfiliado !== undefined && { numeroAfiliado: data.numeroAfiliado }),
      ...(data.observacionesMedicas !== undefined && { observacionesMedicas: data.observacionesMedicas }),
      ...(data.familiarResponsableNombre !== undefined && { familiarResponsableNombre: data.familiarResponsableNombre }),
      ...(data.familiarResponsableTelefono !== undefined && { familiarResponsableTelefono: data.familiarResponsableTelefono }),
      ...(data.familiarResponsableRelacion !== undefined && { familiarResponsableRelacion: data.familiarResponsableRelacion }),
    };

    const paciente = await prisma.paciente.update({
      where: { id },
      data: updateData,
      include: {
        obraSocial: { select: { id: true, nombre: true } },
      },
    });

    return paciente;
  },

  async delete(id: string) {
    // Soft delete
    await prisma.paciente.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });

    return { message: 'Paciente desactivado correctamente' };
  },
};
