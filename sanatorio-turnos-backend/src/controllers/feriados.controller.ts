import { Response } from 'express';
import { AuthRequest } from '../types';
import { feriadoService } from '../services/feriado.service';

export const feriadosController = {
  /** GET /api/feriados?sanatorioId= */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const sanatorioId = req.query.sanatorioId as string | undefined;
      const data = await feriadoService.getAll(sanatorioId);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /** POST /api/feriados */
  async create(req: AuthRequest, res: Response) {
    try {
      const { fecha, nombre, tipo, sanatorioId } = req.body;
      if (!fecha || !nombre || !tipo) {
        return res.status(400).json({ success: false, error: 'fecha, nombre y tipo son requeridos' });
      }
      const data = await feriadoService.create({ fecha, nombre, tipo, sanatorioId });
      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  /** DELETE /api/feriados/:id */
  async delete(req: AuthRequest, res: Response) {
    try {
      await feriadoService.delete(req.params.id);
      return res.json({ success: true, message: 'Feriado eliminado' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};
