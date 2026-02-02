# ✅ Checklist Pre-Deploy - Sanatorio Turnos

## 📋 Antes de Hacer Deploy

### 🔐 Seguridad

- [ ] **Generar nuevo JWT_SECRET** para producción
  ```bash
  openssl rand -base64 64
  ```

- [ ] **Verificar que no hay credenciales** en el código
  ```bash
  # Buscar posibles secretos
  grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" sanatorio-turnos-backend/src/
  grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" sanatorio-turnos-frontend/src/
  ```

- [ ] **Revisar .gitignore**
  - [ ] `.env` está ignorado
  - [ ] `node_modules/` está ignorado
  - [ ] Archivos de build están ignorados

- [ ] **Variables de entorno configuradas**
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET (NUEVO, no el de desarrollo)
  - [ ] FRONTEND_URL
  - [ ] SMTP_* (todas las variables de email)
  - [ ] TWILIO_* (si usas WhatsApp)

### 📦 Código

- [ ] **Todos los archivos guardados** en Git
  ```bash
  git status
  # No debería haber archivos sin commit
  ```

- [ ] **Sin errores de TypeScript**
  ```bash
  # Backend
  cd sanatorio-turnos-backend
  npm run build

  # Frontend
  cd sanatorio-turnos-frontend
  npm run build
  ```

- [ ] **Sin errores de linting**
  ```bash
  # Frontend
  cd sanatorio-turnos-frontend
  npm run lint
  ```

- [ ] **Dependencies actualizadas**
  ```bash
  # Backend
  cd sanatorio-turnos-backend
  npm outdated
  npm audit

  # Frontend
  cd sanatorio-turnos-frontend
  npm outdated
  npm audit
  ```

### 🎨 PWA

- [ ] **Íconos generados** en todos los tamaños
  - [ ] icon-16x16.png
  - [ ] icon-32x32.png
  - [ ] icon-72x72.png
  - [ ] icon-96x96.png
  - [ ] icon-128x128.png
  - [ ] icon-144x144.png
  - [ ] icon-152x152.png
  - [ ] icon-180x180.png
  - [ ] icon-192x192.png
  - [ ] icon-384x384.png
  - [ ] icon-512x512.png

