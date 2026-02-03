# 🔧 Configurar Variable de Entorno en Netlify

## ⚠️ ACCIÓN REQUERIDA

Para que la aplicación funcione correctamente en producción, debes configurar la variable de entorno que conecta el frontend con el backend.

## 📝 Pasos para Configurar en Netlify

### 1. Acceder a la Configuración de Variables

1. Ve a: https://app.netlify.com/sites/sanatorio-turnos/configuration/env
2. O navega desde el dashboard:
   - Dashboard de Netlify
   - Selecciona el sitio "sanatorio-turnos"
   - Click en "Site configuration"
   - Click en "Environment variables"

### 2. Agregar la Variable

Haz clic en **"Add a variable"** o **"Add environment variable"**

**Configuración:**
```
Key:   NEXT_PUBLIC_API_URL
Value: https://sanatorio-turnos-backend.onrender.com/api
```

**⚠️ IMPORTANTE:**
- El nombre debe ser EXACTAMENTE `NEXT_PUBLIC_API_URL` (case-sensitive)
- La URL debe terminar con `/api`
- No incluyas espacios ni comillas

### 3. Scope (Alcance)

Selecciona:
- ✅ **Production** (obligatorio)
- ✅ **Deploy Previews** (recomendado)
- ✅ **Branch deploys** (recomendado)

### 4. Guardar

Haz clic en **"Create variable"** o **"Save"**

### 5. Redeploy el Sitio

**Método A - Desde Dashboard:**
1. Ve a: https://app.netlify.com/sites/sanatorio-turnos/deploys
2. Click en "Trigger deploy" → "Deploy site"

**Método B - Haciendo un Push:**
```bash
# Cualquier cambio en GitHub activará un nuevo deploy
git commit --allow-empty -m "Trigger redeploy"
git push
```

### 6. Verificar

1. Espera 2-3 minutos a que termine el deploy
2. Abre: https://sanatorio-turnos.netlify.app/
3. Abre la consola del navegador (F12)
4. Ve a la pestaña "Network"
5. Intenta hacer login
6. Verifica que las peticiones vayan a `https://sanatorio-turnos-backend.onrender.com/api`

## 🔍 Troubleshooting

### La variable no se aplica

- Verifica que el nombre sea exactamente `NEXT_PUBLIC_API_URL`
- Asegúrate de haber hecho un redeploy después de agregar la variable
- Las variables de entorno solo se aplican en nuevos builds

### Sigue dando error 404

1. Verifica que el backend esté funcionando:
   - Abre en tu navegador: https://sanatorio-turnos-backend.onrender.com/api/health
   - Debería responder con algo (no 404)

2. Verifica la URL completa:
   - Debe incluir `/api` al final
   - No debe tener espacios

### Error de CORS

Si ves errores de CORS en la consola:
1. El backend debe estar configurado para aceptar peticiones desde Netlify
2. Ya se configuró en el código, solo verifica que el backend esté desplegado

## ✅ Resultado Esperado

Una vez configurado correctamente:
- El login funcionará
- Podrás acceder con las credenciales de prueba
- Todas las funcionalidades de la app estarán disponibles

## 📋 URL del Backend

**Producción:** https://sanatorio-turnos-backend.onrender.com/api

Si cambias el backend a otra plataforma en el futuro, recuerda actualizar esta variable.

---

**Fecha:** 2026-02-03
**Backend:** Render
**Frontend:** Netlify
