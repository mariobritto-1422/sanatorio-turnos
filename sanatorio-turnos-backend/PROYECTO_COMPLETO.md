# ✅ BACKEND COMPLETO - Sistema de Gestión de Turnos

## 📦 Lo que se ha creado

### ✅ Base de Datos (Prisma Schema)
- **SIN historial clínico** (decisión de diseño para evitar conflictos legales)
- Usuarios con 4 roles: PACIENTE, PROFESIONAL, RECEPCION, SUPERADMIN
- Pacientes (con datos básicos visibles para todos los profesionales)
- Profesionales (con horarios configurables)
- Turnos (con sistema de estados y disponibilidad)
- Obras Sociales
- Auditoría de acciones
- Notas simples opcionales (ayuda memoria)

### ✅ Autenticación y Seguridad
- Login con JWT
- Hash de contraseñas con bcrypt
- Control de acceso basado en roles (RBAC)
- Rate limiting
- Helmet para seguridad HTTP
- CORS configurado
- Validaciones con Zod

### ✅ API REST Completa
**Endpoints de Autenticación:**
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/profile

**Endpoints de Pacientes:**
- GET /api/pacientes (listar, paginar, buscar)
- GET /api/pacientes/:id
- GET /api/pacientes/dni/:dni
- POST /api/pacientes (crear con o sin usuario)
- PUT /api/pacientes/:id
- DELETE /api/pacientes/:id (soft delete)

**Endpoints de Profesionales:**
- GET /api/profesionales
- GET /api/profesionales/:id
- POST /api/profesionales
- PUT /api/profesionales/:id
- DELETE /api/profesionales/:id
- GET /api/profesionales/:id/horarios
- POST /api/profesionales/horarios
- DELETE /api/profesionales/horarios/:id

**Endpoints de Turnos:**
- GET /api/turnos (con filtros avanzados)
- GET /api/turnos/disponibilidad (horarios libres)
- GET /api/turnos/:id
- POST /api/turnos
- PUT /api/turnos/:id
- POST /api/turnos/:id/cancelar

**Endpoints de Obras Sociales:**
- GET /api/obras-sociales
- GET /api/obras-sociales/:id
- POST /api/obras-sociales
- PUT /api/obras-sociales/:id
- DELETE /api/obras-sociales/:id

### ✅ Características Implementadas
1. **Sistema de Disponibilidad**: Calcula automáticamente horarios libres según configuración
2. **Validación de Conflictos**: No permite turnos superpuestos
3. **Auditoría**: Registra todas las acciones importantes
4. **Soft Delete**: Los registros se desactivan, no se eliminan
5. **Paginación**: Todos los listados soportan paginación
6. **Búsqueda**: Búsqueda por nombre, apellido, DNI en pacientes
7. **Filtros**: Turnos filtrables por profesional, paciente, fecha, estado
8. **Manejo de Errores**: Errores descriptivos y codes HTTP correctos
9. **Logging**: Sistema de logs con colores para desarrollo
10. **Seed de Datos**: Datos de prueba listos para usar

## 📁 Estructura del Proyecto

```
sanatorio-turnos-backend/
├── prisma/
│   ├── schema.prisma          ← Modelo de datos (SIN historial clínico)
│   └── seed.ts                ← Datos de prueba
├── src/
│   ├── config/
│   │   ├── database.ts        ← Configuración Prisma
│   │   └── constants.ts       ← Roles, permisos, constantes
│   ├── controllers/           ← Lógica de rutas HTTP
│   │   ├── auth.controller.ts
│   │   ├── paciente.controller.ts
│   │   ├── profesional.controller.ts
│   │   ├── turno.controller.ts
│   │   └── obraSocial.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts      ← JWT authentication
│   │   ├── rbac.middleware.ts      ← Role-based access control
│   │   ├── validation.middleware.ts ← Validación con Zod
│   │   ├── errorHandler.middleware.ts
│   │   └── audit.middleware.ts     ← Auditoría automática
│   ├── routes/                ← Definición de endpoints
│   │   ├── auth.routes.ts
│   │   ├── paciente.routes.ts
│   │   ├── profesional.routes.ts
│   │   ├── turno.routes.ts
│   │   ├── obraSocial.routes.ts
│   │   └── index.ts
│   ├── services/              ← Lógica de negocio
│   │   ├── auth.service.ts
│   │   ├── paciente.service.ts
│   │   ├── profesional.service.ts
│   │   ├── turno.service.ts
│   │   └── obraSocial.service.ts
│   ├── types/
│   │   └── index.ts           ← TypeScript types
│   ├── utils/
│   │   ├── jwt.ts             ← Manejo de tokens
│   │   ├── password.ts        ← Hash/compare passwords
│   │   ├── validators.ts      ← Schemas de validación Zod
│   │   └── logger.ts          ← Sistema de logging
│   └── index.ts               ← Entry point del servidor
├── .env                       ← Variables de entorno
├── .env.example               ← Template de .env
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md                  ← Documentación principal
├── SETUP.md                   ← Instrucciones de instalación
├── API_EXAMPLES.md            ← Ejemplos de uso de la API
└── PROYECTO_COMPLETO.md       ← Este archivo
```

