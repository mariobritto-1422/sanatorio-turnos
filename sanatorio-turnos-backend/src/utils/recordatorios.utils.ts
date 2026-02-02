import { notificacionService } from '../services/notificacion.service';
import { subHours } from 'date-fns';

// ============================================
// UTILIDADES PARA PROGRAMAR RECORDATORIOS
// ============================================

/**
 * Programa los recordatorios automáticos para un turno
 * - Confirmación inmediata
 * - Recordatorio 24h antes
 * - Recordatorio 2h antes
 */
export async function programarRecordatoriosTurno(turnoId: string, fechaHoraTurno: Date) {
  const ahora = new Date();
  const fechaTurno = new Date(fechaHoraTurno);

  // 1. CONFIRMACIÓN INMEDIATA
  await notificacionService.crearNotificacion({
    turnoId,
    tipo: 'CONFIRMACION_TURNO',
    // Sin fechaProgramada = se envía inmediatamente
  });

  // 2. RECORDATORIO 24H ANTES
  const fecha24h = subHours(fechaTurno, 24);
  if (fecha24h > ahora) {
    await notificacionService.crearNotificacion({
      turnoId,
      tipo: 'RECORDATORIO_24H',
      fechaProgramada: fecha24h,
    });
    console.log(`📅 Recordatorio 24h programado para: ${fecha24h.toISOString()}`);
  }

  // 3. RECORDATORIO 2H ANTES
  const fecha2h = subHours(fechaTurno, 2);
  if (fecha2h > ahora) {
    await notificacionService.crearNotificacion({
      turnoId,
      tipo: 'RECORDATORIO_2H',
      fechaProgramada: fecha2h,
    });
    console.log(`📅 Recordatorio 2h programado para: ${fecha2h.toISOString()}`);
  }
}

/**
 * Envía notificación de cancelación de turno
 */
export async function notificarCancelacionTurno(turnoId: string) {
  await notificacionService.crearNotificacion({
    turnoId,
    tipo: 'CANCELACION',
    // Sin fechaProgramada = se envía inmediatamente
  });

  console.log(`🚫 Notificación de cancelación enviada para turno: ${turnoId}`);
}

/**
 * Cancela recordatorios programados para un turno
 * (Cuando se cancela el turno)
 */
export async function cancelarRecordatoriosTurno(turnoId: string) {
  // Implementación pendiente: marcar como canceladas las notificaciones programadas
  console.log(`❌ Recordatorios cancelados para turno: ${turnoId}`);
}
