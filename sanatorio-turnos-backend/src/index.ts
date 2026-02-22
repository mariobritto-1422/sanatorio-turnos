import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler.middleware';
import { logger } from './utils/logger';
import prisma from './config/database';
import { inicializarCronJobs } from './jobs/notificaciones.cron';

// ============================================
// CONFIGURACIÓN DEL SERVIDOR
// ============================================

const app: Application = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Seguridad
app.use(helmet());

// CORS - Orígenes leídos desde variable de entorno CORS_ORIGINS (separados por coma)
// Ejemplo: CORS_ORIGINS=http://localhost:3000,https://sanatorio-turnos.netlify.app
const corsOriginsEnv = process.env.CORS_ORIGINS || 'http://localhost:3000';
const allowedOrigins = corsOriginsEnv.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      // Verificar si el origin está en la lista de permitidos
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Rechazar otros orígenes
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por ventana
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
});
app.use('/api', limiter);

// Parseo de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// RUTAS
// ============================================

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: `API de Gestión de Turnos - ${process.env.NOMBRE_INSTITUCION || 'Sanaturno'}`,
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      pacientes: '/api/pacientes',
      profesionales: '/api/profesionales',
      turnos: '/api/turnos',
      obrasSociales: '/api/obras-sociales',
      notificaciones: '/api/notificaciones',
    },
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use(notFound);

// Error Handler (debe ir al final)
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Conexión a base de datos establecida');

    // Inicializar cron jobs de notificaciones
    inicializarCronJobs();

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`📝 Modo: ${NODE_ENV}`);
      logger.info(`🔗 http://localhost:${PORT}`);
      logger.info(`🏥 API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Manejo de shutdown graceful
process.on('SIGINT', async () => {
  logger.info('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  logger.info('✅ Conexión a base de datos cerrada');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  logger.info('✅ Conexión a base de datos cerrada');
  process.exit(0);
});

// Iniciar
startServer();