## 🎯 Decisiones de Diseño Importantes

### 1. SIN Historial Clínico
**Razón:** Evitar responsabilidades legales y regulatorias de manejo de información médica sensible.

**Qué SÍ tiene:**
- Datos básicos del paciente (nombre, contacto, obra social)
- Notas simples opcionales en turnos (ayuda memoria)
- Observaciones médicas básicas (alergias, etc.)

**Qué NO tiene:**
- Historias clínicas completas
- Diagnósticos detallados
- Evoluciones médicas
- Archivos adjuntos de estudios

### 2. Visibilidad de Datos
- **Datos básicos de pacientes:** Visibles para TODOS los profesionales
- **Notas simples:** Solo visibles para el profesional que las escribió
- **Turnos:** Cada profesional ve solo sus propios turnos
- **Recepción:** Ve todo

### 3. Sistema de Roles (RBAC)
```
PACIENTE:
  ✓ Ver sus propios turnos
  ✓ Solicitar turnos
  ✓ Cancelar turnos propios
  ✓ Ver profesionales disponibles

PROFESIONAL:
  ✓ Ver su agenda
  ✓ Ver datos básicos de todos los pacientes
  ✓ Gestionar sus turnos
  ✓ Agregar notas simples
  ✓ Configurar horarios
  ✓ Bloquear horarios

RECEPCION:
  ✓ Gestión completa de turnos
  ✓ Crear/editar pacientes
  ✓ Ver todos los profesionales
  ✓ Gestionar obras sociales
  ✓ Ver estadísticas globales

SUPERADMIN:
  ✓ Todo lo anterior
  ✓ Crear/editar profesionales
  ✓ Gestionar usuarios
  ✓ Configuración del sistema
  ✓ Ver auditoría
```

## 🚀 Próximos Pasos

### PASO 1: Inicializar el Backend (HOY)
```bash
cd sanatorio-turnos-backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### PASO 2: Frontend (PRÓXIMO)
Crear PWA con Next.js 14:
- **Interfaz ULTRA-SIMPLE para pacientes** (máximo 3 pasos, botones grandes, fuentes grandes)
- Interfaz completa para profesionales
- Dashboard para recepción
- Panel de administración

### PASO 3: Funcionalidades Adicionales (FUTURO)
- [ ] Notificaciones push (recordatorios de turnos)
- [ ] Envío de emails
- [ ] Estadísticas y reportes
- [ ] Exportación de datos
- [ ] Sistema de recordatorios automáticos
- [ ] WhatsApp integration (opcional)

## 📊 Datos de Prueba Incluidos

Después del seed, tendrás:
- 1 SuperAdmin
- 1 Usuario de Recepción
- 2 Profesionales (Dr. García - Psiquiatra, Dra. López - Psicóloga)
- 2 Pacientes
- 3 Obras Sociales (OSDE, Swiss Medical, Particular)
- Horarios configurados para los profesionales
- 1 Turno de ejemplo

## 🔒 Seguridad Implementada

- ✅ Passwords hasheados con bcrypt (10 rounds)
- ✅ JWT con expiración (7 días configurable)
- ✅ Rate limiting (100 req/15min por IP)
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de inputs con Zod
- ✅ SQL Injection protegido (Prisma ORM)
- ✅ Auditoría de acciones críticas

## 📝 Notas Importantes

1. **Cambiar JWT_SECRET en producción** - El actual es solo para desarrollo
2. **Configurar backups de PostgreSQL** en producción
3. **Variables de entorno** nunca commitear .env al repo
4. **HTTPS obligatorio** en producción
5. **Rate limiting ajustar** según necesidades reales

## 🆘 Soporte

Ver documentación:
- README.md - Visión general
- SETUP.md - Instalación paso a paso
- API_EXAMPLES.md - Ejemplos de uso

## ✨ Tecnologías Utilizadas

- **Node.js** + **TypeScript** - Runtime y tipado
- **Express** - Framework web
- **Prisma** - ORM type-safe
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación stateless
- **Zod** - Validación de schemas
- **bcryptjs** - Hash de passwords
- **Helmet** - Seguridad HTTP
- **Morgan** - Logging HTTP

---

**Estado:** ✅ BACKEND COMPLETO Y LISTO PARA USAR

**Próximo paso:** Inicializar y probar el backend, luego crear el frontend PWA.
