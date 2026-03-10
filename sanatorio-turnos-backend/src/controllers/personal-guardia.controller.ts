import { Response } from 'express';
import { AuthRequest } from '../types';
import { personalGuardiaService } from '../services/personal-guardia.service';
import { RolGuardia } from '@prisma/client';

export const personalGuardiaController = {
  /** GET /api/personal-guardia?sanatorioId=&rol=&activo= */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const sanatorioId = req.query.sanatorioId as string;
      if (!sanatorioId) {
        return res.status(400).json({ success: false, error: 'sanatorioId requerido' });
      }
      const rol    = req.query.rol as RolGuardia | undefined;
      const activo = req.query.activo !== undefined ? req.query.activo === 'true' : undefined;

      const data = await personalGuardiaService.getAll(sanatorioId, { rol, activo });
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /** GET /api/personal-guardia/:id */
  async getById(req: AuthRequest, res: Response) {
    try {
      const data = await personalGuardiaService.getById(req.params.id);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(404).json({ success: false, error: error.message });
    }
  },

  /** POST /api/personal-guardia */
  async create(req: AuthRequest, res: Response) {
    try {
      const data = await personalGuardiaService.create(req.body);
      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  /** PUT /api/personal-guardia/:id */
  async update(req: AuthRequest, res: Response) {
    try {
      const data = await personalGuardiaService.update(req.params.id, req.body);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  /** PATCH /api/personal-guardia/:id/toggle-activo */
  async toggleActivo(req: AuthRequest, res: Response) {
    try {
      const data = await personalGuardiaService.toggleActivo(req.params.id);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },
};
