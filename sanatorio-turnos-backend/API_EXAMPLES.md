# 📡 Ejemplos de Uso de la API

## 🔑 Autenticación

### Login
```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "admin@sanatorio.com",
  "password": "Admin123!"
}

# Respuesta:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "uuid",
      "email": "admin@sanatorio.com",
      "rol": "SUPERADMIN"
    }
  }
}
```

### Obtener Perfil
```bash
GET http://localhost:4000/api/auth/profile
Authorization: Bearer TU_TOKEN_AQUI
```

## 👥 Pacientes

### Listar Pacientes
```bash
GET http://localhost:4000/api/pacientes?page=1&limit=20&search=perez
Authorization: Bearer TU_TOKEN
```

### Obtener Paciente por ID
```bash
GET http://localhost:4000/api/pacientes/UUID_DEL_PACIENTE
Authorization: Bearer TU_TOKEN
```

### Buscar por DNI
```bash
GET http://localhost:4000/api/pacientes/dni/30123456
Authorization: Bearer TU_TOKEN
```

### Crear Paciente (sin login)
```bash
POST http://localhost:4000/api/pacientes
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "dni": "35123456",
  "nombre": "María",
  "apellido": "Fernández",
  "fechaNacimiento": "1992-05-15",
  "genero": "FEMENINO",
  "telefono": "11-2345-6789",
  "email": "maria.fernandez@email.com",
  "direccion": "Av. Santa Fe 1234",
  "localidad": "CABA",
  "provincia": "Buenos Aires",
  "obraSocialId": "UUID_DE_OBRA_SOCIAL",
  "numeroAfiliado": "123456/01"
}
```

### Crear Paciente CON login
```bash
POST http://localhost:4000/api/pacientes
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "dni": "36987654",
  "nombre": "Pedro",
  "apellido": "Gómez",
  "fechaNacimiento": "1995-08-20",
  "genero": "MASCULINO",
  "telefono": "11-9876-5432",
  "email": "pedro.gomez@email.com",
  "direccion": "Corrientes 567",
  "localidad": "CABA",
  "provincia": "Buenos Aires",
  "obraSocialId": "UUID_DE_OBRA_SOCIAL",
  "numeroAfiliado": "987654/01",
  "usuarioEmail": "pedro.gomez@email.com",
  "usuarioPassword": "Pedro123!"
}
```

### Actualizar Paciente
```bash
PUT http://localhost:4000/api/pacientes/UUID_DEL_PACIENTE
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "telefono": "11-9999-8888",
  "direccion": "Nueva Dirección 999"
}
```

## 👨‍⚕️ Profesionales

### Listar Profesionales
```bash
GET http://localhost:4000/api/profesionales
Authorization: Bearer TU_TOKEN
```

### Crear Profesional
```bash
POST http://localhost:4000/api/profesionales
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "usuarioEmail": "dra.martinez@sanatorio.com",
  "usuarioPassword": "Martinez123!",
  "nombre": "Laura",
  "apellido": "Martínez",
  "matricula": "MN-11111",
  "especialidad": "Psicología",
  "telefono": "11-4444-5555",
  "email": "dra.martinez@sanatorio.com",
  "duracionTurnoMinutos": 50,
  "colorCalendario": "#10B981",
  "aceptaNuevosPacientes": true,
  "bio": "Psicóloga especializada en terapia familiar",
  "obrasSocialesIds": ["UUID_OSDE", "UUID_SWISS"]
}
```

### Obtener Horarios de Profesional
```bash
GET http://localhost:4000/api/profesionales/UUID_PROFESIONAL/horarios
Authorization: Bearer TU_TOKEN
```

### Crear Horario
```bash
POST http://localhost:4000/api/profesionales/horarios
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "profesionalId": "UUID_PROFESIONAL",
  "diaSemana": 1,
  "horaInicio": "09:00",
  "horaFin": "13:00"
}
```

Días de la semana:
- 0 = Domingo
- 1 = Lunes
- 2 = Martes
- 3 = Miércoles
- 4 = Jueves
- 5 = Viernes
- 6 = Sábado

## 📅 Turnos

### Consultar Disponibilidad
```bash
GET http://localhost:4000/api/turnos/disponibilidad?profesionalId=UUID&fecha=2024-03-15
Authorization: Bearer TU_TOKEN

# Respuesta:
{
  "success": true,
  "data": {
    "disponibles": [
      "2024-03-15T09:00:00.000Z",
      "2024-03-15T09:30:00.000Z",
      "2024-03-15T10:00:00.000Z",
      ...
    ]
  }
}
```

