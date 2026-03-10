import prisma from '../config/database';
import { RolGuardia, TipoContrato } from '@prisma/client';

export const personalGuardiaService = {
  async getAll(sanatorioId: string, filters?: { rol?: RolGuardia; activo?: boolean }) {
    return prisma.personalGuardia.findMany({
      where: {
        sanatorioId,
        ...(filters?.rol !== undefined && { rol: filters.rol }),
        ...(filters?.activo !== undefined && { activo: filters.activo }),
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
      include: {
        usuario: { select: { id: true, email: true, estado: true } },
      },
    });
  },

  async getById(id: string) {
    const personal = await prisma.personalGuardia.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, email: true, estado: true } },
        bancoHoras: { orderBy: [{ anio: 'desc' }, { mes: 'desc' }], take: 12 },
      },
    });
    if (!personal) throw new Error('Personal no encontrado');
    return personal;
  },

  async create(data: {
    usuarioId: string;
    sanatorioId: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: RolGuardia;
    tipoContrato: TipoContrato;
    fechaIngreso: string;
    horasSemanalesContrato: number;
  }) {
    return prisma.personalGuardia.create({ data: { ...data, fechaIngreso: new Date(data.fechaIngreso) } });
  },

  async update(id: string, data: Partial<{
    nombre: string;
    apellido: string;
    tipoContrato: TipoContrato;
    horasSemanalesContrato: number;
    activo: boolean;
  }>) {
    return prisma.personalGuardia.update({ where: { id }, data });
  },

  async toggleActivo(id: string) {
    const personal = await prisma.personalGuardia.findUnique({ where: { id }, select: { activo: true } });
    if (!personal) throw new Error('Personal no encontrado');
    return prisma.personalGuardia.update({ where: { id }, data: { activo: !personal.activo } });
  },
};
