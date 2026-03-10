import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { requireModuloGuardias } from '../middleware/guardias.middleware';
import { canjesController } from '../controllers/canjes.controller';
import { Rol } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireModuloGuardias);

router.post('/solicitar',            requireRole(Rol.ENFERMERO, Rol.MUCAMA, Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), canjesController.solicitar);
router.put('/:id/aprobar',           requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), canjesController.aprobar);
router.put('/:id/rechazar',          requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), canjesController.rechazar);
router.get('/pendientes',            requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN), canjesController.getPendientes);
router.get('/historial/:personalId', requireRole(Rol.SUPERVISOR_GUARDIA, Rol.SUPERADMIN, Rol.ENFERMERO, Rol.MUCAMA), canjesController.getHistorial);

export default router;
