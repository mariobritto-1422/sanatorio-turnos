# Configuración de Netlify - Sanatorio Turnos

## URLs del Proyecto

- **Sitio en producción**: https://sanatorio-turnos.netlify.app/
- **Repositorio GitHub**: https://github.com/mariobritto-1422/sanatorio-turnos
- **Dashboard Netlify**: https://app.netlify.com/sites/sanatorio-turnos

## Ruta del Proyecto Local

```
C:\Users\mario\Documents\sanatorio-turnos
```

## Configuración Aplicada

### netlify.toml (raíz del proyecto)
```toml
[build]
  base = "sanatorio-turnos-frontend"
  command = "npm run build"
  publish = "out"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### next.config.js (frontend)
- `output: 'export'` - Exportación estática
- `trailingSlash: true` - URLs con trailing slash
- `images: { unoptimized: true }` - Imágenes sin optimización

### Archivos importantes
- `sanatorio-turnos-frontend/public/_redirects` - Redirecciones para SPA

## Solución del Error 404

El error 404 se resolvió removiendo el plugin `@netlify/plugin-nextjs` (incompatible con exportación estática) y agregando las redirecciones correctas en `netlify.toml`.

## Comandos Útiles

```bash
# Navegar al proyecto
cd C:\Users\mario\Documents\sanatorio-turnos

# Ver cambios
git status

# Subir cambios
git add .
git commit -m "descripción"
git push

# Trabajar en el frontend
cd sanatorio-turnos-frontend
npm run dev
```

---
**Fecha de configuración**: 2026-02-03
**Estado**: ✅ Funcionando correctamente
