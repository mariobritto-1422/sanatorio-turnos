import { PrismaClient } from '@prisma/client';
import { emailService } from './email.service';
import { whatsappService } from './whatsapp.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const prisma = new PrismaClient();

// ============================================
// SERVICIO COORDINADOR DE NOTIFICACIONES
// ============================================

interface EnviarNotificacionOptions {
  turnoId: string;
  tipo: 'CONFIRMACION_TURNO' | 'RECORDATORIO_24H' | 'RECORDATORIO_2H' | 'CANCELACION';
  fechaProgramada?: Date; // Si es null, se envía inmediatamente
}

interface DatosTurno {
  turno: any;
  paciente: any;
  profesional: any;
  obraSocial?: any;
}

class NotificacionService {
  /**
   * Crea y programa/envía una notificación
   */
  async crearNotificacion(options: EnviarNotificacionOptions): Promise<void> {
    const { turnoId, tipo, fechaProgramada } = options;

    // 1. Obtener configuración del tipo de notificación
    const config = await prisma.configuracionNotificaciones.findUnique({
      where: { tipoNotificacion: tipo },
    });

    if (!config) {
      console.warn(`⚠️  No hay configuración para el tipo: ${tipo}`);
      return;
    }

    // 2. Obtener datos del turno
    const datosTurno = await this.obtenerDatosTurno(turnoId);
    if (!datosTurno) {
      console.error(`❌ Turno no encontrado: ${turnoId}`);
      return;
    }

    // 3. Determinar canales a usar
    const canales: ('EMAIL' | 'WHATSAPP')[] = [];
    if (config.emailActivo) canales.push('EMAIL');
    if (config.whatsappActivo) canales.push('WHATSAPP');

    if (canales.length === 0) {
      console.warn(`⚠️  No hay canales activos para el tipo: ${tipo}`);
      return;
    }

    // 4. Crear notificaciones para cada canal
    for (const canal of canales) {
      await this.crearNotificacionCanal({
        datosTurno,
        tipo,
        canal,
        fechaProgramada,
        config,
      });
    }
  }

  /**
   * Crea una notificación para un canal específico
   */
  private async crearNotificacionCanal(params: {
    datosTurno: DatosTurno;
    tipo: any;
    canal: 'EMAIL' | 'WHATSAPP';
    fechaProgramada?: Date;
    config: any;
  }) {
    const { datosTurno, tipo, canal, fechaProgramada, config } = params;

    // 1. Obtener plantilla
    const plantilla = await prisma.plantillaNotificacion.findFirst({
      where: { tipo, canal, activo: true },
    });

    if (!plantilla) {
      console.warn(`⚠️  No hay plantilla activa para ${tipo} - ${canal}`);
      return;
    }

    // 2. Procesar plantilla (reemplazar variables)
    const { asunto, mensaje } = this.procesarPlantilla(
      plantilla,
      datosTurno
    );

    // 3. Determinar destinatario
    const destinatario =
      canal === 'EMAIL'
        ? datosTurno.paciente.email
        : datosTurno.paciente.telefono;

    if (!destinatario) {
      console.warn(
        `⚠️  Paciente ${datosTurno.paciente.id} no tiene ${canal === 'EMAIL' ? 'email' : 'teléfono'}`
      );
      return;
    }

    // 4. Verificar si debe enviarse ahora o programarse
    const ahora = new Date();
    const debeEnviarseAhora = !fechaProgramada || fechaProgramada <= ahora;

    // 5. Validar horario de envío (solo si se envía ahora)
    if (debeEnviarseAhora && !this.estaEnHorarioPermitido(config)) {
      console.warn(
        `⚠️  Fuera del horario de envío permitido (${config.horaInicioEnvio} - ${config.horaFinEnvio})`
      );
      // Reprogramar para el próximo horario permitido
      const proximoHorario = this.calcularProximoHorarioPermitido(config);
      await this.crearRegistroNotificacion({
        turnoId: datosTurno.turno.id,
        pacienteId: datosTurno.paciente.id,
        tipo,
        canal,
        destinatario,
        asunto,
        mensaje,
        fechaProgramada: proximoHorario,
        estado: 'PROGRAMADO',
      });
      return;
    }

    // 6. Si debe enviarse ahora, enviar
    if (debeEnviarseAhora) {
      await this.enviarAhora({
        turnoId: datosTurno.turno.id,
        pacienteId: datosTurno.paciente.id,
        tipo,
        canal,
        destinatario,
        asunto,
        mensaje,
      });
    } else {
      // 7. Si no, crear registro programado
      await this.crearRegistroNotificacion({
        turnoId: datosTurno.turno.id,
        pacienteId: datosTurno.paciente.id,
        tipo,
        canal,
        destinatario,
        asunto,
        mensaje,
        fechaProgramada,
        estado: 'PROGRAMADO',
      });
    }
  }

