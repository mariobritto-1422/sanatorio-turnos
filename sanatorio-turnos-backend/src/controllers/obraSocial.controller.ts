import { Request, Response } from 'express';
import { obraSocialService } from '../services/obraSocial.service';
import { logger } from '../utils/logger';

export const obraSocialController = {
  async getAll(req: Request, res: Response) {
    try {
      const activas = req.query.activas !== 'false';
      const obrasSociales = await obraSocialService.getAll(activas);

      res.json({
        success: true,
        data: obrasSociales,
      });
    } catch (error: any) {
      logger.error('Error al listar obras sociales', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al listar obras sociales',
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const obraSocial = await obraSocialService.getById(id);

      res.json({
        success: true,
        data: obraSocial,
      });
    } catch (error: any) {
      logger.error('Error al obtener obra social', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const obraSocial = await obraSocialService.create(req.body);

      logger.info('Obra social creada', { id: obraSocial.id, nombre: obraSocial.nombre });

      res.status(201).json({
        success: true,
        data: obraSocial,
        message: 'Obra social creada exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al crear obra social', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const obraSocial = await obraSocialService.update(id, req.body);

      logger.info('Obra social actualizada', { id });

      res.json({
        success: true,
        data: obraSocial,
        message: 'Obra social actualizada exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al actualizar obra social', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await obraSocialService.delete(id);

      logger.info('Obra social eliminada', { id });

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      logger.error('Error al eliminar obra social', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
};
