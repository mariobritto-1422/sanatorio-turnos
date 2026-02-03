# Configuración de Variables de Entorno en Netlify

## Problema Resuelto

La aplicación en producción no puede conectarse al backend porque falta la variable de entorno `NEXT_PUBLIC_API_URL`.

## Solución: Configurar la Variable en Netlify

### Paso 1: Obtener la URL del Backend

Primero necesitas la URL de tu backend desplegado en Render:

1. Ve a tu dashboard de Render: https://dashboard.render.com
2. Busca tu servicio de backend (probablemente llamado "sanatorio-turnos-backend")
3. Copia la URL del servicio (formato: `https://tu-backend.onrender.com`)

### Paso 2: Configurar en Netlify

1. Ve a tu dashboard de Netlify: https://app.netlify.com/sites/sanatorio-turnos
2. Navega a **Site settings** (Configuración del sitio)
3. En el menú lateral, selecciona **Environment variables** (Variables de entorno)
4. Click en **Add a variable** (Agregar variable)
5. Configura:
   - **Key (Clave)**: `NEXT_PUBLIC_API_URL`
   - **Values (Valores)**: La URL de tu backend en Render
   - **Scopes (Alcance)**: Selecciona "All deploy contexts" o al menos "Production"

Ejemplo:
```
Key: NEXT_PUBLIC_API_URL
Value: https://sanatorio-turnos-backend.onrender.com
```

6. Click en **Save** (Guardar)

### Paso 3: Redeployar el Sitio

Después de configurar la variable, necesitas redeployar:

1. Ve a **Deploys** en el dashboard de Netlify
2. Click en **Trigger deploy** > **Deploy site**
3. Espera a que termine el deploy (2-3 minutos)

### Paso 4: Verificar

1. Abre tu sitio: https://sanatorio-turnos.netlify.app
2. Abre las herramientas de desarrollo del navegador (F12)
3. Ve a la pestaña **Console**
4. Intenta hacer login o cualquier acción que conecte al backend
5. Si ves errores de "localhost:4000" o "NEXT_PUBLIC_API_URL is undefined", la variable no se configuró correctamente

## Preview Deployments

Si usas preview deployments (para pull requests), también necesitas:

1. En Netlify, asegúrate que la variable esté disponible en "All deploy contexts"
2. O agrega la variable específicamente para "Deploy previews"

## Variables Configuradas Actualmente

Después de seguir estos pasos, deberías tener:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
```

## Troubleshooting

### Error: "Cannot connect to backend"
- Verifica que la URL del backend esté correcta (con https://)
- Verifica que el backend esté funcionando (abre la URL en el navegador, deberías ver un JSON)
- Verifica que la variable esté bien escrita: `NEXT_PUBLIC_API_URL` (respeta mayúsculas)

### Error: CORS
- Si el backend responde pero hay error de CORS, verifica que el backend tenga configurado el origen de Netlify
- El backend ya está configurado para aceptar `https://sanatorio-turnos.netlify.app`
- Si cambias el dominio, actualiza también el backend

### La variable no se aplica
- Asegúrate de haber redeployado después de agregar la variable
- Las variables NO se aplican retroactivamente a deployments existentes
- Puedes forzar un redeploy desde la pestaña "Deploys"

## Desarrollo Local

Para desarrollo local, crea un archivo `.env.local` en la carpeta `sanatorio-turnos-frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Este archivo NO debe subirse a Git (ya está en .gitignore).

## Más Información

- Documentación de Netlify sobre variables de entorno: https://docs.netlify.com/environment-variables/overview/
- El archivo `.env.example` muestra todas las variables necesarias

---

**Fecha de creación**: 2026-02-03
**Estado**: Pendiente de configuración por el usuario
