import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { loginSchema, registerSchema } from '../utils/validators';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Login de usuario
 * @access Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route POST /api/auth/register
 * @desc Registro de nuevo usuario (solo para admins normalmente)
 * @access Public (debería ser Protected en producción)
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route GET /api/auth/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Private
 */
router.get('/profile', authenticate, authController.getProfile);

export default router;
