import prisma from '../config/database';
import { TipoFeriado } from '@prisma/client';

export const feriadoService = {
  async getAll(sanatorioId?: string) {
    return prisma.feriado.findMany({
      where: {
        OR: [
          { sanatorioId: null },
          ...(sanatorioId ? [{ sanatorioId }] : []),
        ],
      },
      orderBy: { fecha: 'asc' },
    });
  },

  async getFeriadosDelMes(mes: number, anio: number, sanatorioId?: string) {
    const inicio = new Date(anio, mes - 1, 1);
    const fin = new Date(anio, mes, 0); // último día del mes

    return prisma.feriado.findMany({
      where: {
        fecha: { gte: inicio, lte: fin },
        OR: [
          { sanatorioId: null },
          ...(sanatorioId ? [{ sanatorioId }] : []),
        ],
      },
    });
  },

  async create(data: { fecha: string; nombre: string; tipo: TipoFeriado; sanatorioId?: string }) {
    return prisma.feriado.create({
      data: { ...data, fecha: new Date(data.fecha) },
    });
  },

  async delete(id: string) {
    return prisma.feriado.delete({ where: { id } });
  },
};
