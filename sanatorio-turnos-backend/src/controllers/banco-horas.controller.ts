import { Response } from 'express';
import { AuthRequest } from '../types';
import { bancoHorasService } from '../services/banco-horas.service';

export const bancoHorasController = {
  /** GET /api/banco-horas/:personalId */
  async getByPersonal(req: AuthRequest, res: Response) {
    try {
      const { personalId } = req.params;
      const data = await bancoHorasService.getByPersonal(personalId);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /** GET /api/banco-horas/resumen?mes=&anio=&sanatorioId= */
  async getResumen(req: AuthRequest, res: Response) {
    try {
      const mes        = parseInt(req.query.mes as string) || new Date().getMonth() + 1;
      const anio       = parseInt(req.query.anio as string) || new Date().getFullYear();
      const sanatorioId = req.query.sanatorioId as string;

      if (!sanatorioId) {
        return res.status(400).json({ success: false, error: 'sanatorioId requerido' });
      }

      const data = await bancoHorasService.getResumenMes(sanatorioId, mes, anio);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /** GET /api/banco-horas/equidad?anio=&sanatorioId= */
  async getEquidad(req: AuthRequest, res: Response) {
    try {
      const anio        = parseInt(req.query.anio as string) || new Date().getFullYear();
      const sanatorioId = req.query.sanatorioId as string;

      if (!sanatorioId) {
        return res.status(400).json({ success: false, error: 'sanatorioId requerido' });
      }

      const data = await bancoHorasService.getEstadisticasEquidad(sanatorioId, anio);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /** POST /api/banco-horas/recalcular */
  async recalcular(req: AuthRequest, res: Response) {
    try {
      const { personalId, mes, anio } = req.body;
      if (!personalId || !mes || !anio) {
        return res.status(400).json({ success: false, error: 'personalId, mes y anio requeridos' });
      }
      const data = await bancoHorasService.recalcularMes(personalId, parseInt(mes), parseInt(anio));
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};
