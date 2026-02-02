# 🏥 Sistema de Gestión de Turnos - Sanatorio Psiquiátrico

Sistema completo de gestión de turnos con accesibilidad WCAG AAA para sanatorio psiquiátrico. Desarrollado como PWA instalable con Next.js 14, Node.js y PostgreSQL.

## 📋 Características Principales

### 🎯 Interfaces por Rol

1. **Pacientes** (Accesibilidad WCAG AAA)
   - Botones gigantes (80px mínimo)
   - Tipografía extra grande (20-48px)
   - Máximo 3 opciones por pantalla
   - Navegación lineal simple
   - Flujo de 3 pasos para agendar

2. **Profesionales**
   - Agenda diaria/semanal/mensual
   - Gestión de horarios y bloqueos
   - Búsqueda de pacientes
   - Estadísticas personales
   - Notas de consulta (sin historia clínica)

3. **Recepción/Administración**
   - Dashboard completo
   - Gestión de turnos con filtros avanzados
   - CRUD de pacientes
   - CRUD de profesionales
   - Gestión de obras sociales
   - Estadísticas globales con gráficos
   - Sistema de notificaciones
   - Exportación a Excel/CSV/PDF

### 🔔 Sistema de Notificaciones Automáticas

- **Confirmación inmediata** al crear turno
- **Recordatorio 24h antes** del turno
- **Recordatorio 2h antes** del turno
- **Notificación de cancelación**
- Canales: Email (SMTP) y WhatsApp (Twilio)
- Templates editables desde admin
- Horarios configurables de envío
- Log completo de notificaciones
- Reintentos automáticos en caso de fallo

### 📊 Reportes y Estadísticas

- Gráficos de torta, barras y líneas (Recharts)
- Distribución por profesional
- Distribución por obra social
- Tasa de ausentismo global
- Horarios con más demanda
- Tendencia mensual
- Exportación en múltiples formatos

### 📱 PWA (Progressive Web App)

- ✅ Instalable en dispositivos móviles y desktop
- ✅ Funcionamiento offline básico
- ✅ Service Worker con estrategias de cache
- ✅ Manifest.json completo
- ✅ Íconos en todos los tamaños
- ✅ Splash screen
- ✅ Shortcuts de app
- ✅ Push notifications (preparado)

## 🚀 Stack Tecnológico

### Frontend
- **Next.js 14** (App Router)
- **React 18** con TypeScript
- **TailwindCSS** para estilos
- **Zustand** para state management
- **Recharts** para gráficos
- **date-fns** para manejo de fechas
- **Lucide React** para iconos
- **xlsx + jsPDF** para exportaciones

### Backend
- **Node.js + Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **JWT** para autenticación
- **Zod** para validaciones
- **bcryptjs** para encriptación
- **Helmet + CORS** para seguridad
- **Morgan** para logging
- **nodemailer** para emails
- **Twilio** para WhatsApp/SMS
- **node-cron** para tareas programadas

## 📦 Instalación

### Requisitos Previos

- **Node.js** 18.x o superior
- **PostgreSQL** 14 o superior
- **npm** o **yarn**
- Cuenta de **Gmail** (para SMTP) o servidor SMTP
- Cuenta de **Twilio** (opcional, para WhatsApp)

### 1. Clonar el Repositorio

```bash
git clone <url-del-repo>
cd sanatorio-turnos
```

### 2. Configurar Backend

```bash
cd sanatorio-turnos-backend

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

**Variables de entorno importantes:**

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/sanatorio_turnos"

# JWT
JWT_SECRET="tu-clave-secreta-super-segura"
JWT_EXPIRES_IN="7d"

# Email (Gmail ejemplo)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"
EMAIL_FROM="tu-email@gmail.com"
EMAIL_FROM_NAME="Sanatorio Turnos"

# Twilio (opcional)
TWILIO_ACCOUNT_SID="tu-account-sid"
TWILIO_AUTH_TOKEN="tu-auth-token"
TWILIO_WHATSAPP_NUMBER="+14155238886"
```

**Configurar Gmail para SMTP:**
1. Ve a tu cuenta de Google
2. Seguridad → Verificación en 2 pasos (activar)
3. Contraseñas de aplicaciones → Crear nueva
4. Usa esa contraseña en `SMTP_PASS`

```bash
# Generar cliente de Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Ejecutar seed (usuarios y plantillas por defecto)
npm run db:seed
npm run db:seed -- -f prisma/seed-notificaciones.ts

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará corriendo en `http://localhost:4000`

### 3. Configurar Frontend

```bash
cd ../sanatorio-turnos-frontend

# Instalar dependencias
npm install

# Crear archivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará corriendo en `http://localhost:3000`

### 4. Generar Íconos para PWA

Los íconos deben estar en `public/icons/` en los siguientes tamaños:
- icon-16x16.png
- icon-32x32.png
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-180x180.png (Apple)
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

