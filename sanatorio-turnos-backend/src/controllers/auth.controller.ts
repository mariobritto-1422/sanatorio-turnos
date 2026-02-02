import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { authService } from '../services/auth.service';
import { logger } from '../utils/logger';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      logger.info('Login exitoso', { email, rol: result.usuario.rol });

      res.json({
        success: true,
        data: result,
        message: 'Login exitoso',
      });
    } catch (error: any) {
      logger.warn('Login fallido', { error: error.message });
      res.status(401).json({
        success: false,
        error: error.message || 'Error en login',
      });
    }
  },

  async register(req: Request, res: Response) {
    try {
      const { email, password, rol } = req.body;

      const result = await authService.register(email, password, rol);

      logger.info('Usuario registrado', { email, rol });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Usuario registrado exitosamente',
      });
    } catch (error: any) {
      logger.error('Error en registro', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message || 'Error en registro',
      });
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado',
        });
      }

      const usuario = await authService.getProfile(req.user.id);

      res.json({
        success: true,
        data: usuario,
      });
    } catch (error: any) {
      logger.error('Error al obtener perfil', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al obtener perfil',
      });
    }
  },
};
