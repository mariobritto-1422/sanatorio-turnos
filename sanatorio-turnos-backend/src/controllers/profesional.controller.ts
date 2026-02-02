import { Request, Response } from 'express';
import { profesionalService } from '../services/profesional.service';
import { logger } from '../utils/logger';

export const profesionalController = {
  async getAll(req: Request, res: Response) {
    try {
      const activos = req.query.activos !== 'false';
      const profesionales = await profesionalService.getAll(activos);

      res.json({
        success: true,
        data: profesionales,
      });
    } catch (error: any) {
      logger.error('Error al listar profesionales', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al listar profesionales',
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profesional = await profesionalService.getById(id);

      res.json({
        success: true,
        data: profesional,
      });
    } catch (error: any) {
      logger.error('Error al obtener profesional', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const profesional = await profesionalService.create(req.body);

      logger.info('Profesional creado', { id: profesional.id, matricula: profesional.matricula });

      res.status(201).json({
        success: true,
        data: profesional,
        message: 'Profesional creado exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al crear profesional', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profesional = await profesionalService.update(id, req.body);

      logger.info('Profesional actualizado', { id });

      res.json({
        success: true,
        data: profesional,
        message: 'Profesional actualizado exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al actualizar profesional', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await profesionalService.delete(id);

      logger.info('Profesional eliminado', { id });

      res.json({
        success: true,
        message: 'Profesional eliminado exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al eliminar profesional', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getHorarios(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const horarios = await profesionalService.getHorarios(id);

      res.json({
        success: true,
        data: horarios,
      });
    } catch (error: any) {
      logger.error('Error al obtener horarios', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al obtener horarios',
      });
    }
  },

  async createHorario(req: Request, res: Response) {
    try {
      const horario = await profesionalService.createHorario(req.body);

      logger.info('Horario creado', { id: horario.id });

      res.status(201).json({
        success: true,
        data: horario,
        message: 'Horario creado exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al crear horario', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async deleteHorario(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await profesionalService.deleteHorario(id);

      logger.info('Horario eliminado', { id });

      res.json({
        success: true,
        message: 'Horario eliminado exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al eliminar horario', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
};
