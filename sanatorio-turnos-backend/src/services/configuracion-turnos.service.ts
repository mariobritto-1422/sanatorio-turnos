import prisma from '../config/database';

export interface DefinicionTurno {
  nombre: string;
  horaInicio: string; // "HH:MM"
  horaFin: string;    // "HH:MM"
  horas: number;
}

export const configuracionTurnosService = {
  async getBySanatorio(sanatorioId: string) {
    const config = await prisma.configuracionTurnos.findUnique({ where: { sanatorioId } });
    if (!config) {
      // Retorna defaults si no existe
      return {
        sanatorioId,
        turnos: [
          { nombre: 'Mañana', horaInicio: '07:00', horaFin: '13:00', horas: 6 },
          { nombre: 'Tarde',  horaInicio: '13:00', horaFin: '19:00', horas: 6 },
          { nombre: 'Noche',  horaInicio: '19:00', horaFin: '07:00', horas: 12 },
        ] as DefinicionTurno[],
        maxDiasSeguidosSinFranco: 6,
        maxNochesSeguidasPermitidas: 3,
        diasFrancoSemanal: 2,
      };
    }
    return { ...config, turnos: config.turnos as DefinicionTurno[] };
  },

  async upsert(sanatorioId: string, data: {
    turnos: DefinicionTurno[];
    maxDiasSeguidosSinFranco?: number;
    maxNochesSeguidasPermitidas?: number;
    diasFrancoSemanal?: number;
  }) {
    return prisma.configuracionTurnos.upsert({
      where: { sanatorioId },
      create: { sanatorioId, ...data },
      update: data,
    });
  },
};