  /**
   * Envía una notificación inmediatamente
   */
  private async enviarAhora(params: {
    turnoId: string;
    pacienteId: string;
    tipo: any;
    canal: 'EMAIL' | 'WHATSAPP';
    destinatario: string;
    asunto?: string;
    mensaje: string;
  }) {
    const { turnoId, pacienteId, tipo, canal, destinatario, asunto, mensaje } =
      params;

    // Crear registro en BD
    const notificacion = await this.crearRegistroNotificacion({
      turnoId,
      pacienteId,
      tipo,
      canal,
      destinatario,
      asunto,
      mensaje,
      estado: 'PENDIENTE',
    });

    // Enviar según canal
    let exito = false;
    let errorMensaje: string | undefined;
    let metadata: any = undefined;

    try {
      if (canal === 'EMAIL') {
        exito = await emailService.enviarEmail({
          to: destinatario,
          subject: asunto || 'Notificación del Sanatorio',
          html: mensaje,
        });
      } else if (canal === 'WHATSAPP') {
        const resultado = await whatsappService.enviarWhatsApp({
          to: destinatario,
          mensaje,
        });
        exito = resultado.success;
        errorMensaje = resultado.error;
        metadata = { messageId: resultado.messageId };
      }
    } catch (error: any) {
      exito = false;
      errorMensaje = error.message;
    }

    // Actualizar registro
    await prisma.notificacion.update({
      where: { id: notificacion.id },
      data: {
        estado: exito ? 'ENVIADO' : 'FALLIDO',
        fechaEnvio: exito ? new Date() : null,
        errorMensaje,
        metadataEnvio: metadata,
        intentos: notificacion.intentos + 1,
      },
    });

    if (exito) {
      console.log(
        `✅ Notificación enviada: ${tipo} via ${canal} a ${destinatario}`
      );
    } else {
      console.error(
        `❌ Error al enviar notificación: ${tipo} via ${canal} - ${errorMensaje}`
      );
    }
  }

  /**
   * Crea un registro de notificación en la BD
   */
  private async crearRegistroNotificacion(params: {
    turnoId: string;
    pacienteId: string;
    tipo: any;
    canal: any;
    destinatario: string;
    asunto?: string;
    mensaje: string;
    fechaProgramada?: Date;
    estado: 'PENDIENTE' | 'PROGRAMADO';
  }) {
    return await prisma.notificacion.create({
      data: {
        turnoId: params.turnoId,
        pacienteId: params.pacienteId,
        tipo: params.tipo,
        canal: params.canal,
        destinatario: params.destinatario,
        asunto: params.asunto,
        mensaje: params.mensaje,
        fechaProgramada: params.fechaProgramada,
        estado: params.estado,
      },
    });
  }

  /**
   * Procesa una plantilla reemplazando variables
   */
  private procesarPlantilla(
    plantilla: any,
    datosTurno: DatosTurno
  ): { asunto?: string; mensaje: string } {
    const variables: Record<string, string> = {
      '{paciente}': `${datosTurno.paciente.nombre} ${datosTurno.paciente.apellido}`,
      '{profesional}': `${datosTurno.profesional.apellido}, ${datosTurno.profesional.nombre}`,
      '{especialidad}': datosTurno.profesional.especialidad,
      '{fecha}': format(new Date(datosTurno.turno.fechaHora), 'dd/MM/yyyy', {
        locale: es,
      }),
      '{hora}': format(new Date(datosTurno.turno.fechaHora), 'HH:mm'),
      '{fechaHora}': format(
        new Date(datosTurno.turno.fechaHora),
        "dd/MM/yyyy 'a las' HH:mm",
        { locale: es }
      ),
      '{obraSocial}': datosTurno.obraSocial?.nombre || 'Particular',
      '{duracion}': `${datosTurno.turno.duracionMinutos} minutos`,
    };

    let mensaje = plantilla.cuerpo;
    let asunto = plantilla.asunto;

    // Reemplazar todas las variables
    for (const [variable, valor] of Object.entries(variables)) {
      mensaje = mensaje.replace(new RegExp(variable, 'g'), valor);
      if (asunto) {
        asunto = asunto.replace(new RegExp(variable, 'g'), valor);
      }
    }

    return { asunto, mensaje };
  }

