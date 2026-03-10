import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

/**
 * Verifica que el módulo de guardias esté activo para el sanatorio del usuario.
 * Se aplica a todas las rutas /api/guardias/*, /api/canjes/*, etc.
 */
export const requireModuloGuardias = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
    }

    // SUPERADMIN siempre tiene acceso (para configurar el módulo)
    if (req.user.rol === 'SUPERADMIN') return next();

    // Buscar sanatorioId del usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { sanatorioId: true },
    });

    if (!usuario?.sanatorioId) {
      return res.status(403).json({
        success: false,
        error: 'El módulo de guardias no está activo para este sanatorio',
      });
    }

    const sanatorio = await prisma.sanatorio.findUnique({
      where: { id: usuario.sanatorioId },
      select: { moduloGuardiasActivo: true },
    });

    if (!sanatorio?.moduloGuardiasActivo) {
      return res.status(403).json({
        success: false,
        error: 'El módulo de guardias no está activo para este sanatorio',
      });
    }

    return next();
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
