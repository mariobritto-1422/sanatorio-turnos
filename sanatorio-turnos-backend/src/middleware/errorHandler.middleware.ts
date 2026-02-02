import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error capturado por handler:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  // Errores de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          error: 'Ya existe un registro con esos datos únicos',
          field: error.meta?.target,
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: 'Registro no encontrado',
        });
      case 'P2003':
        return res.status(400).json({
          success: false,
          error: 'Relación inválida o no encontrada',
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'Error de base de datos',
          code: error.code,
        });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos para la operación',
    });
  }

  // Error genérico
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? error.message
      : 'Error interno del servidor',
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.url}`,
  });
};
