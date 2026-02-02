# 📱 Guía para Generar Íconos PWA

Los íconos son necesarios para que la PWA se vea correctamente al instalarse en dispositivos móviles y desktop.

## 🎨 Tamaños Necesarios

Debes crear íconos en estos tamaños y colocarlos en `public/icons/`:

### Requeridos
- ✅ **icon-16x16.png** - Favicon pequeño
- ✅ **icon-32x32.png** - Favicon estándar
- ✅ **icon-72x72.png** - Android pequeño
- ✅ **icon-96x96.png** - Android/Chrome
- ✅ **icon-128x128.png** - Chrome Web Store
- ✅ **icon-144x144.png** - Microsoft tiles
- ✅ **icon-152x152.png** - iOS iPad
- ✅ **icon-180x180.png** - iOS iPhone
- ✅ **icon-192x192.png** - Android estándar
- ✅ **icon-384x384.png** - Android splash
- ✅ **icon-512x512.png** - Android alta resolución

### Opcionales (Shortcuts)
- shortcut-turno.png (96x96)
- shortcut-agenda.png (96x96)
- shortcut-dashboard.png (96x96)

### Opcionales (Screenshots)
- screenshots/desktop-1.png (1280x720)
- screenshots/mobile-1.png (750x1334)

---

## ⚡ Opción 1: Herramienta Automática (RECOMENDADO)

### Usando PWA Asset Generator

```bash
# 1. Instalar la herramienta globalmente
npm install -g pwa-asset-generator

# 2. Crear un logo base (1024x1024 px, PNG con fondo transparente)
# Guardarlo como: logo.png

# 3. Generar todos los íconos automáticamente
pwa-asset-generator logo.png public/icons/ \
  --icon-only \
  --background "#0EA5E9" \
  --padding "10%"

# Esto generará TODOS los tamaños necesarios automáticamente
```

**Ventajas:**
- ✅ Genera todos los tamaños en segundos
- ✅ Nombres correctos automáticamente
- ✅ Optimiza los PNG
- ✅ Agrega padding si lo necesitas

---

## 🛠️ Opción 2: Herramientas Online

### 1. RealFaviconGenerator
**URL:** https://realfavicongenerator.net/

**Pasos:**
1. Sube tu logo (mínimo 260x260 px)
2. Configura las opciones:
   - iOS: Background color #0EA5E9
   - Android: Background color #0EA5E9
   - Windows: Background color #0EA5E9
3. Genera y descarga
4. Copia los archivos a `public/icons/`

---

### 2. PWA Image Generator
**URL:** https://www.pwabuilder.com/imageGenerator

**Pasos:**
1. Sube tu logo (512x512 px o más)
2. Click "Download"
3. Descomprime el ZIP
4. Copia los archivos a `public/icons/`

---

### 3. Favicon.io
**URL:** https://favicon.io/

**Opciones:**
- Generar desde imagen
- Generar desde texto
- Generar desde emoji

---

## 🎨 Opción 3: Photoshop/GIMP (Manual)

Si quieres hacerlo manualmente:

1. **Crea tu logo en 1024x1024 px**
2. **Exporta en los tamaños necesarios:**
   - File → Export → Export As
   - Para cada tamaño:
     - Selecciona PNG-24
     - Ajusta el tamaño
     - Guarda con el nombre correcto (ej: icon-192x192.png)

---

## 🚀 Opción Rápida: Usar Lucide Icons

Si no tienes un logo todavía, puedes usar un ícono temporal:

```bash
cd sanatorio-turnos-frontend

# Instalar sharp para procesar imágenes
npm install -D sharp

# Crear script temporal (crear-iconos.js)
```

**crear-iconos.js:**
```javascript
const sharp = require('sharp');
const fs = require('fs');

// Crear directorio si no existe
if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons', { recursive: true });
}

const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

// SVG simple del ícono médico
const svgIcon = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#0EA5E9"/>
  <path d="M256 128 L256 384 M128 256 L384 256" stroke="white" stroke-width="48" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="96" fill="none" stroke="white" stroke-width="32"/>
</svg>
`;

// Generar todos los tamaños
Promise.all(
  sizes.map(size =>
    sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`)
  )
).then(() => {
  console.log('✅ Íconos generados correctamente!');
});
```

```bash
# Ejecutar
node crear-iconos.js

# Limpiar
rm crear-iconos.js
npm uninstall sharp
```

---

## ✅ Verificar que Funciona

Después de generar los íconos:

1. **Verifica que existan:**
```bash
ls -la public/icons/
# Deberías ver todos los archivos icon-*.png
```

2. **Prueba en el navegador:**
```bash
npm run dev
```

3. **Abre DevTools:**
   - Application tab
   - Manifest
   - Verifica que los íconos aparezcan correctamente

4. **Prueba la instalación:**
   - Chrome: Click en el ícono de instalación (⊕)
   - Verifica que el ícono se vea bien en la ventana de instalación

---

## 🎯 Recomendaciones de Diseño

### Para el Logo:
- ✅ **Fondo sólido** (no transparente para íconos) - Color #0EA5E9
- ✅ **Diseño simple** y reconocible
- ✅ **Alto contraste** con el fondo
- ✅ **Evita texto pequeño** (no se lee en tamaños pequeños)
- ✅ **Forma cuadrada** o circular
- ✅ **Padding interno** de 10-15% para evitar recortes

### Colores Recomendados:
- **Primary:** #0EA5E9 (Sky 500) - Color de marca
- **Texto:** #FFFFFF (Blanco) - Para contraste
- **Acento:** #10B981 (Green 500) - Para detalles

---

## 🐛 Problemas Comunes

### Los íconos no aparecen
- Verifica que estén en `public/icons/`
- Verifica los nombres exactos en `manifest.json`
- Limpia la caché del navegador
- Desinstala y reinstala la PWA

### Los íconos se ven pixelados
- Usa PNG de alta calidad
- Asegúrate de generar desde un logo de 1024x1024 o más
- No escales hacia arriba, siempre hacia abajo

### El ícono tiene fondo blanco en iOS
- iOS no soporta transparencia
- Usa un fondo sólido en los íconos
- Especifica `background_color` en manifest.json

---

## 📚 Recursos Adicionales

- **Guía oficial de Google:** https://web.dev/add-manifest/
- **PWA Builder:** https://www.pwabuilder.com/
- **Mask Icons:** https://developer.apple.com/design/human-interface-guidelines/app-icons

---

**¡Listo! Ya tienes los íconos para tu PWA** ✨
