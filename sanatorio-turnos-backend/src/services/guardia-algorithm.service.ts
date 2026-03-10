/**
 * ALGORITMO DE DISTRIBUCIÓN DE GUARDIAS
 * ======================================
 * Filosofía: sin favoritismos, sin privilegios por antigüedad.
 * Distribuye turnos, francos, fines de semana y feriados de forma
 * equitativa y transparente para todo el personal.
 *
 * PRIORIDADES (en orden):
 * 1. RESTRICCIONES DURAS — nunca se rompen
 * 2. REGLAS DE EQUIDAD — el algoritmo optimiza para minimizar diferencias
 * 3. PREFERENCIAS — aplican si no rompen equidad
 */

import prisma from '../config/database';
import { TipoGuardia, GeneradaPor } from '@prisma/client';
import { configuracionTurnosService, DefinicionTurno } from './configuracion-turnos.service';
import { feriadoService } from './feriado.service';
import { bancoHorasService } from './banco-horas.service';

interface PersonalConPuntaje {
  id: string;
  nombre: string;
  apellido: string;
  horasSemanalesContrato: number;
  findesTrabajados: number;
  feriadosTrabajados: number;
  horasExtra: number;
  // estado durante la generación (para restricciones duras)
  diasSeguidosSinFranco: number;
  nochesSeguidasActuales: number;
  horasAsignadasEnMes: number;
  ultimaFechaAsignada: Date | null;
  ultimoTurnoFueNoche: boolean;
  enVacacionesOLicencia: Set<string>; // fechas "YYYY-MM-DD"
}

interface GuardiaGenerada {
  personalId: string;
  fecha: Date;
  turnoNombre: string;
  tipo: TipoGuardia;
  horas: number;
  generadaPor: GeneradaPor;
  aprobada: boolean;
  requiereRevision: boolean;
  notas?: string;
}

