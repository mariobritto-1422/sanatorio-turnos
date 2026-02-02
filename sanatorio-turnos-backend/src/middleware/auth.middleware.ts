import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      logger.warn('Token inválido o expirado', { error });
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado',
      });
    }
  } catch (error) {
    logger.error('Error en autenticación', { error });
    return res.status(500).json({
      success: false,
      error: 'Error en autenticación',
    });
  }
};