  /**
   * Obtiene los datos completos de un turno
   */
  private async obtenerDatosTurno(
    turnoId: string
  ): Promise<DatosTurno | null> {
    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: {
        paciente: true,
        profesional: true,
        obraSocial: true,
      },
    });

    if (!turno) return null;

    return {
      turno,
      paciente: turno.paciente,
      profesional: turno.profesional,
      obraSocial: turno.obraSocial,
    };
  }

  /**
   * Verifica si está dentro del horario permitido para envío
   */
  private estaEnHorarioPermitido(config: any): boolean {
    const ahora = new Date();
    const horaActual = format(ahora, 'HH:mm');

    return (
      horaActual >= config.horaInicioEnvio &&
      horaActual <= config.horaFinEnvio
    );
  }

  /**
   * Calcula el próximo horario permitido para envío
   */
  private calcularProximoHorarioPermitido(config: any): Date {
    const ahora = new Date();
    const [horaInicio, minutoInicio] = config.horaInicioEnvio
      .split(':')
      .map(Number);

    const proximoEnvio = new Date(ahora);
    proximoEnvio.setHours(horaInicio, minutoInicio, 0, 0);

    // Si ya pasó la hora de hoy, programar para mañana
    if (proximoEnvio <= ahora) {
      proximoEnvio.setDate(proximoEnvio.getDate() + 1);
    }

    return proximoEnvio;
  }

  /**
   * Procesa notificaciones programadas que deben enviarse
   */
  async procesarNotificacionesProgramadas(): Promise<void> {
    const ahora = new Date();

    // Buscar notificaciones programadas que deben enviarse
    const notificaciones = await prisma.notificacion.findMany({
      where: {
        estado: 'PROGRAMADO',
        fechaProgramada: {
          lte: ahora,
        },
      },
      take: 50, // Procesar hasta 50 por vez
    });

    console.log(
      `📬 Procesando ${notificaciones.length} notificaciones programadas`
    );

    for (const notif of notificaciones) {
      await this.enviarNotificacionProgramada(notif);
    }
  }

  /**
   * Envía una notificación programada
   */
  private async enviarNotificacionProgramada(notif: any): Promise<void> {
    let exito = false;
    let errorMensaje: string | undefined;
    let metadata: any = undefined;

    try {
      if (notif.canal === 'EMAIL') {
        exito = await emailService.enviarEmail({
          to: notif.destinatario,
          subject: notif.asunto || 'Notificación del Sanatorio',
          html: notif.mensaje,
        });
      } else if (notif.canal === 'WHATSAPP') {
        const resultado = await whatsappService.enviarWhatsApp({
          to: notif.destinatario,
          mensaje: notif.mensaje,
        });
        exito = resultado.success;
        errorMensaje = resultado.error;
        metadata = { messageId: resultado.messageId };
      }
    } catch (error: any) {
      exito = false;
      errorMensaje = error.message;
    }

    // Actualizar registro
    await prisma.notificacion.update({
      where: { id: notif.id },
      data: {
        estado: exito ? 'ENVIADO' : 'FALLIDO',
        fechaEnvio: exito ? new Date() : null,
        errorMensaje,
        metadataEnvio: metadata,
        intentos: notif.intentos + 1,
      },
    });
  }

  /**
   * Reintenta enviar notificaciones fallidas
   */
  async reintentarNotificacionesFallidas(): Promise<void> {
    const notificaciones = await prisma.notificacion.findMany({
      where: {
        estado: 'FALLIDO',
        intentos: { lt: 3 }, // Máximo 3 intentos
      },
      take: 20,
    });

    console.log(`🔄 Reintentando ${notificaciones.length} notificaciones fallidas`);

    for (const notif of notificaciones) {
      await this.enviarNotificacionProgramada(notif);
    }
  }
}

// Exportar instancia única (singleton)
export const notificacionService = new NotificacionService();