export const guardiaAlgorithmService = {
  /**
   * Punto de entrada: genera la grilla completa del mes indicado.
   * Devuelve las guardias listas para insertar y un resumen de advertencias.
   */
  async generarGrillaDelMes(mes: number, anio: number, sanatorioId: string) {
    // 1. Cargar configuración del sanatorio
    const config = await configuracionTurnosService.getBySanatorio(sanatorioId);
    const turnos: DefinicionTurno[] = config.turnos;

    // 2. Cargar personal activo
    const personal = await prisma.personalGuardia.findMany({
      where: { sanatorioId, activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        horasSemanalesContrato: true,
        fechaIngreso: true,
      },
      orderBy: [{ apellido: 'asc' }],
    });

    if (personal.length === 0) {
      throw new Error('No hay personal activo para generar guardias');
    }

    // 3. Cargar feriados del mes
    const feriadosDB = await feriadoService.getFeriadosDelMes(mes, anio, sanatorioId);
    const feriadoSet = new Set(feriadosDB.map(f => f.fecha.toISOString().slice(0, 10)));

    // 4. Cargar banco de horas actual para equidad
    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anioAnterior = mes === 1 ? anio - 1 : anio;

    const bancosAnteriores = await prisma.bancoHoras.findMany({
      where: {
        personalId: { in: personal.map(p => p.id) },
        mes: mesAnterior,
        anio: anioAnterior,
      },
    });
    const bancoMap = new Map(bancosAnteriores.map(b => [b.personalId, b]));

    // 5. Cargar bloqueos (vacaciones/licencias) del mes — desde guardias ya existentes o ausencias
    // Se buscan guardias tipo VACACIONES o LICENCIA previamente cargadas para este mes
    const inicioDeMes = new Date(anio, mes - 1, 1);
    const finDeMes   = new Date(anio, mes, 0);

    const guardiasExistentes = await prisma.guardia.findMany({
      where: {
        personalId: { in: personal.map(p => p.id) },
        fecha: { gte: inicioDeMes, lte: finDeMes },
        tipo: { in: ['VACACIONES', 'LICENCIA'] },
      },
      select: { personalId: true, fecha: true },
    });

    // 6. Inicializar estado de cada persona
    const estados = new Map<string, PersonalConPuntaje>();
    for (const p of personal) {
      const banco = bancoMap.get(p.id);
      const vacaciones = new Set(
        guardiasExistentes
          .filter(g => g.personalId === p.id)
          .map(g => g.fecha.toISOString().slice(0, 10))
      );

      estados.set(p.id, {
        id: p.id,
        nombre: p.nombre,
        apellido: p.apellido,
        horasSemanalesContrato: p.horasSemanalesContrato,
        findesTrabajados: banco?.findesTrabajados ?? 0,
        feriadosTrabajados: banco?.feriadosTrabajados ?? 0,
        horasExtra: banco?.horasExtra ?? 0,
        diasSeguidosSinFranco: 0,
        nochesSeguidasActuales: 0,
        horasAsignadasEnMes: 0,
        ultimaFechaAsignada: null,
        ultimoTurnoFueNoche: false,
        enVacacionesOLicencia: vacaciones,
      });
    }

    // 7. Generar día por día, turno por turno
    const guardiasAGenerar: GuardiaGenerada[] = [];
    const advertencias: string[] = [];

    const totalDias = finDeMes.getDate();

    // Índice de asignaciones del día en curso (para evitar doble turno mismo día)
    const asignadosHoy = new Map<string, boolean>();

    for (let dia = 1; dia <= totalDias; dia++) {
      const fecha = new Date(anio, mes - 1, dia);
      const fechaStr = fecha.toISOString().slice(0, 10);
      const esFinde = fecha.getDay() === 0 || fecha.getDay() === 6;
      const esFeriado = feriadoSet.has(fechaStr);

      // Resetear asignados del día anterior
      asignadosHoy.clear();

      for (const turno of turnos) {
        const esNoche = turno.nombre.toLowerCase().includes('noche');

        // Candidatos disponibles (restricciones duras)
        const candidatos = personal.filter(p => {
          const estado = estados.get(p.id)!;

          // Dura 1: en vacaciones o licencia este día
          if (estado.enVacacionesOLicencia.has(fechaStr)) return false;

          // Dura 2: ya trabajó otro turno hoy (no se puede trabajar 2 turnos en el mismo día)
          if (asignadosHoy.get(p.id)) return false;

          // Dura 3: superó maxDiasSeguidosSinFranco
          if (estado.diasSeguidosSinFranco >= config.maxDiasSeguidosSinFranco) return false;

          // Dura 4: superó maxNochesSeguidasPermitidas
          if (esNoche && estado.nochesSeguidasActuales >= config.maxNochesSeguidasPermitidas) return false;

          // Dura 5: respetar horasSemanalesContrato (±10%)
          const horasContratoMes = (p.horasSemanalesContrato / 7) * totalDias;
          const limiteHoras = horasContratoMes * 1.1;
          if (estado.horasAsignadasEnMes + turno.horas > limiteHoras) return false;

          return true;
        });

        if (candidatos.length === 0) {
          advertencias.push(`Sin candidatos para ${fechaStr} turno ${turno.nombre} — requiere revisión manual`);

          // Marcar la guardia como REQUIERE_REVISION con el primer disponible sin restricción dura 4
          const cualquiera = personal[0];
          guardiasAGenerar.push({
            personalId: cualquiera.id,
            fecha,
            turnoNombre: turno.nombre,
            tipo: esFeriado ? TipoGuardia.FERIADO : TipoGuardia.NORMAL,
            horas: turno.horas,
            generadaPor: GeneradaPor.ALGORITMO,
            aprobada: false,
            requiereRevision: true,
            notas: 'Sin candidatos disponibles — revisar manualmente',
          });
          continue;
        }

        // Ordenar candidatos por puntaje de equidad (menor puntaje = más prioridad)
        candidatos.sort((a, b) => {
          const ea = estados.get(a.id)!;
          const eb = estados.get(b.id)!;

          // Regla equidad 1: quien trabajó menos findes este año va primero (si es finde)
          if (esFinde) {
            const diff = ea.findesTrabajados - eb.findesTrabajados;
            if (diff !== 0) return diff;
          }

          // Regla equidad 2: quien trabajó menos feriados va primero (si es feriado)
          if (esFeriado) {
            const diff = ea.feriadosTrabajados - eb.feriadosTrabajados;
            if (diff !== 0) return diff;
          }

          // Regla equidad 3: rotar noches equitativamente
          if (esNoche) {
            const diff = ea.nochesSeguidasActuales - eb.nochesSeguidasActuales;
            if (diff !== 0) return diff;
          }

          // Desempate final: quien tiene MENOS horas asignadas en este mes va primero
          // Esto garantiza distribución equitativa incluso en el primer mes (horasExtra = 0 para todos)
          return ea.horasAsignadasEnMes - eb.horasAsignadasEnMes;
        });

        const elegido = candidatos[0];
        const estadoElegido = estados.get(elegido.id)!;

        // Determinar tipo de guardia
        let tipoGuardia: TipoGuardia = TipoGuardia.NORMAL;
        if (esFeriado) tipoGuardia = TipoGuardia.FERIADO;

        guardiasAGenerar.push({
          personalId: elegido.id,
          fecha,
          turnoNombre: turno.nombre,
          tipo: tipoGuardia,
          horas: turno.horas,
          generadaPor: GeneradaPor.ALGORITMO,
          aprobada: false,
          requiereRevision: false,
        });

        // Marcar como asignado hoy (restricción dura: un turno por día por persona)
        asignadosHoy.set(elegido.id, true);

        // Actualizar estado del elegido
        estadoElegido.horasAsignadasEnMes += turno.horas;
        estadoElegido.diasSeguidosSinFranco += 1;
        estadoElegido.ultimoTurnoFueNoche = esNoche;
        estadoElegido.ultimaFechaAsignada = fecha;
        if (esNoche) {
          estadoElegido.nochesSeguidasActuales += 1;
        } else {
          estadoElegido.nochesSeguidasActuales = 0;
        }
        if (esFinde) estadoElegido.findesTrabajados += 1;
        if (esFeriado) estadoElegido.feriadosTrabajados += 1;
      }

      // Asignar francos: quienes tienen diasSeguidosSinFranco === maxDiasSeguidosSinFranco
      // y no recibieron guardia hoy → automáticamente se les asigna FRANCO
      for (const p of personal) {
        const estado = estados.get(p.id)!;
        const yaAsignado = guardiasAGenerar.some(
          g => g.personalId === p.id && g.fecha.toISOString().slice(0, 10) === fechaStr
        );

        if (!yaAsignado && !estado.enVacacionesOLicencia.has(fechaStr)) {
          // Si llegó al máximo de días seguidos → franco obligatorio
          if (estado.diasSeguidosSinFranco >= config.maxDiasSeguidosSinFranco) {
            guardiasAGenerar.push({
              personalId: p.id,
              fecha,
              turnoNombre: 'Franco',
              tipo: TipoGuardia.FRANCO,
              horas: 0,
              generadaPor: GeneradaPor.ALGORITMO,
              aprobada: true,
              requiereRevision: false,
            });
            estado.diasSeguidosSinFranco = 0;
            estado.nochesSeguidasActuales = 0;
          }
        }
      }
    }

    // 8. Persisitir en DB (eliminar grilla previa del mes si existe)
    await prisma.guardia.deleteMany({
      where: {
        personalId: { in: personal.map(p => p.id) },
        fecha: { gte: inicioDeMes, lte: finDeMes },
        tipo: { notIn: ['VACACIONES', 'LICENCIA'] }, // No tocar los ya cargados
        generadaPor: GeneradaPor.ALGORITMO,
      },
    });

    await prisma.guardia.createMany({ data: guardiasAGenerar, skipDuplicates: true });

    // 9. Recalcular banco de horas para todos
    for (const p of personal) {
      await bancoHorasService.recalcularMes(p.id, mes, anio);
    }

    return {
      guardias: guardiasAGenerar.length,
      advertencias,
      requierenRevision: guardiasAGenerar.filter(g => g.requiereRevision).length,
      personal: personal.length,
    };
  },

  /**
   * Valida si un ajuste manual rompe restricciones de equidad.
   * Retorna lista de advertencias (vacía = sin problemas).
   */
  async validarAjusteManual(guardiaId: string, nuevoPersonalId: string) {
    const guardia = await prisma.guardia.findUnique({ where: { id: guardiaId } });
    if (!guardia) throw new Error('Guardia no encontrada');

    const advertencias: string[] = [];
    const estado = await _getEstadoPersonal(nuevoPersonalId, guardia.fecha);
    const config = await configuracionTurnosService.getBySanatorio(
      (await prisma.personalGuardia.findUnique({ where: { id: nuevoPersonalId }, select: { sanatorioId: true } }))!.sanatorioId
    );

    if (estado.diasSeguidosSinFranco >= config.maxDiasSeguidosSinFranco) {
      advertencias.push(`Esta asignación supera el máximo de ${config.maxDiasSeguidosSinFranco} días seguidos sin franco`);
    }

    const esNoche = guardia.turnoNombre.toLowerCase().includes('noche');
    if (esNoche && estado.nochesSeguidasActuales >= config.maxNochesSeguidasPermitidas) {
      advertencias.push(`Esta asignación supera el máximo de ${config.maxNochesSeguidasPermitidas} noches seguidas`);
    }

    // Verificar equidad relativa (si este personal ya trabajó muchos más findes/feriados que el promedio)
    const fechaStr = guardia.fecha.toISOString().slice(0, 10);
    const esFinde = guardia.fecha.getDay() === 0 || guardia.fecha.getDay() === 6;
    const feriadosDB = await prisma.feriado.findMany({ where: { fecha: guardia.fecha } });
    const esFeriado = feriadosDB.length > 0;

    if (esFinde || esFeriado) {
      const personal = await prisma.personalGuardia.findUnique({ where: { id: nuevoPersonalId }, select: { sanatorioId: true } });
      const equidad = await bancoHorasService.getEstadisticasEquidad(personal!.sanatorioId, guardia.fecha.getFullYear());
      const metricas = equidad.personal.find(p => p.id === nuevoPersonalId);
      if (metricas) {
        if (esFinde && metricas.findesTrabajados > equidad.promedioFindesTrabajados * 1.3) {
          advertencias.push(`Este personal ya trabajó ${metricas.findesTrabajados} fines de semana (promedio: ${equidad.promedioFindesTrabajados})`);
        }
        if (esFeriado && metricas.feriadosTrabajados > equidad.promedioFeriadosTrabajados * 1.3) {
          advertencias.push(`Este personal ya trabajó ${metricas.feriadosTrabajados} feriados (promedio: ${equidad.promedioFeriadosTrabajados})`);
        }
      }
    }

    return advertencias;
  },
};

