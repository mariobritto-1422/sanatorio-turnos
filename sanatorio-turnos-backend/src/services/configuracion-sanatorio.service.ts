import prisma from '../config/database';

export const configuracionSanatorioService = {
  async getOrCreate(sanatorioId: string) {
    const config = await prisma.configuracionSanatorio.findUnique({
      where: { sanatorioId },
    });

    if (config) return config;

    // Si no existe, crear con valores por defecto
    return prisma.configuracionSanatorio.create({
      data: { sanatorioId },
    });
  },

  async upsert(sanatorioId: string, data: {
    horarioApertura?: string;
    horarioCierre?: string;
    diasAtencion?: string;
    duracionTurnoDefaultMin?: number;
    telefonoContacto?: string;
    emailContacto?: string;
  }) {
    return prisma.configuracionSanatorio.upsert({
      where: { sanatorioId },
      create: { sanatorioId, ...data },
      update: data,
    });
  },
};
