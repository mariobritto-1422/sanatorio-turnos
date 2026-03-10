import prisma from '../config/database';
import { configuracionTurnosService } from './configuracion-turnos.service';

export const solicitudCanjeService = {
  async solicitar(data: {
    solicitanteId: string;
    receptorId: string;
    guardiaOfrecidaId: string;
    guardiaDeseadaId: string;
    motivo?: string;
  }) {
    const [solicitante, receptor, guardiaOfrecida, guardiaDeseada] = await Promise.all([
      prisma.personalGuardia.findUnique({ where: { id: data.solicitanteId } }),
      prisma.personalGuardia.findUnique({ where: { id: data.receptorId } }),
      prisma.guardia.findUnique({ where: { id: data.guardiaOfrecidaId } }),
      prisma.guardia.findUnique({ where: { id: data.guardiaDeseadaId } }),
    ]);

    if (!solicitante || !receptor) throw new Error('Personal no encontrado');
    if (!guardiaOfrecida || !guardiaDeseada) throw new Error('Guardia no encontrada');

    // Validación 1: mismo rol
    if (solicitante.rol !== receptor.rol) {
      throw new Error('Solo se pueden hacer canjes entre personal del mismo rol (enfermero con enfermero, mucama con mucama)');
    }

    // Validación 2: mismo sanatorio
    if (solicitante.sanatorioId !== receptor.sanatorioId) {
      throw new Error('Ambas guardias deben pertenecer al mismo sanatorio');
    }

    // Validación 3: no son fechas pasadas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (guardiaOfrecida.fecha < hoy || guardiaDeseada.fecha < hoy) {
      throw new Error('No se pueden canjear guardias de fechas pasadas');
    }

    // Validación 4: las guardias corresponden a cada persona
    if (guardiaOfrecida.personalId !== data.solicitanteId) {
      throw new Error('La guardia ofrecida no pertenece al solicitante');
    }
    if (guardiaDeseada.personalId !== data.receptorId) {
      throw new Error('La guardia deseada no pertenece al receptor');
    }

    const config = await configuracionTurnosService.getBySanatorio(solicitante.sanatorioId);

    // Validación 5: simular el canje y verificar restricciones duras para ambos
    await _verificarRestriccionesCanje(
      data.solicitanteId,
      guardiaDeseada.fecha,
      guardiaOfrecida.fecha,
      config.maxDiasSeguidosSinFranco,
      config.maxNochesSeguidasPermitidas,
    );
    await _verificarRestriccionesCanje(
      data.receptorId,
      guardiaOfrecida.fecha,
      guardiaDeseada.fecha,
      config.maxDiasSeguidosSinFranco,
      config.maxNochesSeguidasPermitidas,
    );

    return prisma.solicitudCanje.create({ data });
  },

  async aprobar(id: string, aprobadoPorId: string) {
    const canje = await prisma.solicitudCanje.findUnique({
      where: { id },
      include: { guardiaOfrecida: true, guardiaDeseada: true },
    });
    if (!canje) throw new Error('Canje no encontrado');
    if (canje.estado !== 'PENDIENTE') throw new Error('Este canje ya fue procesado');

    // Ejecutar el intercambio en una transacción
    await prisma.$transaction([
      prisma.guardia.update({
        where: { id: canje.guardiaOfrecidaId },
        data: { personalId: canje.receptorId, generadaPor: 'CANJE' },
      }),
      prisma.guardia.update({
        where: { id: canje.guardiaDeseadaId },
        data: { personalId: canje.solicitanteId, generadaPor: 'CANJE' },
      }),
      prisma.solicitudCanje.update({
        where: { id },
        data: { estado: 'APROBADO', aprobadoPorId },
      }),
    ]);

    return prisma.solicitudCanje.findUnique({
      where: { id },
      include: {
        solicitante: { select: { nombre: true, apellido: true } },
        receptor:    { select: { nombre: true, apellido: true } },
      },
    });
  },

  async rechazar(id: string, aprobadoPorId: string, motivoRechazo?: string) {
    const canje = await prisma.solicitudCanje.findUnique({ where: { id } });
    if (!canje) throw new Error('Canje no encontrado');
    if (canje.estado !== 'PENDIENTE') throw new Error('Este canje ya fue procesado');

    return prisma.solicitudCanje.update({
      where: { id },
      data: { estado: 'RECHAZADO', aprobadoPorId, motivoRechazo },
    });
  },

  async getPendientes(sanatorioId: string) {
    const personalIds = (
      await prisma.personalGuardia.findMany({
        where: { sanatorioId },
        select: { id: true },
      })
    ).map(p => p.id);

    return prisma.solicitudCanje.findMany({
      where: {
        estado: 'PENDIENTE',
        solicitanteId: { in: personalIds },
      },
      include: {
        solicitante:    { select: { nombre: true, apellido: true, rol: true } },
        receptor:       { select: { nombre: true, apellido: true, rol: true } },
        guardiaOfrecida: true,
        guardiaDeseada:  true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getHistorial(personalId: string) {
    return prisma.solicitudCanje.findMany({
      where: {
        OR: [{ solicitanteId: personalId }, { receptorId: personalId }],
      },
      include: {
        solicitante:    { select: { nombre: true, apellido: true } },
        receptor:       { select: { nombre: true, apellido: true } },
        guardiaOfrecida: true,
        guardiaDeseada:  true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};

/**
 * Verifica que asignarle la nuevaFecha a un empleado (quitándole la fechaQuitada)
 * no rompa las restricciones duras de días/noches seguidos.
 */
async function _verificarRestriccionesCanje(
  personalId: string,
  nuevaFecha: Date,
  fechaQuitada: Date,
  maxDias: number,
  maxNoches: number,
) {
  // Guardias del mes de nuevaFecha, excluyendo la fechaQuitada
  const inicio = new Date(nuevaFecha.getFullYear(), nuevaFecha.getMonth(), 1);
  const fin    = new Date(nuevaFecha.getFullYear(), nuevaFecha.getMonth() + 1, 0);

  const guardiasDelMes = await prisma.guardia.findMany({
    where: {
      personalId,
      fecha: { gte: inicio, lte: fin },
      tipo: { notIn: ['FRANCO', 'VACACIONES', 'LICENCIA'] },
    },
    orderBy: { fecha: 'asc' },
  });

  // Simular: agregar nuevaFecha, quitar fechaQuitada
  const fechaQuitadaStr = fechaQuitada.toISOString().slice(0, 10);
  const guardiasSimuladas = guardiasDelMes
    .filter(g => g.fecha.toISOString().slice(0, 10) !== fechaQuitadaStr)
    .map(g => ({ fecha: g.fecha, esNoche: g.turnoNombre.toLowerCase().includes('noche') }));

  guardiasSimuladas.push({ fecha: nuevaFecha, esNoche: false });
  guardiasSimuladas.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  // Verificar días consecutivos máximos
  let maxConsecutivos = 0;
  let consecutivos = 1;
  for (let i = 1; i < guardiasSimuladas.length; i++) {
    const diff = (guardiasSimuladas[i].fecha.getTime() - guardiasSimuladas[i - 1].fecha.getTime()) / 86400000;
    if (diff === 1) {
      consecutivos++;
      maxConsecutivos = Math.max(maxConsecutivos, consecutivos);
    } else {
      consecutivos = 1;
    }
  }

  if (maxConsecutivos > maxDias) {
    throw new Error(`El canje provocaría ${maxConsecutivos} días seguidos sin franco (máximo: ${maxDias})`);
  }
}
