# 🗓️ PRÓXIMOS PASOS - Roadmap del Proyecto

## ✅ COMPLETADO - Backend

- [x] Diseño de base de datos (SIN historial clínico)
- [x] Schema Prisma completo
- [x] Sistema de autenticación JWT
- [x] Control de acceso basado en roles (RBAC)
- [x] API REST completa:
  - [x] Auth (login, register, profile)
  - [x] Pacientes (CRUD completo)
  - [x] Profesionales (CRUD + horarios)
  - [x] Turnos (CRUD + disponibilidad + cancelación)
  - [x] Obras Sociales (CRUD)
- [x] Validaciones con Zod
- [x] Manejo de errores robusto
- [x] Auditoría de acciones
- [x] Seed de datos de prueba
- [x] Documentación completa

## 🔄 EN PROGRESO - Setup Inicial

### Para el Desarrollador:
1. [ ] Instalar PostgreSQL
2. [ ] Crear base de datos `sanatorio_turnos`
3. [ ] Configurar .env con credenciales
4. [ ] Ejecutar `npm install`
5. [ ] Ejecutar `npm run db:generate`
6. [ ] Ejecutar `npm run db:push`
7. [ ] Ejecutar `npm run db:seed`
8. [ ] Ejecutar `npm run dev`
9. [ ] Probar endpoint /api/health
10. [ ] Probar login con credenciales de prueba

### Verificación:
```bash
# 1. Health check
curl http://localhost:4000/api/health

# 2. Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sanatorio.com","password":"Admin123!"}'

# 3. Listar profesionales
curl http://localhost:4000/api/profesionales \
  -H "Authorization: Bearer TU_TOKEN"
```

## 🎨 SIGUIENTE - Frontend PWA (Prioridad Alta)

### Fase 1: Setup y Estructura
- [ ] Crear proyecto Next.js 14 (App Router)
- [ ] Configurar TailwindCSS
- [ ] Configurar PWA (next-pwa)
- [ ] Configurar manifest.json
- [ ] Setup de Service Workers
- [ ] Configurar API client (axios/fetch)
- [ ] Sistema de autenticación frontend
- [ ] Context/Store para estado global

### Fase 2: Interfaz para PACIENTES (ULTRA-SIMPLE)
**Prioridad: MÁXIMA** - Esta es la interfaz más crítica

#### Diseño de Accesibilidad Cognitiva:
- [ ] Fuentes grandes (mínimo 24px)
- [ ] Alto contraste (WCAG AAA)
- [ ] Botones gigantes (mínimo 80px altura)
- [ ] Máximo 3 opciones por pantalla
- [ ] Íconos + texto siempre
- [ ] Sin menús complejos
- [ ] Confirmaciones visuales claras
- [ ] Lenguaje simple (sin tecnicismos)

#### Funcionalidades:
- [ ] Login simplificado
- [ ] Ver mis turnos (listado con tarjetas grandes)
- [ ] Solicitar turno nuevo (MÁXIMO 3 PASOS):
  - [ ] Paso 1: Elegir profesional (tarjetas con foto)
  - [ ] Paso 2: Elegir día y hora (calendario visual)
  - [ ] Paso 3: Confirmar (resumen claro)
- [ ] Cancelar turno (con confirmación)
- [ ] Notificaciones de recordatorio

#### Componentes Específicos:
```
/components/paciente/
├── TarjetaProfesional.tsx       # Card grande con foto
├── CalendarioSimple.tsx         # Solo días disponibles
├── SelectorHorario.tsx          # Botones grandes de horarios
├── TarjetaTurno.tsx             # Card de turno con toda la info
├── BotonGigante.tsx             # Button component accesible
└── ConfirmacionVisual.tsx       # Feedback visual de acciones
```

### Fase 3: Interfaz para PROFESIONALES
- [ ] Dashboard con agenda del día
- [ ] Vista de calendario semanal/mensual
- [ ] Lista de pacientes (datos básicos)
- [ ] Detalle de turno
- [ ] Agregar nota simple a turno
- [ ] Gestionar horarios
- [ ] Bloquear horarios
- [ ] Ver estadísticas propias

