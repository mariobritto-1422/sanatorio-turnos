import { Router } from 'express';
import { verificarToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { Rol } from '@prisma/client';
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
  requireRole(Rol.SUPERADMIN),
  notificacionesController.obtenerPlantillas
);

router.get(
  '/plantillas/:id',
  requireRole(Rol.SUPERADMIN),
  notificacionesController.obtenerPlantilla
);

router.post(
  '/plantillas',
  requireRole(Rol.SUPERADMIN),
  notificacionesController.crearPlantilla
);

router.put(
  '/plantillas/:id',
  requireRole(Rol.SUPERADMIN),
  notificacionesController.actualizarPlantilla
);

router.delete(
  '/plantillas/:id',
  requireRole(Rol.SUPERADMIN),
  notificacionesController.eliminarPlantilla
);

// ============================================
// CONFIGURACIÓN (Solo SUPERADMIN)
// ============================================
router.get(
  '/configuracion',
  requireRole(Rol.SUPERADMIN),
  notificacionesController.obtenerConfiguraciones
);

router.put(
  '/configuracion/:tipo',
  requireRole(Rol.SUPERADMIN),
  notificacionesController.actualizarConfiguracion
);

// ============================================
// LOG DE NOTIFICACIONES (SUPERADMIN y RECEPCION)
// ============================================
router.get(
  '/log',
  requireRole(Rol.SUPERADMIN, Rol.RECEPCION),
  notificacionesController.obtenerLogNotificaciones
);

router.get(
  '/estadisticas',
  requireRole(Rol.SUPERADMIN, Rol.RECEPCION),
  notificacionesController.obtenerEstadisticasNotificaciones
);

// ============================================
// PRUEBAS (Solo SUPERADMIN)
// ============================================
router.post(
  '/pruebas/email',
  requireRole(Rol.SUPERADMIN),
  notificacionesController.probarEmail
);

router.post(
  '/pruebas/whatsapp',
  requireRole(Rol.SUPERADMIN),
  notificacionesController.probarWhatsApp
);

router.get(
  '/estado',
  requireRole(Rol.SUPERADMIN),
  notificacionesController.obtenerEstadoServicios
);

export default router;
