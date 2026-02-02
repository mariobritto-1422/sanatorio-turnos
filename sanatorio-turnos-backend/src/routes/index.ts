import { Router } from 'express';
import authRoutes from './auth.routes';
import pacienteRoutes from './paciente.routes';
import profesionalRoutes from './profesional.routes';
import turnoRoutes from './turno.routes';
import obraSocialRoutes from './obraSocial.routes';
import notificacionesRoutes from './notificaciones.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// Rutas principales
router.use('/auth', authRoutes);
router.use('/pacientes', pacienteRoutes);
router.use('/profesionales', profesionalRoutes);
router.use('/turnos', turnoRoutes);
router.use('/obras-sociales', obraSocialRoutes);
router.use('/notificaciones', notificacionesRoutes);

export default router;
