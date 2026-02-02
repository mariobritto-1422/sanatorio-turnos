import cron from 'node-cron';
import { notificacionService } from '../services/notificacion.service';

// ============================================
// CRON JOBS PARA NOTIFICACIONES
// ============================================

/**
 * Inicializa todos los cron jobs del sistema de notificaciones
 */
export function inicializarCronJobs() {
  console.log('📅 Iniciando cron jobs de notificaciones...');

  // ============================================
  // JOB 1: Procesar notificaciones programadas
  // Cada 5 minutos
  // ============================================
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔔 [CRON] Procesando notificaciones programadas...');
      await notificacionService.procesarNotificacionesProgramadas();
    } catch (error) {
      console.error('❌ [CRON] Error al procesar notificaciones:', error);
    }
  });

  // ============================================
  // JOB 2: Reintentar notificaciones fallidas
  // Cada hora
  // ============================================
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔄 [CRON] Reintentando notificaciones fallidas...');
      await notificacionService.reintentarNotificacionesFallidas();
    } catch (error) {
      console.error('❌ [CRON] Error al reintentar notificaciones:', error);
    }
  });

  console.log('✅ Cron jobs iniciados:');
  console.log('   - Procesar notificaciones programadas: cada 5 minutos');
  console.log('   - Reintentar notificaciones fallidas: cada hora');
}
