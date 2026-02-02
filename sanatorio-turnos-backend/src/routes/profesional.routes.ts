import { Router } from 'express';
import { profesionalController } from '../controllers/profesional.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdminOrRecepcion, requireAdmin } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { audit } from '../middleware/audit.middleware';
import {
  createProfesionalSchema,
  updateProfesionalSchema,
  createHorarioSchema,
} from '../utils/validators';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route GET /api/profesionales
 * @desc Listar profesionales
 * @access Private
 */
router.get('/', profesionalController.getAll);

/**
 * @route GET /api/profesionales/:id
 * @desc Obtener profesional por ID
 * @access Private
 */
router.get('/:id', profesionalController.getById);

/**
 * @route POST /api/profesionales
 * @desc Crear nuevo profesional
 * @access Private (RECEPCION, SUPERADMIN)
 */
router.post(
  '/',
  requireAdminOrRecepcion,
  validate(createProfesionalSchema),
  audit('CREATE_PROFESIONAL', 'profesionales'),
  profesionalController.create
);

/**
 * @route PUT /api/profesionales/:id
 * @desc Actualizar profesional
 * @access Private (RECEPCION, SUPERADMIN)
 */
router.put(
  '/:id',
  requireAdminOrRecepcion,
  validate(updateProfesionalSchema),
  audit('UPDATE_PROFESIONAL', 'profesionales'),
  profesionalController.update
);

/**
 * @route DELETE /api/profesionales/:id
 * @desc Eliminar (desactivar) profesional
 * @access Private (SUPERADMIN)
 */
router.delete(
  '/:id',
  requireAdmin,
  audit('DELETE_PROFESIONAL', 'profesionales'),
  profesionalController.delete
);

/**
 * @route GET /api/profesionales/:id/horarios
 * @desc Obtener horarios de un profesional
 * @access Private
 */
router.get('/:id/horarios', profesionalController.getHorarios);

/**
 * @route POST /api/profesionales/horarios
 * @desc Crear horario para profesional
 * @access Private (RECEPCION, SUPERADMIN)
 */
router.post(
  '/horarios',
  requireAdminOrRecepcion,
  validate(createHorarioSchema),
  audit('CREATE_HORARIO', 'horarios_profesional'),
  profesionalController.createHorario
);

/**
 * @route DELETE /api/profesionales/horarios/:id
 * @desc Eliminar horario
 * @access Private (RECEPCION, SUPERADMIN)
 */
router.delete(
  '/horarios/:id',
  requireAdminOrRecepcion,
  audit('DELETE_HORARIO', 'horarios_profesional'),
  profesionalController.deleteHorario
);

export default router;
