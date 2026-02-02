import { Router } from 'express';
import { pacienteController } from '../controllers/paciente.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdminOrRecepcion } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { audit } from '../middleware/audit.middleware';
import { createPacienteSchema, updatePacienteSchema } from '../utils/validators';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route GET /api/pacientes
 * @desc Listar pacientes (con paginación y búsqueda)
 * @access Private (RECEPCION, PROFESIONAL, SUPERADMIN)
 */
router.get('/', pacienteController.getAll);

/**
 * @route GET /api/pacientes/:id
 * @desc Obtener paciente por ID
 * @access Private
 */
router.get('/:id', pacienteController.getById);

/**
 * @route GET /api/pacientes/dni/:dni
 * @desc Buscar paciente por DNI
 * @access Private
 */
router.get('/dni/:dni', pacienteController.getByDni);

/**
 * @route POST /api/pacientes
 * @desc Crear nuevo paciente
 * @access Private (RECEPCION, SUPERADMIN)
 */
router.post(
  '/',
  requireAdminOrRecepcion,
  validate(createPacienteSchema),
  audit('CREATE_PACIENTE', 'pacientes'),
  pacienteController.create
);

/**
 * @route PUT /api/pacientes/:id
 * @desc Actualizar paciente
 * @access Private (RECEPCION, SUPERADMIN)
 */
router.put(
  '/:id',
  requireAdminOrRecepcion,
  validate(updatePacienteSchema),
  audit('UPDATE_PACIENTE', 'pacientes'),
  pacienteController.update
);

/**
 * @route DELETE /api/pacientes/:id
 * @desc Eliminar (desactivar) paciente
 * @access Private (SUPERADMIN)
 */
router.delete(
  '/:id',
  requireAdminOrRecepcion,
  audit('DELETE_PACIENTE', 'pacientes'),
  pacienteController.delete
);

export default router;
