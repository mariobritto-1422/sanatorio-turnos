import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { requireModuloGuardias } from '../middleware/guardias.middleware';
import { feriadosController } from '../controllers/feriados.controller';
import { Rol } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireModuloGuardias);

router.get('/',    requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN, Rol.ENFERMERO, Rol.MUCAMA), feriadosController.getAll);
router.post('/',   requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), feriadosController.create);
router.delete('/:id', requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), feriadosController.delete);

export default router;
