import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { guardiaAlgorithmService } from '../services/guardia-algorithm.service';
import { TipoGuardia, GeneradaPor } from '@prisma/client';

export const guardiasController = {
  /** GET /api/guardias/grilla?mes=&anio=&sanatorioId=&area= */
  async getGrilla(req: AuthRequest, res: Response) {
    try {
      const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1;
      const anio = parseInt(req.query.anio as string) || new Date().getFullYear();
      const sanatorioId = req.query.sanatorioId as string;
      const area = req.query.area as string | undefined; // ENFERMERO | MUCAMA

      if (!sanatorioId) {
        return res.status(400).json({ success: false, error: 'sanatorioId requerido' });
      }

      const inicio = new Date(anio, mes - 1, 1);
      const fin    = new Date(anio, mes, 0);

      const guardias = await prisma.guardia.findMany({
        where: {
          fecha: { gte: inicio, lte: fin },
          personal: {
            sanatorioId,
            ...(area ? { rol: area as any } : {}),
          },
        },
        include: {
          personal: { select: { id: true, nombre: true, apellido: true, rol: true } },
        },
        orderBy: [{ fecha: 'asc' }, { turnoNombre: 'asc' }],
      });

      return res.json({ success: true, data: guardias });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /** GET /api/guardias/personal/:id */
  async getByPersonal(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const mes  = parseInt(req.query.mes as string) || new Date().getMonth() + 1;
      const anio = parseInt(req.query.anio as string) || new Date().getFullYear();

      const inicio = new Date(anio, mes - 1, 1);
      const fin    = new Date(anio, mes, 0);

      const guardias = await prisma.guardia.findMany({
        where: { personalId: id, fecha: { gte: inicio, lte: fin } },
        orderBy: { fecha: 'asc' },
      });

      return res.json({ success: true, data: guardias });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /** POST /api/guardias/generar */
  async generarGrilla(req: AuthRequest, res: Response) {
    try {
      const { mes, anio, sanatorioId } = req.body;
      if (!mes || !anio || !sanatorioId) {
        return res.status(400).json({ success: false, error: 'mes, anio y sanatorioId son requeridos' });
      }

      const resultado = await guardiaAlgorithmService.generarGrillaDelMes(
        parseInt(mes),
        parseInt(anio),
        sanatorioId,
      );

      return res.json({
        success: true,
        message: `Grilla generada: ${resultado.guardias} guardias para ${resultado.personal} personas`,
        data: resultado,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  /** PUT /api/guardias/:id */
  async ajusteManual(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { personalId, turnoNombre, tipo, notas } = req.body;

      // Verificar advertencias de equidad antes de guardar
      let advertencias: string[] = [];
      if (personalId) {
        advertencias = await guardiaAlgorithmService.validarAjusteManual(id, personalId);
      }

      const guardia = await prisma.guardia.update({
        where: { id },
        data: {
          ...(personalId    && { personalId }),
          ...(turnoNombre   && { turnoNombre }),
          ...(tipo          && { tipo: tipo as TipoGuardia }),
          ...(notas !== undefined && { notas }),
          generadaPor: GeneradaPor.MANUAL,
          requiereRevision: false,
        },
        include: {
          personal: { select: { id: true, nombre: true, apellido: true } },
        },
      });

      return res.json({ success: true, data: guardia, advertencias });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};
