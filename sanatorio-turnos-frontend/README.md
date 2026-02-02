# 🏥 Frontend - Sistema de Turnos (Interfaz Pacientes)

Interfaz ULTRA-ACCESIBLE para pacientes con capacidades cognitivas limitadas.

## ✨ Características de Accesibilidad

- ✅ **Botones gigantes** (mínimo 80px altura)
- ✅ **Tipografía grande** (mínimo 20px)
- ✅ **Alto contraste** (WCAG AAA)
- ✅ **Íconos + texto** siempre juntos
- ✅ **Máximo 2-3 opciones** por pantalla
- ✅ **Sin scroll horizontal**
- ✅ **Colores suaves** no agresivos
- ✅ **Feedback visual claro** en todas las acciones

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

## 📱 Flujo de Usuario (3 Pantallas)

### 1. Pantalla de Inicio
- Login simple con código de paciente
- Botón gigante: "PEDIR TURNO"
- Botón secundario: "VER MIS TURNOS"

### 2. Elegir Profesional
- Grilla de tarjetas con foto grande + nombre
- Máximo 6 profesionales por pantalla
- Botón "VOLVER" siempre visible

### 3. Elegir Fecha y Hora
- Calendario visual simple
- Solo días disponibles seleccionables
- Horarios como botones grandes
- Confirmación con pantalla verde de éxito

## 🎨 Componentes Principales

```
src/components/ui/
├── BotonGigante.tsx          # Botón accesible (80px altura)
├── TarjetaProfesional.tsx    # Card de profesional con foto
├── TarjetaTurno.tsx          # Card de turno con toda la info
├── Header.tsx                # Header con botón volver
└── Loading.tsx               # Spinner de carga
```

## 📂 Estructura de Páginas

```
src/app/
├── page.tsx                           # Inicio (2 botones)
├── login/page.tsx                     # Login simple
├── paciente/
│   ├── nuevo-turno/
│   │   ├── page.tsx                   # Elegir profesional
│   │   ├── fecha/page.tsx             # Elegir fecha/hora
│   │   └── confirmacion/page.tsx      # Pantalla de éxito
│   └── mis-turnos/page.tsx            # Listado de turnos
```

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Colores Personalizados

Los colores se configuran en `tailwind.config.ts`:

```ts
primary: {
  500: '#0ea5e9',  // Azul suave principal
}
success: {
  500: '#22c55e',  // Verde de confirmación
}
danger: {
  500: '#ef4444',  // Rojo de cancelación
}
```

## 🧪 Testing

### Credenciales de Prueba

```
Código: juan.perez
Password: Paciente123!
```

### Flujo de Testing

1. Ingresar con código de prueba
2. Click en "PEDIR TURNO"
3. Elegir Dr. García o Dra. López
4. Seleccionar día y hora
5. Confirmar turno
6. Ver pantalla de éxito verde ✓

## 📐 Principios de Diseño

### 1. Simplicidad Extrema
- Una acción por pantalla
- Navegación lineal (no laberintos)
- Sin opciones ocultas

### 2. Visual Primero
- Íconos grandes en todos los botones
- Feedback visual inmediato
- Colores para indicar estados

### 3. Tolerancia a Errores
- Confirmaciones antes de acciones críticas
- Mensajes de error claros y grandes
- Botón "VOLVER" siempre visible

### 4. Consistencia
- Mismos botones en todo el flujo
- Mismos colores para mismas acciones
- Mismo layout en todas las pantallas

## 🎯 Mejores Prácticas Implementadas

✅ Focus visible para navegación con teclado
✅ ARIA labels en todos los botones
✅ Contraste AAA en todos los textos
✅ Tamaños táctiles mínimos de 44x44px
✅ Sin timeouts que presionen al usuario
✅ Feedback en cada acción

## 🚀 Próximas Mejoras

- [ ] PWA (instalable en home screen)
- [ ] Notificaciones push
- [ ] Modo sin conexión
- [ ] Lector de QR para identificación
- [ ] Fotos reales de profesionales
- [ ] Audio asistencia (leer en voz alta)

## 📱 Compatibilidad

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Móviles iOS: ✅
- Móviles Android: ✅

## 🆘 Problemas Comunes

### Error de conexión con API
```bash
# Verificar que el backend esté corriendo
curl http://localhost:4000/api/health

# Verificar .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Login no funciona
```bash
# Verificar que existe el usuario en el backend
# Usuario de prueba: juan.perez@email.com / Paciente123!
```

---

Desarrollado con ❤️ pensando en la accesibilidad cognitiva
