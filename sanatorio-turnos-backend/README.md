# 🏥 Backend - Sistema de Gestión de Turnos Sanatorio

API REST para gestión de turnos de un sanatorio psiquiátrico.

## 🚀 Características

- ✅ Autenticación JWT con roles (Paciente, Profesional, Recepción, SuperAdmin)
- ✅ CRUD completo de Pacientes, Profesionales, Turnos y Obras Sociales
- ✅ Sistema de disponibilidad de horarios
- ✅ Validaciones con Zod
- ✅ Auditoría de acciones
- ✅ Manejo robusto de errores
- ✅ Rate limiting y seguridad con Helmet
- ✅ Base de datos PostgreSQL con Prisma ORM

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 15+
- npm/yarn/pnpm

## 🛠️ Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. Configurar base de datos:
```bash
# Generar cliente Prisma
npm run db:generate

# Crear/actualizar base de datos
npm run db:push

# Ejecutar seed (datos de prueba)
npm run db:seed
```

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Prisma Studio (UI para ver la DB)
```bash
npm run db:studio
```

## 📡 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/profile` - Perfil del usuario

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `GET /api/pacientes/:id` - Obtener paciente
- `POST /api/pacientes` - Crear paciente
- `PUT /api/pacientes/:id` - Actualizar paciente
- `DELETE /api/pacientes/:id` - Eliminar paciente

### Profesionales
- `GET /api/profesionales` - Listar profesionales
- `GET /api/profesionales/:id` - Obtener profesional
- `POST /api/profesionales` - Crear profesional
- `PUT /api/profesionales/:id` - Actualizar profesional
- `GET /api/profesionales/:id/horarios` - Horarios del profesional

### Turnos
- `GET /api/turnos` - Listar turnos (con filtros)
- `GET /api/turnos/disponibilidad?profesionalId=xxx&fecha=2024-01-01` - Horarios disponibles
- `GET /api/turnos/:id` - Obtener turno
- `POST /api/turnos` - Crear turno
- `PUT /api/turnos/:id` - Actualizar turno
- `POST /api/turnos/:id/cancelar` - Cancelar turno

### Obras Sociales
- `GET /api/obras-sociales` - Listar obras sociales
- `POST /api/obras-sociales` - Crear obra social
- `PUT /api/obras-sociales/:id` - Actualizar obra social

## 🔑 Credenciales de Prueba (seed)

```
SUPERADMIN:
  Email: admin@sanatorio.com
  Pass: Admin123!

RECEPCIÓN:
  Email: recepcion@sanatorio.com
  Pass: Recepcion123!

PROFESIONALES:
  Email: garcia@sanatorio.com
  Pass: Garcia123!

  Email: lopez@sanatorio.com
  Pass: Lopez123!

PACIENTE:
  Email: juan.perez@email.com
  Pass: Paciente123!
```

## 🔒 Roles y Permisos

- **PACIENTE**: Ver y gestionar sus propios turnos
- **PROFESIONAL**: Ver su agenda, pacientes y turnos asignados
- **RECEPCION**: Gestión completa de turnos, pacientes y obras sociales
- **SUPERADMIN**: Acceso total al sistema

## 🏗️ Estructura del Proyecto

```
src/
├── config/          # Configuraciones (DB, constantes)
├── controllers/     # Controladores (lógica de rutas)
├── middleware/      # Middlewares (auth, validación, errores)
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── types/           # TypeScript types
├── utils/           # Utilidades (JWT, password, validators)
└── index.ts         # Entry point
```

## 📝 Notas Importantes

- **SIN Historial Clínico**: Por decisión de diseño, no se almacena historial clínico para evitar conflictos legales
- **Notas Simples**: Los turnos permiten notas básicas opcionales (ayuda memoria)
- **Datos Básicos Compartidos**: Todos los profesionales pueden ver datos básicos de pacientes (nombre, contacto, obra social)
- **Soft Delete**: Los registros se desactivan, no se eliminan permanentemente

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Iniciar en producción
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Sincronizar schema con DB
npm run db:migrate   # Crear migración
npm run db:seed      # Ejecutar seed
npm run db:studio    # Abrir Prisma Studio
```

## 🐛 Debugging

Logs detallados en modo desarrollo:
- Queries de Prisma
- Requests HTTP (morgan)
- Errores con stack trace

## 📦 Dependencias Principales

- **express**: Framework web
- **@prisma/client**: ORM
- **jsonwebtoken**: Autenticación JWT
- **bcryptjs**: Hash de contraseñas
- **zod**: Validación de esquemas
- **helmet**: Seguridad HTTP
- **cors**: CORS configurado

---

Desarrollado con ❤️ para gestión eficiente de turnos
