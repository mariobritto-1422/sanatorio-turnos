import { Response } from 'express';
import { AuthRequest } from '../types';
import { configuracionSanatorioService } from '../services/configuracion-sanatorio.service';
import prisma from '../config/database';

async function resolverSanatorioId(userId: string): Promise<string | null> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { sanatorioId: true },
  });

  if (usuario?.sanatorioId) return usuario.sanatorioId;

  // Fallback: primer sanatorio del sistema (single-tenant)
  const primero = await prisma.sanatorio.findFirst({ select: { id: true } });
  return primero?.id ?? null;
}

export const configuracionSanatorioController = {
  /** GET /api/configuracion-sanatorio */
  async get(req: AuthRequest, res: Response) {
    try {
      const sanatorioId = await resolverSanatorioId(req.user!.id);
      if (!sanatorioId) {
        return res.status(404).json({ success: false, error: 'No hay sanatorio configurado' });
      }
      const data = await configuracionSanatorioService.getOrCreate(sanatorioId);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /** PUT /api/configuracion-sanatorio */
  async upsert(req: AuthRequest, res: Response) {
    try {
      const sanatorioId = await resolverSanatorioId(req.user!.id);
      if (!sanatorioId) {
        return res.status(404).json({ success: false, error: 'No hay sanatorio configurado' });
      }
      const data = await configuracionSanatorioService.upsert(sanatorioId, req.body);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },
};
