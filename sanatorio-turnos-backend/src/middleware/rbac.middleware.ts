import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Rol } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 */
export const requireRole = (...allowedRoles: Rol[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      logger.warn('Acceso denegado por rol', {
        userId: req.user.id,
        rol: req.user.rol,
        rolesPermitidos: allowedRoles,
      });

      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para realizar esta acción',
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que sea SUPERADMIN
 */
export const requireAdmin = requireRole(Rol.SUPERADMIN);

/**
 * Middleware para verificar que sea SUPERADMIN o RECEPCION
 */
export const requireAdminOrRecepcion = requireRole(Rol.SUPERADMIN, Rol.RECEPCION);

/**
 * Middleware para verificar que sea profesional
 */
export const requireProfesional = requireRole(Rol.PROFESIONAL, Rol.SUPERADMIN);

/**
 * Middleware para verificar que sea paciente
 */
export const requirePaciente = requireRole(Rol.PACIENTE, Rol.SUPERADMIN);
