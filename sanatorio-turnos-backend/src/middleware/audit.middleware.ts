import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { logger } from '../utils/logger';

/**
 * Middleware para auditar acciones importantes
 */
export const audit = (accion: string, entidadTipo?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Guardar la función send original
    const originalSend = res.send;

    // Interceptar la respuesta
    res.send = function (body: any) {
      // Restaurar send original
      res.send = originalSend;

      // Solo auditar respuestas exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Ejecutar auditoría de forma asíncrona sin bloquear la respuesta
        setImmediate(async () => {
          try {
            const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
            const entidadId = parsedBody?.data?.id || req.params.id;

            await prisma.auditLog.create({
              data: {
                usuarioId: req.user?.id,
                accion,
                entidadTipo,
                entidadId,
                datosNuevos: req.method === 'POST' || req.method === 'PUT'
                  ? req.body
                  : undefined,
                ipAddress: req.ip || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
              },
            });

            logger.debug('Auditoría registrada', { accion, entidadTipo, entidadId });
          } catch (error) {
            logger.error('Error al registrar auditoría', { error });
          }
        });
      }

      return res.send(body);
    };

    next();
  };
};