/** Helper interno: obtiene el estado actual de un empleado para una fecha */
async function _getEstadoPersonal(personalId: string, fecha: Date) {
  // Últimas 10 guardias antes de la fecha para calcular días/noches seguidos
  const ultimasGuardias = await prisma.guardia.findMany({
    where: {
      personalId,
      fecha: { lt: fecha },
      tipo: { notIn: ['FRANCO', 'VACACIONES', 'LICENCIA'] },
    },
    orderBy: { fecha: 'desc' },
    take: 10,
  });

  let diasSeguidosSinFranco = 0;
  let nochesSeguidasActuales = 0;

  // Contar días consecutivos hacia atrás desde la fecha
  const fechaRef = new Date(fecha);
  fechaRef.setDate(fechaRef.getDate() - 1);
  for (const g of ultimasGuardias) {
    const gFecha = g.fecha.toISOString().slice(0, 10);
    const refStr  = fechaRef.toISOString().slice(0, 10);
    if (gFecha === refStr) {
      diasSeguidosSinFranco++;
      if (g.turnoNombre.toLowerCase().includes('noche')) nochesSeguidasActuales++;
      fechaRef.setDate(fechaRef.getDate() - 1);
    } else {
      break;
    }
  }

  return { diasSeguidosSinFranco, nochesSeguidasActuales };
}
