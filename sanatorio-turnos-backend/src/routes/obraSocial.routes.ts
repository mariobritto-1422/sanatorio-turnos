import { Router } from 'express';
import { obraSocialController } from '../controllers/obraSocial.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdminOrRecepcion } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { audit } from '../middleware/audit.middleware';
import { createObraSocialSchema, updateObraSocialSchema } from '../utils/validators';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route GET /api/obras-sociales
 * @desc Listar obras sociales
 * @access Private
 */
router.get('/', obraSocialController.getAll);

/**
 * @route GET /api/obras-sociales/:id
 * @desc Obtener obra social por ID
 * @access Private
 */
router.get('/:id', obraSocialController.getById);

/**
 * @route POST /api/obras-sociales
 * @desc Crear nueva obra social
 * @access Private (RECEPCION, SUPERADMIN)
 */
router.post(
  '/',
  requireAdminOrRecepcion,
  validate(createObraSocialSchema),
  audit('CREATE_OBRA_SOCIAL', 'obras_sociales'),
  obraSocialController.create
);

/**
 * @route PUT /api/obras-sociales/:id
 * @desc Actualizar obra social
 * @access Private (RECEPCION, SUPERADMIN)
 */
router.put(
  '/:id',
  requireAdminOrRecepcion,
  validate(updateObraSocialSchema),
  audit('UPDATE_OBRA_SOCIAL', 'obras_sociales'),
  obraSocialController.update
);

/**
 * @route DELETE /api/obras-sociales/:id
 * @desc Eliminar obra social
 * @access Private (RECEPCION, SUPERADMIN)
 */
router.delete(
  '/:id',
  requireAdminOrRecepcion,
  audit('DELETE_OBRA_SOCIAL', 'obras_sociales'),
  obraSocialController.delete
);

export default router;
