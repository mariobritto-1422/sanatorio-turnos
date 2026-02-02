# 🚀 Guía de Deploy - Sanatorio Turnos

## 📊 Comparativa de Opciones de Hosting

### Opción 1: **Vercel + Railway** (RECOMENDADA) ⭐

**Frontend en Vercel:**
- ✅ GRATIS hasta 100GB bandwidth/mes
- ✅ Deploy automático desde GitHub
- ✅ CDN global ultrarrápido
- ✅ HTTPS automático
- ✅ Vista previa de PRs
- ✅ Dominio personalizado gratis

**Backend en Railway:**
- ✅ $5/mes (incluye DB PostgreSQL)
- ✅ Deploy desde GitHub
- ✅ 512 MB RAM, 1 vCPU
- ✅ 1GB disco para DB
- ✅ Variables de entorno fáciles
- ✅ Logs en tiempo real

**Total: $5/mes** 💰

---

### Opción 2: **Render** (TODO EN UNO)

**Plan Gratuito:**
- ✅ Frontend + Backend + DB
- ⚠️ Se duerme tras 15 min de inactividad
- ⚠️ Arranque lento (30-60 segundos)
- ✅ 750 horas/mes gratis
- ✅ HTTPS incluido

**Plan Paid ($7/mes):**
- ✅ Sin dormir
- ✅ Mayor rendimiento
- ✅ Más recursos

**Total: GRATIS o $7/mes** 💰

---

### Opción 3: **Vercel + Fly.io + Supabase**

**Frontend en Vercel:** GRATIS
**Backend en Fly.io:** GRATIS (3 VMs pequeñas)
**DB en Supabase:** GRATIS (hasta 500 MB)

**Total: GRATIS** 💰💰💰

*Limitación: Solo 500 MB de base de datos*

---

### Opción 4: **VPS Propio** (Avanzado)

**Contabo VPS:**
- 💪 8GB RAM, 4 vCPU, 200GB disco
- 📍 Unlimited bandwidth
- 💰 €4.50/mes (~$5/mes)
- ⚙️ Requiere configuración manual

**DigitalOcean Droplet:**
- 💰 $6/mes (1GB RAM, 1 vCPU, 25GB disco)
- 📦 Snapshots automáticos
- 🛡️ Firewall incluido

---

## 🏆 Recomendación Final

### Para Desarrollo/Pruebas:
**Render Plan Gratuito** - Sin costo, fácil de configurar

### Para Producción con Bajo Tráfico:
**Vercel + Railway** - $5/mes, excelente rendimiento

### Para Producción con Alto Tráfico:
**VPS Propio (Contabo)** - €4.50/mes, máximo control

---

## 📝 Pasos de Deploy

### 1. Deploy Frontend en Vercel

```bash
# 1. Crear cuenta en https://vercel.com
# 2. Instalar Vercel CLI
npm i -g vercel

# 3. Login
vercel login

# 4. Deploy desde el directorio del frontend
cd sanatorio-turnos-frontend
vercel

# Seguir los pasos:
# - Set up and deploy? Y
# - Which scope? (tu cuenta)
# - Link to existing project? N
# - What's your project's name? sanatorio-turnos
# - In which directory is your code located? ./
# - Want to modify settings? N
```

**Configurar variables de entorno en Vercel Dashboard:**
```
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
```

---

### 2. Deploy Backend en Railway

**Opción A: Desde la Web (MÁS FÁCIL)**

