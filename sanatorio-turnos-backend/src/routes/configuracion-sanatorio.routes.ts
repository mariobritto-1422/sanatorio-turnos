import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdminOrRecepcion } from '../middleware/rbac.middleware';
import { configuracionSanatorioController } from '../controllers/configuracion-sanatorio.controller';

const router = Router();

router.use(authenticate);
router.use(requireAdminOrRecepcion);

router.get('/', configuracionSanatorioController.get);
router.put('/', configuracionSanatorioController.upsert);

export default router;
