import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { requireModuloGuardias } from '../middleware/guardias.middleware';
import { personalGuardiaController } from '../controllers/personal-guardia.controller';
import { Rol } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireModuloGuardias);

router.get('/',                        requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), personalGuardiaController.getAll);
router.post('/',                       requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), personalGuardiaController.create);
router.get('/:id',                     requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN, Rol.ENFERMERO, Rol.MUCAMA), personalGuardiaController.getById);
router.put('/:id',                     requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), personalGuardiaController.update);
router.patch('/:id/toggle-activo',     requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), personalGuardiaController.toggleActivo);

export default router;