1. Ve a [railway.app](https://railway.app) y crea cuenta
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio
5. Selecciona la carpeta `sanatorio-turnos-backend`
6. Railway detectará automáticamente Node.js
7. Agrega un servicio PostgreSQL:
   - Click en "+ New"
   - Selecciona "Database" → "PostgreSQL"
8. Configura variables de entorno:
   - `NODE_ENV=production`
   - `JWT_SECRET=<generar-clave-segura>`
   - `FRONTEND_URL=https://tu-app.vercel.app`
   - `SMTP_HOST`, `SMTP_USER`, etc.
   - La `DATABASE_URL` se configura automáticamente

**Opción B: Desde CLI**

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Crear proyecto
cd sanatorio-turnos-backend
railway init

# 4. Agregar PostgreSQL
railway add

# 5. Deploy
railway up

# 6. Abrir dashboard para ver variables
railway open
```

---

### 3. Deploy Backend en Render

1. Ve a [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Conecta tu repo de GitHub
4. Configuración:
   ```
   Name: sanatorio-turnos-backend
   Root Directory: sanatorio-turnos-backend
   Environment: Node
   Build Command: npm install && npx prisma generate && npm run build
   Start Command: npm start
   ```
5. Agrega base de datos:
   - Sidebar → "New +" → "PostgreSQL"
   - Nombre: sanatorio-turnos-db
   - Plan: Free
6. Conecta la DB al servicio web:
   - En el Web Service → Environment
   - Agregar `DATABASE_URL` (copiar de la DB)

---

### 4. Configurar Base de Datos

**Después del primer deploy:**

```bash
# Opción A: Desde Railway CLI
railway run npm run db:migrate
railway run npm run db:seed

# Opción B: Desde Render Shell
# (En Render dashboard → Shell)
npm run db:migrate
npm run db:seed
```

---

### 5. Configurar Dominio Personalizado (Opcional)

**En Vercel:**
1. Settings → Domains
2. Agregar dominio (ej: `turnos.tusanatorio.com`)
3. Configurar DNS:
   ```
   CNAME turnos cname.vercel-dns.com
   ```

**En Railway:**
1. Settings → Networking → Custom Domain
2. Agregar dominio (ej: `api.tusanatorio.com`)
3. Configurar DNS:
   ```
   CNAME api <tu-servicio>.up.railway.app
   ```

---

## 🔒 Variables de Entorno de Producción

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://tu-backend-url.com
```

### Backend (.env en Railway/Render)
```env
# Base de datos (automática en Railway/Render)
DATABASE_URL=postgresql://...

# Servidor
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://tu-frontend-url.vercel.app

# JWT - GENERAR NUEVA CLAVE SEGURA
JWT_SECRET=<usar: openssl rand -base64 64>
JWT_EXPIRES_IN=7d

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=<contraseña-de-aplicación>
EMAIL_FROM=tu-email@gmail.com
EMAIL_FROM_NAME=Sanatorio Turnos

# Twilio (opcional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
```

---

## ⚡ Optimizaciones Post-Deploy

### 1. Configurar CDN para Assets
En Vercel esto es automático. En Railway/Render, considera usar Cloudflare gratis.

### 2. Habilitar Compresión
Ya configurado en `next.config.js` y Express (gzip).

### 3. Configurar Monitoreo
- **Vercel:** Analytics incluido
- **Railway:** Logs en dashboard
- **Render:** Logs y métricas en dashboard
- **Externo:** [BetterStack](https://betterstack.com) (gratis hasta 1M logs/mes)

### 4. Backups de Base de Datos

**Railway:**
```bash
# Backup manual
railway run pg_dump $DATABASE_URL > backup.sql

# Restaurar
railway run psql $DATABASE_URL < backup.sql
```

**Render:**
Backups automáticos en plan paid ($7/mes).

### 5. Configurar CORS Apropiadamente

En `backend/src/index.ts`:
```typescript
app.use(
  cors({
    origin: [
      'https://tu-app.vercel.app',
      'https://tu-dominio-custom.com'
    ],
    credentials: true,
  })
);
```

---

## 🐛 Troubleshooting en Producción

### Backend no responde
```bash
# Ver logs
railway logs  # o render logs

# Verificar que esté corriendo
railway status

# Restart
railway restart
```

### Error de CORS
- Verifica que `FRONTEND_URL` en backend esté correcto
- Incluye todos los dominios posibles (vercel.app + custom domain)

### Migraciones de DB fallan
```bash
# Conectar a DB directamente
railway connect postgres

# Ejecutar manualmente
\dt  # Ver tablas
```

### Notificaciones no funcionan
- Verifica variables SMTP en Railway/Render dashboard
- Prueba el endpoint `/api/notificaciones/pruebas/email`
- Revisa logs para errores específicos

---

## 💡 Consejos Finales

1. **Siempre usa HTTPS en producción** (automático en Vercel/Railway/Render)
2. **Genera JWT_SECRET nuevo** para producción (nunca uses el de desarrollo)
3. **Configura backups automáticos** de la base de datos
4. **Monitorea logs** regularmente para detectar errores
5. **Usa variables de entorno** para todo lo sensible (nunca hardcodear)
6. **Prueba la PWA** después del deploy en diferentes dispositivos
7. **Configura dominios custom** para una imagen más profesional

---

## 📞 Soporte

Si tienes problemas con el deploy:
1. Revisa los logs primero
2. Verifica que todas las variables de entorno estén configuradas
3. Consulta la documentación oficial de cada plataforma
4. Contacta al equipo de desarrollo

---

**¡Éxito con el deploy! 🚀**