- [ ] **manifest.json** configurado correctamente
  - [ ] name y short_name apropiados
  - [ ] theme_color (#0EA5E9)
  - [ ] background_color (#ffffff)
  - [ ] icons apuntan a archivos existentes

- [ ] **Service Worker** funcionando
  - [ ] Probar en localhost con HTTPS o http://localhost
  - [ ] Verificar en DevTools → Application → Service Workers

### 📧 Notificaciones

- [ ] **Email configurado y probado**
  - [ ] SMTP credentials correctas
  - [ ] Probar con endpoint `/api/notificaciones/pruebas/email`

- [ ] **Templates revisadas**
  - [ ] Revisar español y ortografía
  - [ ] Verificar que las variables se reemplazan
  - [ ] Probar en diferentes clientes de email

- [ ] **WhatsApp configurado** (si aplica)
  - [ ] Twilio account activa
  - [ ] Número verificado
  - [ ] Probar con endpoint `/api/notificaciones/pruebas/whatsapp`

### 🗄️ Base de Datos

- [ ] **Migraciones preparadas**
  ```bash
  cd sanatorio-turnos-backend
  npx prisma migrate dev --name initial
  ```

- [ ] **Seeds preparados**
  - [ ] seed.ts (usuarios y datos base)
  - [ ] seed-notificaciones.ts (plantillas)

- [ ] **Backup plan definido**
  - [ ] Frecuencia de backups (diario/semanal)
  - [ ] Ubicación de backups
  - [ ] Procedimiento de restauración

### 🌐 URLs y Dominios

- [ ] **URLs de frontend** definidas
  - [ ] URL de Vercel: `https://sanatorio-turnos.vercel.app`
  - [ ] Dominio custom (si aplica): `https://turnos.tusanatorio.com`

- [ ] **URLs de backend** definidas
  - [ ] URL de Railway: `https://sanatorio-turnos-backend.railway.app`
  - [ ] Dominio custom (si aplica): `https://api.tusanatorio.com`

- [ ] **CORS configurado** para todas las URLs
  ```typescript
  // backend/src/index.ts
  cors({
    origin: [
      'https://sanatorio-turnos.vercel.app',
      'https://turnos.tusanatorio.com'  // si aplica
    ]
  })
  ```

### 📱 Testing

- [ ] **Funcionalidad básica probada localmente**
  - [ ] Login funciona
  - [ ] Crear turno funciona
  - [ ] Notificaciones se envían
  - [ ] Estadísticas cargan

- [ ] **Probado en diferentes navegadores**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari (si tienes Mac/iOS)
  - [ ] Edge

- [ ] **Probado en móvil**
  - [ ] Android (Chrome)
  - [ ] iOS (Safari)

- [ ] **PWA instalable**
  - [ ] Banner de instalación aparece
  - [ ] App se instala correctamente
  - [ ] Íconos se ven bien
  - [ ] Splash screen funciona

### 📚 Documentación

- [ ] **README.md actualizado**
  - [ ] URLs de producción
  - [ ] Instrucciones de instalación
  - [ ] Variables de entorno

- [ ] **Credenciales documentadas** (en lugar seguro)
  - [ ] Credenciales de DB
  - [ ] Credenciales SMTP
  - [ ] Credenciales Twilio
  - [ ] Usuarios de prueba

- [ ] **Equipo informado**
  - [ ] URLs compartidas
  - [ ] Credenciales compartidas (de forma segura)
  - [ ] Documentación accesible

---

## 🚀 Durante el Deploy

### Backend (Railway/Render)

1. [ ] **Crear proyecto**
2. [ ] **Conectar repositorio**
3. [ ] **Agregar PostgreSQL**
4. [ ] **Configurar variables de entorno**
5. [ ] **Deploy inicial**
6. [ ] **Ejecutar migraciones**
   ```bash
   railway run npm run db:migrate
   ```
7. [ ] **Ejecutar seeds**
   ```bash
   railway run npm run db:seed
   railway run tsx prisma/seed-notificaciones.ts
   ```
8. [ ] **Verificar logs** sin errores
9. [ ] **Probar endpoint** `/api/health`

### Frontend (Vercel)

1. [ ] **Crear proyecto**
2. [ ] **Conectar repositorio**
3. [ ] **Configurar variables de entorno**
   - [ ] NEXT_PUBLIC_API_URL
4. [ ] **Deploy inicial**
5. [ ] **Verificar build** exitoso
6. [ ] **Probar la aplicación**

---

## ✅ Post-Deploy

### Verificación Inmediata

- [ ] **Sitio accesible** en la URL de producción
- [ ] **Login funciona** con usuarios de seed
- [ ] **API responde** correctamente
- [ ] **Notificaciones se envían**
- [ ] **PWA instalable**
- [ ] **Sin errores en consola**
- [ ] **Sin errores en logs del servidor**

### Testing Completo

- [ ] **Flujo de paciente**
  - [ ] Login
  - [ ] Solicitar turno
  - [ ] Ver turnos
  - [ ] Recibir notificación

- [ ] **Flujo de profesional**
  - [ ] Login
  - [ ] Ver agenda
  - [ ] Marcar asistencia
  - [ ] Ver estadísticas

- [ ] **Flujo de recepción**
  - [ ] Login
  - [ ] Crear paciente
  - [ ] Asignar turno
  - [ ] Ver estadísticas
  - [ ] Exportar reporte
  - [ ] Configurar notificaciones

### Monitoreo

- [ ] **Configurar alertas** (Uptime Robot o similar)
  - [ ] Frontend online
  - [ ] Backend online
  - [ ] Tiempo de respuesta < 2s

- [ ] **Verificar logs** periódicamente
  - [ ] Railway/Render dashboard
  - [ ] Sin errores críticos
  - [ ] Sin warnings importantes

- [ ] **Verificar uso de recursos**
  - [ ] RAM < 80%
  - [ ] Disco < 80%
  - [ ] CPU aceptable

### Backups

- [ ] **Configurar backups automáticos**
  - [ ] Base de datos (diario)
  - [ ] Variables de entorno (guardadas)
  - [ ] Código en Git (siempre)

- [ ] **Probar restauración**
  ```bash
  # Hacer backup
  railway run pg_dump $DATABASE_URL > backup.sql

  # Probar restaurar
  railway run psql $DATABASE_URL < backup.sql
  ```

### Documentación Final

- [ ] **Actualizar README** con URLs de producción
- [ ] **Documentar credenciales** en gestor seguro
- [ ] **Compartir accesos** con el equipo
- [ ] **Crear runbook** de procedimientos comunes

---

## 🎯 Checklist de Usuarios

### Usuarios de Prueba (Seed)

Verificar que funcionan:

- [ ] **SUPERADMIN**
  ```
  Email: admin@sanatorio.com
  Password: Admin123!
  ```

- [ ] **RECEPCION**
  ```
  Email: recepcion@sanatorio.com
  Password: Recepcion123!
  ```

- [ ] **PROFESIONAL**
  ```
  Email: dra.garcia@sanatorio.com
  Password: Prof123!
  ```

- [ ] **PACIENTE**
  ```
  Email: juan.perez@email.com
  Password: Paciente123!
  ```

---

## ⚠️ Problemas Comunes

### Backend no arranca
✅ **Solución:**
- Verificar DATABASE_URL
- Verificar que las migraciones corrieron
- Revisar logs para error específico

### Frontend no conecta con Backend
✅ **Solución:**
- Verificar NEXT_PUBLIC_API_URL
- Verificar CORS en backend
- Verificar que backend esté corriendo

### Notificaciones no se envían
✅ **Solución:**
- Verificar credenciales SMTP
- Probar con endpoint de prueba
- Revisar logs de notificaciones

### PWA no instala
✅ **Solución:**
- Verificar que estás en HTTPS
- Verificar manifest.json
- Verificar que Service Worker se registró
- Limpiar caché del navegador

---

## 📞 Contactos de Emergencia

### Soporte Técnico
- **Vercel:** https://vercel.com/support
- **Railway:** https://railway.app/help
- **Render:** https://render.com/support

### Comunidades
- **Railway Discord:** https://discord.gg/railway
- **Vercel Discord:** https://vercel.com/discord
- **Next.js Discord:** https://nextjs.org/discord

---

## 🎉 ¡Deploy Exitoso!

Si completaste todos los checks:

✅ Tu aplicación está en producción
✅ Los usuarios pueden acceder
✅ Las notificaciones funcionan
✅ Los datos están respaldados
✅ El monitoreo está activo

**¡FELICITACIONES!** 🎊

---

**Última revisión:** 2 de Febrero, 2026

**Estado:** LISTO PARA PRODUCCIÓN ✅
