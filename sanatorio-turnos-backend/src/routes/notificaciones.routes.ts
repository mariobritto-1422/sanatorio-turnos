import { Router } from 'express';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarRol } from '../middleware/roles.middleware';
import * as notificacionesController from '../controllers/notificaciones.controller';

const router = Router();

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(verificarToken);

// ============================================
// PLANTILLAS (Solo SUPERADMIN)
// ============================================
router.get(
  '/plantillas',
  verificarRol(['SUPERADMIN']),
  notificacionesController.obtenerPlantillas
);

router.get(
  '/plantillas/:id',
  verificarRol(['SUPERADMIN']),
  notificacionesController.obtenerPlantilla
);

router.post(
  '/plantillas',
  verificarRol(['SUPERADMIN']),
  notificacionesController.crearPlantilla
);

router.put(
  '/plantillas/:id',
  verificarRol(['SUPERADMIN']),
  notificacionesController.actualizarPlantilla
);

router.delete(
  '/plantillas/:id',
  verificarRol(['SUPERADMIN']),
  notificacionesController.eliminarPlantilla
);

// ============================================
// CONFIGURACIÓN (Solo SUPERADMIN)
// ============================================
router.get(
  '/configuracion',
  verificarRol(['SUPERADMIN']),
  notificacionesController.obtenerConfiguraciones
);

router.put(
  '/configuracion/:tipo',
  verificarRol(['SUPERADMIN']),
  notificacionesController.actualizarConfiguracion
);

// ============================================
// LOG DE NOTIFICACIONES (SUPERADMIN y RECEPCION)
// ============================================
router.get(
  '/log',
  verificarRol(['SUPERADMIN', 'RECEPCION']),
  notificacionesController.obtenerLogNotificaciones
);

router.get(
  '/estadisticas',
  verificarRol(['SUPERADMIN', 'RECEPCION']),
  notificacionesController.obtenerEstadisticasNotificaciones
);

// ============================================
// PRUEBAS (Solo SUPERADMIN)
// ============================================
router.post(
  '/pruebas/email',
  verificarRol(['SUPERADMIN']),
  notificacionesController.probarEmail
);

router.post(
  '/pruebas/whatsapp',
  verificarRol(['SUPERADMIN']),
  notificacionesController.probarWhatsApp
);

router.get(
  '/estado',
  verificarRol(['SUPERADMIN']),
  notificacionesController.obtenerEstadoServicios
);

export default router;
