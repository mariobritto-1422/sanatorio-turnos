import { Router } from 'express';
import { turnoController } from '../controllers/turno.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { audit } from '../middleware/audit.middleware';
import { createTurnoSchema, updateTurnoSchema } from '../utils/validators';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route GET /api/turnos
 * @desc Listar turnos (con filtros)
 * @access Private
 * @query profesionalId, pacienteId, desde, hasta, estado, page, limit
 */
router.get('/', turnoController.getAll);

/**
 * @route GET /api/turnos/disponibilidad
 * @desc Obtener horarios disponibles para un profesional en una fecha
 * @access Private
 * @query profesionalId, fecha
 */
router.get('/disponibilidad', turnoController.getDisponibilidad);

/**
 * @route GET /api/turnos/:id
 * @desc Obtener turno por ID
 * @access Private
 */
router.get('/:id', turnoController.getById);

/**
 * @route POST /api/turnos
 * @desc Crear nuevo turno
 * @access Private
 */
router.post(
  '/',
  validate(createTurnoSchema),
  audit('CREATE_TURNO', 'turnos'),
  turnoController.create
);

/**
 * @route PUT /api/turnos/:id
 * @desc Actualizar turno
 * @access Private
 */
router.put(
  '/:id',
  validate(updateTurnoSchema),
  audit('UPDATE_TURNO', 'turnos'),
  turnoController.update
);

/**
 * @route POST /api/turnos/:id/cancelar
 * @desc Cancelar turno
 * @access Private
 */
router.post(
  '/:id/cancelar',
  audit('CANCEL_TURNO', 'turnos'),
  turnoController.cancel
);

export default router;
