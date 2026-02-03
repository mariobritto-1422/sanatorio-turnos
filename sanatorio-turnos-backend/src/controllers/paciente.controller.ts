import { Request, Response } from 'express';
import { pacienteService } from '../services/paciente.service';
import { logger } from '../utils/logger';

export const pacienteController = {
  async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const result = await pacienteService.getAll(page, limit, search);

      res.json({
        success: true,
        data: result.pacientes,
        pagination: result.pagination,
      });
    } catch (error: any) {
      logger.error('Error al listar pacientes', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al listar pacientes',
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const paciente = await pacienteService.getById(id as string);

      res.json({
        success: true,
        data: paciente,
      });
    } catch (error: any) {
      logger.error('Error al obtener paciente', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getByDni(req: Request, res: Response) {
    try {
      const { dni } = req.params;
      const paciente = await pacienteService.getByDni(dni as string);

      res.json({
        success: true,
        data: paciente,
      });
    } catch (error: any) {
      logger.error('Error al buscar paciente por DNI', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const paciente = await pacienteService.create(req.body);

      logger.info('Paciente creado', { id: paciente.id, dni: paciente.dni });

      res.status(201).json({
        success: true,
        data: paciente,
        message: 'Paciente creado exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al crear paciente', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const paciente = await pacienteService.update(id as string, req.body);

      logger.info('Paciente actualizado', { id });

      res.json({
        success: true,
        data: paciente,
        message: 'Paciente actualizado exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al actualizar paciente', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await pacienteService.delete(id as string);

      logger.info('Paciente eliminado', { id });

      res.json({
        success: true,
        message: 'Paciente eliminado exitosamente',
      });
    } catch (error: any) {
      logger.error('Error al eliminar paciente', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
};
