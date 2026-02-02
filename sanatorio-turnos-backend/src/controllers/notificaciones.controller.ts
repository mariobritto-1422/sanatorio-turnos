import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { emailService } from '../services/email.service';
import { whatsappService } from '../services/whatsapp.service';

const prisma = new PrismaClient();

// ============================================
// VALIDACIONES ZOD
// ============================================

const PlantillaSchema = z.object({
  tipo: z.enum(['CONFIRMACION_TURNO', 'RECORDATORIO_24H', 'RECORDATORIO_2H', 'CANCELACION']),
  canal: z.enum(['EMAIL', 'WHATSAPP', 'SMS']),
  asunto: z.string().optional(),
  cuerpo: z.string().min(1),
  activo: z.boolean().optional(),
});

const ConfiguracionSchema = z.object({
  tipoNotificacion: z.enum(['CONFIRMACION_TURNO', 'RECORDATORIO_24H', 'RECORDATORIO_2H', 'CANCELACION']),
  emailActivo: z.boolean(),
  whatsappActivo: z.boolean(),
  smsActivo: z.boolean(),
  horaInicioEnvio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  horaFinEnvio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

// ============================================
// PLANTILLAS
// ============================================

export async function obtenerPlantillas(req: Request, res: Response) {
  try {
    const plantillas = await prisma.plantillaNotificacion.findMany({
      orderBy: [{ tipo: 'asc' }, { canal: 'asc' }],
    });

    res.json(plantillas);
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    res.status(500).json({ error: 'Error al obtener plantillas' });
  }
}

export async function obtenerPlantilla(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const plantilla = await prisma.plantillaNotificacion.findUnique({
      where: { id },
    });

    if (!plantilla) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    res.json(plantilla);
  } catch (error) {
    console.error('Error al obtener plantilla:', error);
    res.status(500).json({ error: 'Error al obtener plantilla' });
  }
}

export async function crearPlantilla(req: Request, res: Response) {
  try {
    const datos = PlantillaSchema.parse(req.body);

    const plantilla = await prisma.plantillaNotificacion.create({
      data: {
        tipo: datos.tipo,
        canal: datos.canal,
        asunto: datos.asunto,
        cuerpo: datos.cuerpo,
        activo: datos.activo ?? true,
        variables: [
          '{paciente}',
          '{profesional}',
          '{especialidad}',
          '{fecha}',
          '{hora}',
          '{fechaHora}',
          '{obraSocial}',
          '{duracion}',
        ],
      },
    });

    res.status(201).json(plantilla);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: error.errors });
    }
    console.error('Error al crear plantilla:', error);
    res.status(500).json({ error: 'Error al crear plantilla' });
  }
}

export async function actualizarPlantilla(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const datos = PlantillaSchema.partial().parse(req.body);

    const plantilla = await prisma.plantillaNotificacion.update({
      where: { id },
      data: datos,
    });

    res.json(plantilla);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: error.errors });
    }
    console.error('Error al actualizar plantilla:', error);
    res.status(500).json({ error: 'Error al actualizar plantilla' });
  }
}

export async function eliminarPlantilla(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.plantillaNotificacion.delete({
      where: { id },
    });

    res.json({ mensaje: 'Plantilla eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar plantilla:', error);
    res.status(500).json({ error: 'Error al eliminar plantilla' });
  }
}

// ============================================
// CONFIGURACIÓN
// ============================================

export async function obtenerConfiguraciones(req: Request, res: Response) {
  try {
    const configuraciones = await prisma.configuracionNotificaciones.findMany({
      orderBy: { tipoNotificacion: 'asc' },
    });

    res.json(configuraciones);
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    res.status(500).json({ error: 'Error al obtener configuraciones' });
  }
}

export async function actualizarConfiguracion(req: Request, res: Response) {
  try {
    const { tipo } = req.params;
    const datos = ConfiguracionSchema.parse(req.body);

    const config = await prisma.configuracionNotificaciones.upsert({
      where: { tipoNotificacion: datos.tipoNotificacion },
      update: datos,
      create: datos,
    });

    res.json(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: error.errors });
    }
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
}

