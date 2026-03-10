import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { requireModuloGuardias } from '../middleware/guardias.middleware';
import { configuracionTurnosController } from '../controllers/configuracion-turnos.controller';
import { Rol } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireModuloGuardias);

router.get('/:sanatorioId',  requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), configuracionTurnosController.get);
router.put('/:sanatorioId',  requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), configuracionTurnosController.upsert);

export default router;
