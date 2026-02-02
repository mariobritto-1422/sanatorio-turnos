# 👨‍⚕️ INTERFAZ PARA PROFESIONALES

Interfaz completa y funcional para que los profesionales gestionen su agenda y pacientes.

## ✨ Características

### 📊 Dashboard
- **Agenda del día** con vista de todos los turnos
- **Estadísticas rápidas**: turnos totales, pendientes, completados
- **Navegación por fechas** (día anterior/siguiente/hoy)
- **Click en turno** abre ficha del paciente
- **Vista semanal** de todos los turnos

### 👥 Gestión de Pacientes
- **Buscador potente**: por nombre, apellido o DNI
- **Tabla completa** con todos los pacientes del sanatorio
- **Ficha del paciente** con:
  - Datos personales completos
  - Obra social y número de afiliado
  - Observaciones médicas (alergias, etc.)
  - Historial de turnos (últimos 10)
  - Botón para agregar notas

### 📈 Estadísticas Propias
- **Selector de período**: Esta semana / Este mes
- **Métricas clave**:
  - Total de turnos
  - Turnos completados (con porcentaje)
  - Turnos cancelados
  - Ausentes (tasa de ausentismo)
- **Gráfico de actividad**: Turnos por día con barras visuales
- **Resumen**: Promedio diario, tasas de completados y ausentismo

### ⚙️ Configuración
- **Horarios de atención**:
  - Agregar/eliminar horarios por día de la semana
  - Configurar hora inicio y fin
  - Vista de todos los horarios activos
- **Bloqueos de horario**:
  - Vacaciones, licencias, congresos
  - Fecha inicio y fin
  - Motivo del bloqueo
  - Vista de todos los bloqueos activos

## 🎨 Componentes Creados

### 1. Sidebar
```tsx
<Sidebar />
```
- Navegación principal con íconos
- Perfil del profesional
- Logout

### 2. TarjetaTurnoProfesional
```tsx
<TarjetaTurnoProfesional
  turno={turno}
  onClick={handleClick}
/>
```
- Muestra hora, paciente, teléfono, obra social
- Estado visual con colores
- Nota simple si existe

### 3. TablaTurnos
```tsx
<TablaTurnos
  turnos={turnos}
  onClickTurno={handleClick}
/>
```
- Tabla completa de turnos
- Columnas: Hora, Paciente, Contacto, Tipo, Estado, Nota
- Hover interactivo

### 4. FichaPaciente
```tsx
<FichaPaciente
  paciente={paciente}
  turnos={historial}
  onClose={handleClose}
  onAgregarNota={handleNota}
/>
```
- Modal fullscreen
- Datos completos del paciente
- Historial de turnos
- Botón agregar nota

## 📂 Estructura de Archivos

```
src/
├── app/profesional/
│   ├── layout.tsx                    # Layout con sidebar
│   ├── dashboard/page.tsx            # Agenda principal
│   ├── pacientes/page.tsx            # Gestión pacientes
│   ├── estadisticas/page.tsx         # Estadísticas
│   └── configuracion/page.tsx        # Horarios y bloqueos
│
└── components/profesional/
    ├── Sidebar.tsx                   # Navegación lateral
    ├── TarjetaTurnoProfesional.tsx   # Card de turno
    ├── TablaTurnos.tsx               # Tabla de turnos
    └── FichaPaciente.tsx             # Modal ficha
```

## 🔐 Autenticación

Solo usuarios con rol `PROFESIONAL` pueden acceder:

```tsx
// El layout verifica automáticamente
if (usuario?.rol !== 'PROFESIONAL') {
  router.push('/login');
}
```

## 🎯 Flujos Principales

### Flujo 1: Ver Agenda del Día
```
/profesional/dashboard
→ Ver todos los turnos del día
→ Click en turno → Abre ficha del paciente
→ Ver datos básicos + historial
→ Cerrar ficha
```

### Flujo 2: Buscar Paciente
```
/profesional/pacientes
→ Escribir nombre/DNI en buscador
→ Click "Buscar"
→ Ver resultados en tabla
→ Click "Ver Ficha"
→ Ver datos completos + historial
```

### Flujo 3: Ver Estadísticas
```
/profesional/estadisticas
→ Seleccionar período (Semana/Mes)
→ Ver métricas principales
→ Analizar gráfico de actividad por día
```

### Flujo 4: Configurar Horarios
```
/profesional/configuracion
→ Ver horarios actuales
→ Agregar nuevo horario (día, hora inicio/fin)
→ Guardar
→ Agregar bloqueo (fechas, motivo, tipo)
→ Guardar
```

## 🔄 Estados de Turnos

```typescript
PENDIENTE         → Amarillo
CONFIRMADO        → Verde
EN_CURSO          → Azul
COMPLETADO        → Gris
CANCELADO_PACIENTE → Rojo
CANCELADO_PROFESIONAL → Rojo
AUSENTE           → Rojo
```

## 💡 Tips de Uso

### Navegar entre días
- Usa los botones "← Día Anterior" / "Día Siguiente →"
- Botón "Hoy" para volver a la fecha actual

### Filtrar pacientes
- El buscador busca en: nombre, apellido y DNI
- Press Enter para buscar rápidamente

### Ver historial completo
- La ficha del paciente muestra los últimos 10 turnos
- Incluye fecha, tipo, estado y notas

## 🎨 Diseño

### Colores
- **Primary (Azul)**: Acciones principales, links
- **Green**: Turnos completados, éxito
- **Yellow**: Turnos pendientes, alertas
- **Red**: Cancelados, ausentes, eliminar
- **Gray**: Completados, información secundaria

### Tipografía
- Headers: 2xl-3xl, bold
- Subtítulos: xl, semibold
- Texto: base, regular
- Labels: sm, medium

### Espaciado
- Padding contenedor: 8 (32px)
- Gap entre secciones: 6-8 (24-32px)
- Gap entre elementos: 3-4 (12-16px)

## 🔧 Personalización

### Cambiar colores
Editar `tailwind.config.ts`:
```ts
colors: {
  primary: { ... },
  success: { ... },
  danger: { ... },
}
```

### Agregar columna a tabla
Editar `TablaTurnos.tsx`:
```tsx
<th>Nueva Columna</th>
// ...
<td>{turno.nuevoDato}</td>
```

## 🐛 Debugging

### Turno no aparece
1. Verificar fecha del turno
2. Verificar estado (cancelados no se muestran por defecto)
3. Verificar profesionalId en filtro

### Paciente no aparece en búsqueda
1. Verificar que el paciente exista en la BD
2. Verificar ortografía del nombre/DNI
3. Verificar que el paciente esté activo

## 📊 Próximas Mejoras

- [ ] Agregar notas por consulta (implementar endpoint)
- [ ] Exportar estadísticas a PDF
- [ ] Notificaciones de turnos próximos
- [ ] Vista de calendario mensual
- [ ] Filtros avanzados en pacientes
- [ ] Chat con recepción
- [ ] Videollamada integrada

---

**Estado:** ✅ INTERFAZ DE PROFESIONALES COMPLETA

**Listo para:** Pruebas con usuarios profesionales
