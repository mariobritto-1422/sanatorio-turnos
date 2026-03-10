import { Response } from 'express';
import { AuthRequest } from '../types';
import { solicitudCanjeService } from '../services/solicitud-canje.service';

export const canjesController = {
  /** POST /api/canjes/solicitar */
  async solicitar(req: AuthRequest, res: Response) {
    try {
      const canje = await solicitudCanjeService.solicitar(req.body);
      return res.status(201).json({ success: true, data: canje });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  /** PUT /api/canjes/:id/aprobar */
  async aprobar(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const aprobadoPorId = req.user!.id;
      const canje = await solicitudCanjeService.aprobar(id, aprobadoPorId);
      return res.json({ success: true, data: canje });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  /** PUT /api/canjes/:id/rechazar */
  async rechazar(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const aprobadoPorId = req.user!.id;
      const { motivoRechazo } = req.body;
      const canje = await solicitudCanjeService.rechazar(id, aprobadoPorId, motivoRechazo);
      return res.json({ success: true, data: canje });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  /** GET /api/canjes/pendientes?sanatorioId= */
  async getPendientes(req: AuthRequest, res: Response) {
    try {
      const sanatorioId = req.query.sanatorioId as string;
      if (!sanatorioId) {
        return res.status(400).json({ success: false, error: 'sanatorioId requerido' });
      }
      const data = await solicitudCanjeService.getPendientes(sanatorioId);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /** GET /api/canjes/historial/:personalId */
  async getHistorial(req: AuthRequest, res: Response) {
    try {
      const { personalId } = req.params;
      const data = await solicitudCanjeService.getHistorial(personalId);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};
