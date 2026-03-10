import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { requireModuloGuardias } from '../middleware/guardias.middleware';
import { guardiasController } from '../controllers/guardias.controller';
import { Rol } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireModuloGuardias);

router.get('/grilla',        requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN, Rol.ENFERMERO, Rol.MUCAMA), guardiasController.getGrilla);
router.get('/personal/:id',  requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN, Rol.ENFERMERO, Rol.MUCAMA), guardiasController.getByPersonal);
router.post('/generar',      requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), guardiasController.generarGrilla);
router.put('/:id',           requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), guardiasController.ajusteManual);

export default router;
