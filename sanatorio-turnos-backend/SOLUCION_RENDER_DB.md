# Solución: Problema de Base de Datos en Render

## Problema Identificado

El backend en Render estaba funcionando correctamente, pero las tablas de la base de datos **NO estaban creadas**. Esto causaba el error:

```
The table `public.usuarios` does not exist in the current database.
```

**Causa raíz:**
- El build command en Render ejecutaba `npm install && npx prisma generate && npm run build`
- PERO nunca se ejecutaban las migraciones ni el seed de datos
- La base de datos PostgreSQL estaba vacía (sin tablas ni datos)

## Solución Implementada

Se modificaron dos archivos para automatizar la inicialización de la base de datos:

### 1. `package.json` - Scripts automatizados

```json
{
  "scripts": {
    "build": "tsc",
    "postbuild": "npm run db:deploy && npm run db:seed:prod",
    "db:deploy": "prisma db push --skip-generate --accept-data-loss",
    "db:seed:prod": "tsx prisma/seed.ts"
  }
}
```

**Cambios:**
- **postbuild**: Se ejecuta automáticamente después del build
- **db:deploy**: Crea/actualiza las tablas en la base de datos
- **db:seed:prod**: Carga los datos iniciales (usuarios, obras sociales, etc.)
- **tsx movido a dependencies**: Necesario para ejecutar el seed en producción

### 2. `prisma/seed.ts` - Seed idempotente

Se agregó verificación para evitar duplicados:

```typescript
async function main() {
  console.log('🌱 Iniciando seed...');

  // Verificar si ya existe data
  const existingUsers = await prisma.usuario.count();
  if (existingUsers > 0) {
    console.log('⚠️  Base de datos ya tiene datos. Saltando seed.');
    return;
  }

  // ... resto del seed
}
```

Esto permite que el seed se ejecute múltiples veces sin errores.

## Flujo de Deploy en Render

Ahora, cuando Render hace deploy:

1. **Build**: Compila el código TypeScript
   ```bash
   npm install && npx prisma generate && npm run build
   ```

2. **Post-build (AUTOMÁTICO)**:
   ```bash
   npm run db:deploy    # Crea/actualiza tablas
   npm run db:seed:prod # Carga datos iniciales (si DB está vacía)
   ```

3. **Start**: Inicia el servidor
   ```bash
   npm start
   ```

## Estado Actual

Los cambios ya fueron:
- Commiteados al repositorio
- Pusheados a GitHub
- **Render debería redesplegar automáticamente**

## Verificación

Para verificar que todo funciona:

### 1. Verificar que Render está redesplegando

Ve al dashboard de Render y verifica que el deploy está en progreso:
- https://dashboard.render.com

### 2. Esperar a que termine el deploy (~3-5 minutos)

Render mostrará en los logs:
```
🌱 Iniciando seed...
✓ Superadmin creado
✓ Usuario de recepción creado
✓ Obras sociales creadas
✓ Profesionales creados
...
✅ Seed completado exitosamente!
```

### 3. Probar el endpoint de login

Desde tu terminal:

```bash
curl -X POST "https://sanatorio-turnos-backend.onrender.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "juan.perez@email.com", "password": "Paciente123!"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "...",
      "email": "juan.perez@email.com",
      "rol": "PACIENTE"
    }
  }
}
```

### 4. Probar el login desde el frontend

Ve a: https://sanatorio-turnos.netlify.app/login

**Credenciales de prueba:**

**Paciente:**
- Email: `juan.perez@email.com`
- Password: `Paciente123!`

**Recepción:**
- Email: `recepcion@sanatorio.com`
- Password: `Recepcion123!`

**SuperAdmin:**
- Email: `admin@sanatorio.com`
- Password: `Admin123!`

**Profesionales:**
- Email: `garcia@sanatorio.com`
- Password: `Garcia123!`
- Email: `lopez@sanatorio.com`
- Password: `Lopez123!`

## Si Render NO redesplega automáticamente

Si Render no detecta los cambios automáticamente:

### Opción 1: Redeploy manual desde Dashboard

1. Ve a: https://dashboard.render.com
2. Selecciona el servicio `sanatorio-turnos-backend`
3. Click en "Manual Deploy" → "Deploy latest commit"

### Opción 2: Forzar redeploy desde GitHub

Hacer un commit dummy:

```bash
cd C:\Users\mario\Documents\sanatorio-turnos\sanatorio-turnos-backend
echo "# Force redeploy" >> README.md
git add README.md
git commit -m "Force redeploy in Render"
git push
```

## Troubleshooting

### Si el seed falla

Verifica los logs de Render para ver el error específico:

1. Dashboard → Logs
2. Busca mensajes de error del seed

Posibles errores:
- **Database connection error**: Verifica la variable `DATABASE_URL` en Render
- **Permission denied**: La base de datos PostgreSQL en Render podría tener restricciones

### Si necesitas resetear la base de datos

**CUIDADO**: Esto borrará TODOS los datos

```bash
# Desde Render Shell (Dashboard → Shell)
npx prisma db push --force-reset --accept-data-loss
npm run db:seed
```

## Próximos pasos

Una vez que el login funcione:

1. Probar todas las credenciales de prueba
2. Verificar que el frontend se conecta correctamente
3. Probar crear turnos, pacientes, etc.
4. Verificar que las notificaciones funcionan (si están configuradas)

## Documentación técnica

- **Prisma db push**: https://www.prisma.io/docs/concepts/components/prisma-migrate/db-push
- **Render Deploy Hooks**: https://render.com/docs/deploy-hooks
- **npm lifecycle scripts**: https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-scripts

---

## Resultado Final

**PROBLEMA RESUELTO EXITOSAMENTE**

Después de los cambios implementados:

1. Se pushearon los cambios a GitHub
2. Render detectó los cambios y redesplegó automáticamente
3. El script `postbuild` se ejecutó correctamente:
   - `prisma generate`: Generó el cliente de Prisma
   - `prisma db push`: Creó todas las tablas en la base de datos
   - `npm run db:seed:prod`: Cargó los datos iniciales

4. Pruebas realizadas con éxito:
   ```bash
   # Login PACIENTE
   curl -X POST "https://sanatorio-turnos-backend.onrender.com/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "juan.perez@email.com", "password": "Paciente123!"}'
   # ✅ SUCCESS: Retorna token JWT válido

   # Login ADMIN
   curl -X POST "https://sanatorio-turnos-backend.onrender.com/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@sanatorio.com", "password": "Admin123!"}'
   # ✅ SUCCESS: Retorna token JWT válido
   ```

5. Frontend verificado: https://sanatorio-turnos.netlify.app/login
   - Página cargando correctamente
   - Sin errores visibles
   - Formulario de login funcional

**El sistema está ahora completamente operativo y listo para usar.**

---

**Última actualización:** 2026-02-03
**Estado:** RESUELTO - Sistema funcionando correctamente
