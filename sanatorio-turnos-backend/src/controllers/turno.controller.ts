import { Response } from 'express';
import { AuthRequest } from '../types';
import { turnoService } from '../services/turno.service';
import { logger } from '../utils/logger';
import { EstadoTurno } from '@prisma/client';
import { programarRecordatoriosTurno, notificarCancelacionTurno } from '../utils/recordatorios.utils';

export const turnoController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const filters = {
        profesionalId: req.query.profesionalId as string,
        pacienteId: req.query.pacienteId as string,
        desde: req.query.desde as string,
        hasta: req.query.hasta as string,
        estado: req.query.estado as EstadoTurno,
        page: parseInt(req.query.page as string) || undefined,
        limit: parseInt(req.query.limit as string) || undefined,
      };

      const result = await turnoService.getAll(filters);

      res.json({
        success: true,
        data: result.turnos,
        pagination: result.pagination,
      });
    } catch (error: any) {
      logger.error('Error al listar turnos', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al listar turnos',
      });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const turno = await turnoService.getById(id as string);

      res.json({
        success: true,
        data: turno,
      });
    } catch (error: any) {
      logger.error('Error al obtener turno', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado',
        });
      }

      const turno = await turnoService.create(req.body, req.user.id);

      logger.info('Turno creado', { id: turno.id, paciente: turno.paciente.apellido });

      // Programar notificaciones automáticas (confirmación + recordatorios)
      try {
        await programarRecordatoriosTurno(turno.id, turno.fechaHora);
        logger.info('Notificaciones programadas', { turnoId: turno.id });
      } catch (notifError: any) {
        logger.error('Error al programar notificaciones', { error: notifError.message });
        // No fallar la creación del turno si falla la notificación
      }

      res.status(201).json({
        success: true,
        data: turno,
        message: 'Turno creado exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al crear turno', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const turno = await turnoService.update(id as string, req.body, req.user?.id);

      logger.info('Turno actualizado', { id });

      res.json({
        success: true,
        data: turno,
        message: 'Turno actualizado exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al actualizar turno', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async cancel(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado',
        });
      }

      const { id } = req.params;
      const { motivo } = req.body;

      const turno = await turnoService.cancel(id as string, motivo, req.user.id, req.user.rol);

      logger.info('Turno cancelado', { id, canceladoPor: req.user.rol });

      // Enviar notificación de cancelación
      try {
        await notificarCancelacionTurno(id as string);
        logger.info('Notificación de cancelación enviada', { turnoId: id });
      } catch (notifError: any) {
        logger.error('Error al enviar notificación de cancelación', { error: notifError.message });
        // No fallar la cancelación si falla la notificación
      }

      res.json({
        success: true,
        data: turno,
        message: 'Turno cancelado exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al cancelar turno', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getDisponibilidad(req: AuthRequest, res: Response) {
    try {
      const { profesionalId, fecha } = req.query;

      if (!profesionalId || !fecha) {
        return res.status(400).json({
          success: false,
          error: 'profesionalId y fecha son requeridos',
        });
      }

      const disponibilidad = await turnoService.getDisponibilidad(
        profesionalId as string,
        fecha as string
      );

      res.json({
        success: true,
        data: disponibilidad,
      });
    } catch (error: any) {
      logger.error('Error al obtener disponibilidad', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al obtener disponibilidad',
      });
    }
  },
};