### Fase 4: Interfaz para RECEPCIÓN
- [ ] Dashboard con estadísticas
- [ ] Gestión de turnos (crear, editar, cancelar)
- [ ] CRUD de pacientes
- [ ] Vista de agenda de todos los profesionales
- [ ] Búsqueda rápida por DNI/nombre
- [ ] CRUD de obras sociales
- [ ] Reportes y estadísticas

### Fase 5: Panel de SUPERADMIN
- [ ] Gestión de usuarios
- [ ] Gestión de profesionales
- [ ] Configuración global
- [ ] Auditoría (ver logs)
- [ ] Estadísticas globales

## 🔔 FUNCIONALIDADES EXTRA (Prioridad Media)

### Notificaciones
- [ ] Push notifications (Web Push API)
- [ ] Recordatorios automáticos (24hs antes)
- [ ] Notificación de confirmación de turno
- [ ] Notificación de cancelación

### Email (Opcional)
- [ ] Setup de SMTP
- [ ] Email de confirmación de turno
- [ ] Email de recordatorio
- [ ] Email de cancelación

### Estadísticas y Reportes
- [ ] Dashboard de estadísticas para recepción
- [ ] Reporte de turnos por profesional
- [ ] Reporte de obras sociales
- [ ] Turnos cancelados/ausentes
- [ ] Exportación a Excel/PDF

### Mejoras de UX
- [ ] Búsqueda inteligente de pacientes
- [ ] Autocompletado de formularios
- [ ] Caché offline (PWA)
- [ ] Sincronización automática
- [ ] Modo oscuro (opcional)

## 🚀 DEPLOYMENT (Prioridad Baja)

### Backend
- [ ] Elegir hosting (Railway/Render/VPS)
- [ ] Configurar PostgreSQL en producción
- [ ] Setup de variables de entorno
- [ ] Configurar HTTPS
- [ ] Setup de backups automáticos
- [ ] Monitoring (opcional: Sentry)

### Frontend
- [ ] Deploy en Vercel/Netlify
- [ ] Configurar dominio
- [ ] Configurar HTTPS
- [ ] Optimizar PWA para producción
- [ ] Testing en dispositivos móviles

## 📱 TESTING (Importante)

### Backend
- [ ] Tests unitarios de servicios
- [ ] Tests de integración de API
- [ ] Tests de autenticación
- [ ] Tests de validaciones

### Frontend
- [ ] Tests de componentes (Jest + RTL)
- [ ] Tests E2E (Playwright/Cypress)
- [ ] Tests de accesibilidad
- [ ] Tests en diferentes dispositivos

## 📚 DOCUMENTACIÓN (Continua)

- [ ] Manual de usuario para pacientes
- [ ] Manual de usuario para profesionales
- [ ] Manual de usuario para recepción
- [ ] Guía de administración
- [ ] Video tutoriales (opcional)

## 🎯 PRIORIDADES SUGERIDAS

### Sprint 1 (2-3 semanas):
1. ✅ Backend completo (HECHO)
2. Setup Frontend + Login
3. Interfaz PACIENTES (ultra-simple)

### Sprint 2 (2-3 semanas):
1. Interfaz PROFESIONALES
2. Interfaz RECEPCIÓN básica
3. Notificaciones push

### Sprint 3 (2-3 semanas):
1. Panel SUPERADMIN
2. Estadísticas y reportes
3. Testing completo

### Sprint 4 (1-2 semanas):
1. Deploy en producción
2. Optimizaciones
3. Documentación final

## ✨ FUNCIONALIDADES FUTURAS (Opcional)

- [ ] Integración con WhatsApp (mensajes automáticos)
- [ ] Videollamadas integradas
- [ ] Sistema de pagos
- [ ] App móvil nativa (React Native)
- [ ] Integración con sistemas de salud
- [ ] Firma digital de consentimientos
- [ ] Teleconsulta

## 📊 KPIs para Medir Éxito

- Tiempo promedio para solicitar un turno (objetivo: <2 minutos)
- Tasa de cancelación de turnos
- Tasa de adopción por pacientes
- Satisfacción de usuarios (encuestas)
- Uptime del sistema (objetivo: >99%)

---

**Estado Actual:** Backend completo ✅
**Siguiente Hito:** Frontend PWA con interfaz ultra-simple para pacientes
**Fecha Estimada de MVP:** 6-8 semanas desde hoy
