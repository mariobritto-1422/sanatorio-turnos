import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { logger } from '../utils/logger';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.debug('Validación fallida', { errors });

        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: errors,
        });
      }

      logger.error('Error en validación', { error });
      return res.status(500).json({
        success: false,
        error: 'Error en validación',
      });
    }
  };
};
