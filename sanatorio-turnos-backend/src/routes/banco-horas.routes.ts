import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { requireModuloGuardias } from '../middleware/guardias.middleware';
import { bancoHorasController } from '../controllers/banco-horas.controller';
import { Rol } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireModuloGuardias);

router.get('/equidad',           requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), bancoHorasController.getEquidad);
router.get('/resumen',           requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), bancoHorasController.getResumen);
router.post('/recalcular',       requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), bancoHorasController.recalcular);
router.get('/:personalId',       requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN, Rol.ENFERMERO, Rol.MUCAMA), bancoHorasController.getByPersonal);

export default router;
