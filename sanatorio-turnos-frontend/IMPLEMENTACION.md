# 📋 GUÍA DE IMPLEMENTACIÓN - Frontend

## 🚀 Setup Inicial

### 1. Instalar Dependencias

```bash
cd sanatorio-turnos-frontend
npm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Iniciar el Servidor

```bash
npm run dev
```

Abrirá en: http://localhost:3000

## 📱 Estructura Creada

```
sanatorio-turnos-frontend/
├── src/
│   ├── app/                           # Pages (Next.js 14 App Router)
│   │   ├── layout.tsx                 # Layout global
│   │   ├── page.tsx                   # Inicio (2 botones)
│   │   ├── login/page.tsx             # Login simple
│   │   └── paciente/
│   │       ├── nuevo-turno/
│   │       │   ├── page.tsx           # Paso 1: Elegir profesional
│   │       │   ├── fecha/page.tsx     # Paso 2: Elegir fecha/hora
│   │       │   └── confirmacion/page.tsx  # Paso 3: Éxito
│   │       └── mis-turnos/page.tsx    # Ver turnos
│   ├── components/ui/                 # Componentes accesibles
│   │   ├── BotonGigante.tsx          # Botón principal
│   │   ├── TarjetaProfesional.tsx    # Card de profesional
│   │   ├── TarjetaTurno.tsx          # Card de turno
│   │   ├── Header.tsx                # Header con volver
│   │   └── Loading.tsx               # Spinner
│   ├── lib/
│   │   ├── api.ts                    # Cliente API
│   │   ├── store.ts                  # Estado (Zustand)
│   │   └── utils.ts                  # Utilidades
│   └── styles/
│       └── globals.css               # Estilos accesibles
├── public/
├── package.json
├── tailwind.config.ts                # Config de Tailwind
├── tsconfig.json
└── next.config.js
```

## 🎨 Componentes Creados

### 1. BotonGigante
Botón ultra-accesible con variantes de color.

```tsx
<BotonGigante
  icon={Calendar}
  variant="primary"
  onClick={handleClick}
>
  PEDIR TURNO
</BotonGigante>
```

**Variantes:**
- `primary` - Azul (acción principal)
- `success` - Verde (confirmación)
- `danger` - Rojo (cancelación)
- `secondary` - Blanco con borde (acción secundaria)

### 2. TarjetaProfesional
Tarjeta con foto grande y datos del profesional.

```tsx
<TarjetaProfesional
  profesional={profesional}
  onClick={() => seleccionar(profesional.id)}
/>
```

### 3. TarjetaTurno
Muestra todos los detalles del turno.

```tsx
<TarjetaTurno
  turno={turno}
  onCancelar={() => cancelar(turno.id)}
/>
```

### 4. Header
Cabecera con título y botón volver.

```tsx
<Header
  titulo="Elegir Profesional"
  mostrarVolver
/>
```

### 5. Loading
Spinner de carga grande y visible.

```tsx
<Loading mensaje="Cargando profesionales..." />
```

## 🔄 Flujo Completo

### Paso 1: Login
```
/login
└─> Ingresa código → Autentica → Redirige a /
```

### Paso 2: Inicio
```
/
├─> PEDIR TURNO → /paciente/nuevo-turno
└─> VER MIS TURNOS → /paciente/mis-turnos
```

### Paso 3: Nuevo Turno
```
/paciente/nuevo-turno
└─> Elegir profesional → /paciente/nuevo-turno/fecha?profesional=ID
    └─> Elegir fecha y hora → Confirmar
        └─> /paciente/nuevo-turno/confirmacion
            └─> Auto-redirige a / en 10 segundos
```

## 🎯 Features Implementadas

### ✅ Accesibilidad
- Botones mínimo 80px de altura
- Tipografía mínimo 20px
- Contraste WCAG AAA
- Íconos grandes (48px) en botones
- Focus visible para teclado
- ARIA labels en todos los interactivos

### ✅ UX Simple
- Máximo 3 opciones por pantalla
- Navegación lineal (no laberintos)
- Botón "VOLVER" siempre visible
- Feedback visual en cada acción
- Confirmación antes de cancelar

### ✅ Colores Suaves
- Azul suave para acciones principales
- Verde para confirmaciones
- Rojo suave para cancelaciones
- Sin colores agresivos o saturados

### ✅ Responsive
- Mobile first
- Sin scroll horizontal
- Touch targets mínimo 44x44px
- Pruebas en iOS y Android

## 🔧 Configuración de Tailwind

Los tamaños y colores están preconfigurados:

```ts
fontSize: {
  'xxl': '1.75rem',    // 28px
  'xxxl': '2rem',      // 32px
  'huge': '2.5rem',    // 40px
  'massive': '3rem',   // 48px
}

colors: {
  primary: { ... },    // Azul suave
  success: { ... },    // Verde
  danger: { ... },     // Rojo suave
}
```

## 📊 Estado de la Aplicación

Usa Zustand para estado global:

```ts
const { token, usuario, login, logout } = useAuthStore();
```

Se persiste en localStorage automáticamente.

## 🔌 Conexión con Backend

El cliente API está en `src/lib/api.ts`:

```ts
// Login
const response = await api.login(email, password);

// Obtener profesionales
const response = await api.getProfesionales(token);

// Crear turno
const response = await api.createTurno(data, token);
```

## 🧪 Testing Manual

### 1. Login
1. Ir a http://localhost:3000
2. Ingresar código: `juan.perez`
3. Click "INGRESAR"
4. Debe redirigir a inicio

### 2. Pedir Turno
1. Click "PEDIR TURNO"
2. Ver lista de profesionales
3. Click en Dr. García
4. Seleccionar un día (no pasado)
5. Esperar carga de horarios
6. Seleccionar un horario
7. Click "CONFIRMAR TURNO"
8. Ver pantalla verde de éxito ✓

### 3. Ver Turnos
1. Volver al inicio
2. Click "VER MIS TURNOS"
3. Ver lista de turnos
4. Probar cancelar un turno

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de conexión con API
```bash
# Verificar que backend está corriendo
curl http://localhost:4000/api/health

# Verificar .env.local
cat .env.local
```

### Estilos no se aplican
```bash
# Reiniciar servidor
npm run dev
```

## 📈 Próximos Pasos

1. ✅ Frontend de pacientes (HECHO)
2. ⏭️ Interfaz de profesionales
3. ⏭️ Interfaz de recepción
4. ⏭️ Panel de administración
5. ⏭️ PWA (manifest + service worker)
6. ⏭️ Notificaciones push

## 💡 Tips de Desarrollo

### Añadir nueva página
1. Crear archivo en `src/app/nueva-ruta/page.tsx`
2. Exportar componente por defecto
3. Ya funciona con routing automático

### Añadir nuevo componente
1. Crear en `src/components/`
2. Usar `'use client'` si tiene interactividad
3. Importar donde se necesite

### Modificar colores
Editar `tailwind.config.ts` en la sección `colors`.

### Añadir llamada a API
Agregar método en `src/lib/api.ts` siguiendo el patrón existente.

---

**Estado Actual:** ✅ INTERFAZ DE PACIENTES COMPLETA Y FUNCIONAL

**Listo para:** Pruebas con usuarios reales
