import prisma from '../config/database';

export const bancoHorasService = {
  /**
   * Recalcula y guarda el snapshot mensual del banco de horas para un empleado.
   * Acumula findes y feriados del año completo.
   */
  async recalcularMes(personalId: string, mes: number, anio: number) {
    const personal = await prisma.personalGuardia.findUnique({
      where: { id: personalId },
      select: { horasSemanalesContrato: true },
    });
    if (!personal) throw new Error('Personal no encontrado');

    // Dias del mes
    const inicioDeMes = new Date(anio, mes - 1, 1);
    const finDeMes = new Date(anio, mes, 0);

    // Guardias del mes
    const guardias = await prisma.guardia.findMany({
      where: {
        personalId,
        fecha: { gte: inicioDeMes, lte: finDeMes },
        tipo: { notIn: ['FRANCO', 'VACACIONES', 'LICENCIA'] },
      },
    });

    const horasTrabajadas = guardias.reduce((sum, g) => sum + g.horas, 0);

    // Horas contrato del mes: semanas en el mes * horas semanales / 7 * días
    const diasEnMes = finDeMes.getDate();
    const horasContrato = (personal.horasSemanalesContrato / 7) * diasEnMes;

    const diff = horasTrabajadas - horasContrato;
    const horasExtra = diff > 0 ? diff : 0;
    const horasDeuda  = diff < 0 ? Math.abs(diff) : 0;

    // Horas por turno promedio (para calcular francos pendientes)
    const horasTurnoPromedio = guardias.length > 0
      ? guardias.reduce((s, g) => s + g.horas, 0) / guardias.length
      : 6;
    const francosPendientes = horasExtra > 0 ? horasExtra / horasTurnoPromedio : 0;

    // Finds y feriados ACUMULADOS del año (desde enero hasta el mes actual)
    const inicioAnio = new Date(anio, 0, 1);

    const guardiasAnio = await prisma.guardia.findMany({
      where: {
        personalId,
        fecha: { gte: inicioAnio, lte: finDeMes },
        tipo: { notIn: ['FRANCO', 'VACACIONES', 'LICENCIA'] },
      },
      select: { fecha: true, tipo: true },
    });

    const feriadosDB = await prisma.feriado.findMany({
      where: { fecha: { gte: inicioAnio, lte: finDeMes } },
      select: { fecha: true },
    });
    const feriadoSet = new Set(feriadosDB.map(f => f.fecha.toISOString().slice(0, 10)));

    let findesTrabajados = 0;
    let feriadosTrabajados = 0;

    for (const g of guardiasAnio) {
      const dia = g.fecha.getDay(); // 0=Dom, 6=Sáb
      if (dia === 0 || dia === 6) findesTrabajados++;
      if (feriadoSet.has(g.fecha.toISOString().slice(0, 10))) feriadosTrabajados++;
    }

    return prisma.bancoHoras.upsert({
      where: { personalId_mes_anio: { personalId, mes, anio } },
      create: {
        personalId,
        mes,
        anio,
        horasContrato: Math.round(horasContrato * 100) / 100,
        horasTrabajadas: Math.round(horasTrabajadas * 100) / 100,
        horasExtra: Math.round(horasExtra * 100) / 100,
        horasDeuda: Math.round(horasDeuda * 100) / 100,
        francosPendientes: Math.round(francosPendientes * 100) / 100,
        findesTrabajados,
        feriadosTrabajados,
      },
      update: {
        horasContrato: Math.round(horasContrato * 100) / 100,
        horasTrabajadas: Math.round(horasTrabajadas * 100) / 100,
        horasExtra: Math.round(horasExtra * 100) / 100,
        horasDeuda: Math.round(horasDeuda * 100) / 100,
        francosPendientes: Math.round(francosPendientes * 100) / 100,
        findesTrabajados,
        feriadosTrabajados,
      },
    });
  },

  async getByPersonal(personalId: string) {
    return prisma.bancoHoras.findMany({
      where: { personalId },
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    });
  },

  async getResumenMes(sanatorioId: string, mes: number, anio: number) {
    const personal = await prisma.personalGuardia.findMany({
      where: { sanatorioId, activo: true },
      select: { id: true, nombre: true, apellido: true, rol: true, horasSemanalesContrato: true },
    });

    const personalIds = personal.map(p => p.id);
    const bancos = await prisma.bancoHoras.findMany({
      where: { personalId: { in: personalIds }, mes, anio },
    });

    const bancoMap = new Map(bancos.map(b => [b.personalId, b]));

    return personal.map(p => ({
      ...p,
      banco: bancoMap.get(p.id) || null,
    }));
  },

  async getEstadisticasEquidad(sanatorioId: string, anio: number) {
    const personal = await prisma.personalGuardia.findMany({
      where: { sanatorioId, activo: true },
      select: { id: true, nombre: true, apellido: true, rol: true },
    });

    const personalIds = personal.map(p => p.id);

    // Tomamos el último mes disponible del año para los acumulados
    const bancos = await prisma.bancoHoras.findMany({
      where: {
        personalId: { in: personalIds },
        anio,
      },
      orderBy: { mes: 'desc' },
    });

    // Para cada persona tomamos el registro de mayor mes (acumulados más recientes)
    const bancoMap = new Map<string, typeof bancos[0]>();
    for (const b of bancos) {
      if (!bancoMap.has(b.personalId)) bancoMap.set(b.personalId, b);
    }

    const resultado = personal.map(p => {
      const banco = bancoMap.get(p.id);
      return {
        ...p,
        findesTrabajados: banco?.findesTrabajados ?? 0,
        feriadosTrabajados: banco?.feriadosTrabajados ?? 0,
        horasExtra: banco?.horasExtra ?? 0,
        horasDeuda: banco?.horasDeuda ?? 0,
        francosPendientes: banco?.francosPendientes ?? 0,
      };
    });

    // Promedios para mostrar en el panel
    const promedioFindes = resultado.reduce((s, r) => s + r.findesTrabajados, 0) / resultado.length;
    const promedioFeriados = resultado.reduce((s, r) => s + r.feriadosTrabajados, 0) / resultado.length;

    return {
      personal: resultado,
      promedioFindesTrabajados: Math.round(promedioFindes * 10) / 10,
      promedioFeriadosTrabajados: Math.round(promedioFeriados * 10) / 10,
    };
  },
};