**Herramienta recomendada:** [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

```bash
# Instalar herramienta
npm install -g pwa-asset-generator

# Generar íconos desde un logo
pwa-asset-generator logo.png public/icons/ --icon-only --background "#0EA5E9"
```

## 🔐 Usuarios por Defecto (Seed)

Después de ejecutar el seed, tendrás estos usuarios:

```
SUPERADMIN:
Email: admin@sanatorio.com
Password: Admin123!

RECEPCION:
Email: recepcion@sanatorio.com
Password: Recepcion123!

PROFESIONAL:
Email: dra.garcia@sanatorio.com
Password: Prof123!

PACIENTE:
Email: juan.perez@email.com
Password: Paciente123!
```

## 📚 Estructura del Proyecto

```
sanatorio-turnos/
├── sanatorio-turnos-backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Schema de base de datos
│   │   ├── seed.ts                    # Seed principal
│   │   └── seed-notificaciones.ts     # Seed de plantillas
│   ├── src/
│   │   ├── config/                    # Configuraciones
│   │   ├── controllers/               # Controladores
│   │   ├── middleware/                # Middlewares
│   │   ├── routes/                    # Rutas API
│   │   ├── services/                  # Servicios (email, whatsapp, notificaciones)
│   │   ├── jobs/                      # Cron jobs
│   │   ├── utils/                     # Utilidades
│   │   └── index.ts                   # Entry point
│   ├── .env.example
│   └── package.json
│
└── sanatorio-turnos-frontend/
    ├── public/
    │   ├── manifest.json              # Manifest PWA
    │   ├── sw.js                      # Service Worker
    │   └── icons/                     # Íconos PWA
    ├── src/
    │   ├── app/                       # App Router (Next.js 14)
    │   │   ├── paciente/              # Interfaz pacientes
    │   │   ├── profesional/           # Interfaz profesionales
    │   │   ├── recepcion/             # Interfaz recepción
    │   │   ├── login/
    │   │   └── offline/               # Página sin conexión
    │   ├── components/                # Componentes reutilizables
    │   ├── lib/                       # Utilidades y store
    │   └── styles/
    ├── .env.local.example
    └── package.json
```

## 🌐 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Resetear contraseña

### Turnos
- `GET /api/turnos` - Listar turnos
- `GET /api/turnos/:id` - Obtener turno
- `POST /api/turnos` - Crear turno
- `PUT /api/turnos/:id` - Actualizar turno
- `POST /api/turnos/:id/cancel` - Cancelar turno
- `GET /api/turnos/disponibilidad` - Horarios disponibles

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

### Notificaciones
- `GET /api/notificaciones/plantillas` - Plantillas
- `PUT /api/notificaciones/plantillas/:id` - Actualizar plantilla
- `GET /api/notificaciones/configuracion` - Configuración
- `PUT /api/notificaciones/configuracion/:tipo` - Actualizar config
- `GET /api/notificaciones/log` - Log de envíos
- `GET /api/notificaciones/estadisticas` - Estadísticas
- `POST /api/notificaciones/pruebas/email` - Probar email
- `POST /api/notificaciones/pruebas/whatsapp` - Probar WhatsApp

## 🚀 Deploy

### Opciones de Hosting Recomendadas

#### 1. **Vercel** (Frontend) - GRATIS
- Deploy automático desde GitHub
- CDN global
- HTTPS automático
- 100 GB de bandwidth gratis/mes
- [https://vercel.com](https://vercel.com)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd sanatorio-turnos-frontend
vercel
```

#### 2. **Railway** (Backend + DB) - $5/mes
- PostgreSQL incluido
- Deploy desde GitHub
- Variables de entorno fáciles
- [https://railway.app](https://railway.app)

#### 3. **Render** (Alternativa) - GRATIS con limitaciones
- Backend + DB PostgreSQL
- Se duerme tras inactividad (plan gratuito)
- [https://render.com](https://render.com)

#### 4. **Fly.io** (Backend) - GRATIS hasta 3 VMs
- Buenos recursos en plan gratuito
- [https://fly.io](https://fly.io)

#### 5. **Supabase** (Solo DB) - GRATIS hasta 500 MB
- PostgreSQL gestionado
- [https://supabase.com](https://supabase.com)

### Configuración para Producción

**Frontend (next.config.js):**
```js
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
```

**Backend (.env producción):**
```env
NODE_ENV=production
DATABASE_URL=<postgresql-production-url>
JWT_SECRET=<generar-nueva-clave-segura>
FRONTEND_URL=<tu-dominio-frontend>
```

## 📱 Instalación como PWA

### Android
1. Abre la app en Chrome
2. Click en menú (⋮)
3. "Instalar aplicación" o "Agregar a inicio"

### iOS
1. Abre la app en Safari
2. Click en compartir (□↑)
3. "Agregar a la pantalla de inicio"

### Desktop
1. Abre la app en Chrome/Edge
2. Click en ícono de instalación (⊕) en la barra de direcciones
3. "Instalar"

## 🔧 Scripts Útiles

### Backend
```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run start        # Producción
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Ejecutar seed
npm run db:studio    # Abrir Prisma Studio
```

### Frontend
```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run start        # Iniciar build de producción
npm run lint         # Linter
```

## 🐛 Troubleshooting

### Backend no se conecta a la DB
```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status

# Verificar la cadena de conexión en .env
echo $DATABASE_URL
```

### Service Worker no se registra
- Asegúrate de estar en HTTPS o localhost
- Limpia la cache del navegador
- Verifica en DevTools → Application → Service Workers

### Notificaciones no se envían
- Verifica las credenciales SMTP en .env
- Revisa logs del backend para errores
- Prueba con el endpoint `/api/notificaciones/pruebas/email`
- Para Gmail, asegúrate de usar "Contraseñas de aplicación"

### Errores de CORS
- Verifica que `FRONTEND_URL` en backend .env coincida con tu frontend
- En desarrollo: `http://localhost:3000`
- En producción: tu dominio de Vercel

## 📄 Licencia

Este proyecto está desarrollado para uso del sanatorio. Todos los derechos reservados.

## 🙏 Créditos

Desarrollado con ❤️ usando:
- Next.js
- Node.js + Express
- Prisma
- PostgreSQL
- Y muchas otras tecnologías open source

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo.