// ============================================
// LOG DE NOTIFICACIONES
// ============================================

export async function obtenerLogNotificaciones(req: Request, res: Response) {
  try {
    const { turnoId, pacienteId, estado, tipo, limit = '50', offset = '0' } = req.query;

    const where: any = {};
    if (turnoId) where.turnoId = turnoId;
    if (pacienteId) where.pacienteId = pacienteId;
    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;

    const [notificaciones, total] = await Promise.all([
      prisma.notificacion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.notificacion.count({ where }),
    ]);

    res.json({
      notificaciones,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Error al obtener log de notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener log de notificaciones' });
  }
}

export async function obtenerEstadisticasNotificaciones(req: Request, res: Response) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const where: any = {};
    if (fechaInicio || fechaFin) {
      where.createdAt = {};
      if (fechaInicio) where.createdAt.gte = new Date(fechaInicio as string);
      if (fechaFin) where.createdAt.lte = new Date(fechaFin as string);
    }

    const [
      totalEnviadas,
      totalFallidas,
      totalProgramadas,
      porTipo,
      porCanal,
    ] = await Promise.all([
      prisma.notificacion.count({ where: { ...where, estado: 'ENVIADO' } }),
      prisma.notificacion.count({ where: { ...where, estado: 'FALLIDO' } }),
      prisma.notificacion.count({ where: { ...where, estado: 'PROGRAMADO' } }),
      prisma.notificacion.groupBy({
        by: ['tipo'],
        where,
        _count: true,
      }),
      prisma.notificacion.groupBy({
        by: ['canal'],
        where,
        _count: true,
      }),
    ]);

    res.json({
      totalEnviadas,
      totalFallidas,
      totalProgramadas,
      porTipo,
      porCanal,
      tasaExito:
        totalEnviadas + totalFallidas > 0
          ? ((totalEnviadas / (totalEnviadas + totalFallidas)) * 100).toFixed(2)
          : '0',
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

// ============================================
// PRUEBAS
// ============================================

export async function probarEmail(req: Request, res: Response) {
  try {
    const { destinatario } = req.body;

    if (!destinatario) {
      return res.status(400).json({ error: 'Falta el destinatario' });
    }

    const exito = await emailService.enviarEmail({
      to: destinatario,
      subject: 'Prueba del Sistema de Notificaciones',
      html: '<h1>¡Funciona!</h1><p>Este es un email de prueba del sistema de notificaciones del sanatorio.</p>',
    });

    if (exito) {
      res.json({ mensaje: 'Email de prueba enviado correctamente', exito: true });
    } else {
      res.status(500).json({ error: 'Error al enviar email de prueba', exito: false });
    }
  } catch (error) {
    console.error('Error al enviar email de prueba:', error);
    res.status(500).json({ error: 'Error al enviar email de prueba' });
  }
}

export async function probarWhatsApp(req: Request, res: Response) {
  try {
    const { destinatario } = req.body;

    if (!destinatario) {
      return res.status(400).json({ error: 'Falta el destinatario' });
    }

    const resultado = await whatsappService.enviarWhatsApp({
      to: destinatario,
      mensaje: '¡Funciona! Este es un mensaje de prueba del sistema de notificaciones del sanatorio.',
    });

    if (resultado.success) {
      res.json({ mensaje: 'WhatsApp de prueba enviado correctamente', exito: true });
    } else {
      res.status(500).json({
        error: 'Error al enviar WhatsApp de prueba',
        exito: false,
        detalles: resultado.error,
      });
    }
  } catch (error) {
    console.error('Error al enviar WhatsApp de prueba:', error);
    res.status(500).json({ error: 'Error al enviar WhatsApp de prueba' });
  }
}

export async function obtenerEstadoServicios(req: Request, res: Response) {
  try {
    const estadoEmail = emailService.getEstado();
    const estadoWhatsApp = whatsappService.getEstado();

    res.json({
      email: estadoEmail,
      whatsapp: estadoWhatsApp,
    });
  } catch (error) {
    console.error('Error al obtener estado de servicios:', error);
    res.status(500).json({ error: 'Error al obtener estado de servicios' });
  }
}