### Crear Turno
```bash
POST http://localhost:4000/api/turnos
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "pacienteId": "UUID_PACIENTE",
  "profesionalId": "UUID_PROFESIONAL",
  "fechaHora": "2024-03-15T10:00:00.000Z",
  "duracionMinutos": 45,
  "tipo": "PRIMERA_VEZ",
  "motivoConsulta": "Consulta inicial por ansiedad",
  "obraSocialId": "UUID_OBRA_SOCIAL"
}
```

Tipos de turno:
- `PRIMERA_VEZ`
- `CONTROL`
- `URGENCIA`

### Listar Turnos (con filtros)
```bash
# Todos los turnos del profesional en un rango
GET http://localhost:4000/api/turnos?profesionalId=UUID&desde=2024-03-01&hasta=2024-03-31
Authorization: Bearer TU_TOKEN

# Turnos de un paciente
GET http://localhost:4000/api/turnos?pacienteId=UUID
Authorization: Bearer TU_TOKEN

# Solo turnos pendientes
GET http://localhost:4000/api/turnos?estado=PENDIENTE
Authorization: Bearer TU_TOKEN
```

### Obtener Turno por ID
```bash
GET http://localhost:4000/api/turnos/UUID_TURNO
Authorization: Bearer TU_TOKEN
```

### Actualizar Turno
```bash
PUT http://localhost:4000/api/turnos/UUID_TURNO
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "estado": "CONFIRMADO",
  "notaSimple": "Paciente confirmó asistencia"
}
```

Estados de turno:
- `PENDIENTE`
- `CONFIRMADO`
- `EN_CURSO`
- `COMPLETADO`
- `CANCELADO_PACIENTE`
- `CANCELADO_PROFESIONAL`
- `AUSENTE`

### Cancelar Turno
```bash
POST http://localhost:4000/api/turnos/UUID_TURNO/cancelar
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "motivo": "El paciente solicitó cancelación por problemas personales"
}
```

## 🏥 Obras Sociales

### Listar Obras Sociales
```bash
GET http://localhost:4000/api/obras-sociales
Authorization: Bearer TU_TOKEN
```

### Crear Obra Social
```bash
POST http://localhost:4000/api/obras-sociales
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "nombre": "IOMA",
  "codigo": "IOMA",
  "plan": "Plan Estándar",
  "telefono": "0800-222-4662",
  "email": "contacto@ioma.gob.ar"
}
```

### Actualizar Obra Social
```bash
PUT http://localhost:4000/api/obras-sociales/UUID_OBRA_SOCIAL
Authorization: Bearer TU_TOKEN
Content-Type: application/json

{
  "telefono": "0800-999-9999"
}
```

## 🔐 Uso del Token JWT

Una vez que hagas login, recibirás un token. Úsalo en TODAS las peticiones:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQiLCJlbWFpbCI6ImFkbWluQHNhbmF0b3Jpby5jb20iLCJyb2wiOiJTVVBFUkFETUlOIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDE2MDAwMDB9.abcdefghijklmnopqrstuvwxyz
```

## 💡 Tips

1. **Usar Postman o Insomnia** para probar la API más fácilmente
2. **Importar como colección** todos estos ejemplos
3. **Guardar el token** en una variable de entorno en Postman
4. **Verificar los logs** del servidor si algo falla

## 🧪 Flujo Completo de Ejemplo

```bash
# 1. Login como admin
POST /api/auth/login
{ "email": "admin@sanatorio.com", "password": "Admin123!" }

# 2. Crear obra social
POST /api/obras-sociales
{ "nombre": "OSDE", "codigo": "OSDE" }

# 3. Crear profesional
POST /api/profesionales
{ ... datos del profesional ... }

# 4. Crear horarios del profesional
POST /api/profesionales/horarios
{ "profesionalId": "...", "diaSemana": 1, "horaInicio": "09:00", "horaFin": "17:00" }

# 5. Crear paciente
POST /api/pacientes
{ ... datos del paciente ... }

# 6. Consultar disponibilidad
GET /api/turnos/disponibilidad?profesionalId=XXX&fecha=2024-03-15

# 7. Crear turno
POST /api/turnos
{ "pacienteId": "...", "profesionalId": "...", "fechaHora": "..." }

# 8. Confirmar turno
PUT /api/turnos/UUID
{ "estado": "CONFIRMADO" }
```

---

¡Todo listo para empezar a usar la API! 🚀
