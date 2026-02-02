# 🚀 SETUP - Instrucciones de Instalación

## 1. Requisitos Previos

### Instalar PostgreSQL

**Windows:**
- Descargar desde: https://www.postgresql.org/download/windows/
- Instalar con pgAdmin 4
- Durante instalación, configurar:
  - Puerto: 5432 (default)
  - Password del usuario postgres: (guardar este password)

**Verificar instalación:**
```bash
psql --version
```

## 2. Crear Base de Datos

### Opción A: Con pgAdmin 4 (GUI)
1. Abrir pgAdmin 4
2. Click derecho en "Databases" → "Create" → "Database"
3. Nombre: `sanatorio_turnos`
4. Owner: `postgres`
5. Click "Save"

### Opción B: Con terminal
```bash
psql -U postgres
CREATE DATABASE sanatorio_turnos;
\q
```

## 3. Configurar el Proyecto

### 3.1 Instalar dependencias
```bash
cd sanatorio-turnos-backend
npm install
```

### 3.2 Configurar .env
Editar el archivo `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/sanatorio_turnos?schema=public"
PORT=4000
NODE_ENV=development
JWT_SECRET=sanatorio-super-secreto-cambiar-en-produccion-123456789
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

**IMPORTANTE:** Reemplazar `TU_PASSWORD` con el password de PostgreSQL

## 4. Inicializar Base de Datos

```bash
# 1. Generar cliente Prisma
npm run db:generate

# 2. Crear tablas en la base de datos
npm run db:push

# 3. Cargar datos de prueba
npm run db:seed
```

## 5. Iniciar el Servidor

```bash
npm run dev
```

Si todo está OK, verás:
```
✅ Conexión a base de datos establecida
🚀 Servidor corriendo en puerto 4000
📝 Modo: development
🔗 http://localhost:4000
🏥 API Health: http://localhost:4000/api/health
```

## 6. Verificar que Funciona

### Probar Health Check
```bash
curl http://localhost:4000/api/health
```

Deberías ver:
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Probar Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sanatorio.com","password":"Admin123!"}'
```

Deberías recibir un token JWT.

## 7. Explorar la Base de Datos (Opcional)

```bash
npm run db:studio
```

Abrirá Prisma Studio en http://localhost:5555 donde podrás ver y editar datos visualmente.

## 🐛 Solución de Problemas

### Error: "Can't connect to database"
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en DATABASE_URL
- Verificar que la base de datos existe

### Error: "Port 4000 already in use"
- Cambiar PORT en .env a otro puerto (ej: 4001)

### Error en seed: "User already exists"
- La base de datos ya tiene datos
- Opcional: Limpiar y volver a seed:
```bash
npx prisma db push --force-reset
npm run db:seed
```

## 📋 Credenciales de Prueba

Después del seed, puedes usar estas credenciales:

**SuperAdmin:**
- Email: admin@sanatorio.com
- Password: Admin123!

**Recepción:**
- Email: recepcion@sanatorio.com
- Password: Recepcion123!

**Profesionales:**
- Email: garcia@sanatorio.com
- Password: Garcia123!

**Paciente:**
- Email: juan.perez@email.com
- Password: Paciente123!

## 🔄 Próximos Pasos

1. ✅ Backend funcionando
2. ⏭️ Crear frontend (PWA con Next.js)
3. ⏭️ Conectar frontend con backend
4. ⏭️ Deploy en producción

---

¿Problemas? Revisa los logs del servidor o contacta al equipo de desarrollo.
