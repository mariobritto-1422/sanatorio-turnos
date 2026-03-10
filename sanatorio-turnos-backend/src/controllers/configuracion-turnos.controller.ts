import { Response } from 'express';
import { AuthRequest } from '../types';
import { configuracionTurnosService } from '../services/configuracion-turnos.service';

export const configuracionTurnosController = {
  /** GET /api/configuracion-turnos/:sanatorioId */
  async get(req: AuthRequest, res: Response) {
    try {
      const { sanatorioId } = req.params;
      const data = await configuracionTurnosService.getBySanatorio(sanatorioId);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /** PUT /api/configuracion-turnos/:sanatorioId */
  async upsert(req: AuthRequest, res: Response) {
    try {
      const { sanatorioId } = req.params;
      const { turnos, maxDiasSeguidosSinFranco, maxNochesSeguidasPermitidas, diasFrancoSemanal } = req.body;

      if (!turnos || !Array.isArray(turnos) || turnos.length === 0) {
        return res.status(400).json({ success: false, error: 'Se requiere al menos un turno definido' });
      }

      const data = await configuracionTurnosService.upsert(sanatorioId, {
        turnos,
        maxDiasSeguidosSinFranco,
        maxNochesSeguidasPermitidas,
        diasFrancoSemanal,
      });

      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },
};
