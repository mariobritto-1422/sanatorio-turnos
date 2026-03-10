import { Router } from 'express';
import authRoutes from './auth.routes';
import pacienteRoutes from './paciente.routes';
import profesionalRoutes from './profesional.routes';
import turnoRoutes from './turno.routes';
import obraSocialRoutes from './obraSocial.routes';
import notificacionesRoutes from './notificaciones.routes';
// Módulo Guardias — Fase 2
import guardiasRoutes from './guardias.routes';
import bancoHorasRoutes from './banco-horas.routes';
import canjesRoutes from './canjes.routes';
import feriadosRoutes from './feriados.routes';
import configuracionTurnosRoutes from './configuracion-turnos.routes';
import personalGuardiaRoutes from './personal-guardia.routes';
import configuracionSanatorioRoutes from './configuracion-sanatorio.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// Rutas principales — Fase 1
router.use('/auth', authRoutes);
router.use('/pacientes', pacienteRoutes);
router.use('/profesionales', profesionalRoutes);
router.use('/turnos', turnoRoutes);
router.use('/obras-sociales', obraSocialRoutes);
router.use('/notificaciones', notificacionesRoutes);

// Rutas Módulo Guardias — Fase 2
router.use('/guardias', guardiasRoutes);
router.use('/banco-horas', bancoHorasRoutes);
router.use('/canjes', canjesRoutes);
router.use('/feriados', feriadosRoutes);
router.use('/configuracion-turnos', configuracionTurnosRoutes);
router.use('/personal-guardia', personalGuardiaRoutes);
router.use('/configuracion-sanatorio', configuracionSanatorioRoutes);

export default router;
