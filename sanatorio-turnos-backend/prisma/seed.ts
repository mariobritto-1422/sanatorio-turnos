import { PrismaClient, Rol, Genero, EstadoPaciente } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ============================================
  // 1. SUPERADMIN
  // ============================================
  const superadmin = await prisma.usuario.create({
    data: {
      email: 'admin@sanatorio.com',
      passwordHash: await bcrypt.hash('Admin123!', 10),
      rol: Rol.SUPERADMIN,
    },
  });
  console.log('✓ Superadmin creado');

  // ============================================
  // 2. RECEPCIÓN
  // ============================================
  const recepcion = await prisma.usuario.create({
    data: {
      email: 'recepcion@sanatorio.com',
      passwordHash: await bcrypt.hash('Recepcion123!', 10),
      rol: Rol.RECEPCION,
    },
  });
  console.log('✓ Usuario de recepción creado');

  // ============================================
  // 3. OBRAS SOCIALES
  // ============================================
  const osde = await prisma.obraSocial.create({
    data: {
      nombre: 'OSDE',
      codigo: 'OSDE',
      plan: 'Plan 210',
      telefono: '0810-555-6733',
    },
  });

  const swissMedical = await prisma.obraSocial.create({
    data: {
      nombre: 'Swiss Medical',
      codigo: 'SM',
      plan: 'SMG00',
      telefono: '0810-333-7947',
    },
  });

  const particular = await prisma.obraSocial.create({
    data: {
      nombre: 'Particular',
      codigo: 'PARTICULAR',
    },
  });

  console.log('✓ Obras sociales creadas');

  // ============================================
  // 4. PROFESIONALES
  // ============================================
  const usuarioDrGarcia = await prisma.usuario.create({
    data: {
      email: 'garcia@sanatorio.com',
      passwordHash: await bcrypt.hash('Garcia123!', 10),
      rol: Rol.PROFESIONAL,
    },
  });

  const drGarcia = await prisma.profesional.create({
    data: {
      usuarioId: usuarioDrGarcia.id,
      nombre: 'Carlos',
      apellido: 'García',
      matricula: 'MN-12345',
      especialidad: 'Psiquiatría',
      telefono: '11-4444-5555',
      email: 'garcia@sanatorio.com',
      duracionTurnoMinutos: 45,
      colorCalendario: '#3B82F6',
      bio: 'Psiquiatra con 15 años de experiencia en trastornos de ansiedad y depresión.',
      obrasSociales: {
        create: [
          { obraSocialId: osde.id },
          { obraSocialId: swissMedical.id },
          { obraSocialId: particular.id },
        ],
      },
    },
  });

  const usuariaDraLopez = await prisma.usuario.create({
    data: {
      email: 'lopez@sanatorio.com',
      passwordHash: await bcrypt.hash('Lopez123!', 10),
      rol: Rol.PROFESIONAL,
    },
  });

  const draLopez = await prisma.profesional.create({
    data: {
      usuarioId: usuariaDraLopez.id,
      nombre: 'María',
      apellido: 'López',
      matricula: 'MN-67890',
      especialidad: 'Psicología Clínica',
      telefono: '11-5555-6666',
      email: 'lopez@sanatorio.com',
      duracionTurnoMinutos: 60,
      colorCalendario: '#8B5CF6',
      bio: 'Psicóloga especializada en terapia cognitivo-conductual.',
      obrasSociales: {
        create: [
          { obraSocialId: osde.id },
          { obraSocialId: particular.id },
        ],
      },
    },
  });

  console.log('✓ Profesionales creados');

  // ============================================
  // 5. HORARIOS DE PROFESIONALES
  // ============================================
  // Dr. García: Lunes a Viernes 9:00-17:00
  for (let dia = 1; dia <= 5; dia++) {
    await prisma.horarioProfesional.create({
      data: {
        profesionalId: drGarcia.id,
        diaSemana: dia,
        horaInicio: '09:00',
        horaFin: '17:00',
      },
    });
  }

  // Dra. López: Lunes, Miércoles, Viernes 14:00-20:00
  for (const dia of [1, 3, 5]) {
    await prisma.horarioProfesional.create({
      data: {
        profesionalId: draLopez.id,
        diaSemana: dia,
        horaInicio: '14:00',
        horaFin: '20:00',
      },
    });
  }

  console.log('✓ Horarios de profesionales creados');

  // ============================================
  // 6. PACIENTES DE PRUEBA
  // ============================================
  const usuarioPaciente1 = await prisma.usuario.create({
    data: {
      email: 'juan.perez@email.com',
      passwordHash: await bcrypt.hash('Paciente123!', 10),
      rol: Rol.PACIENTE,
    },
  });

  const paciente1 = await prisma.paciente.create({
    data: {
      usuarioId: usuarioPaciente1.id,
      dni: '30123456',
      nombre: 'Juan',
      apellido: 'Pérez',
      fechaNacimiento: new Date('1985-03-15'),
      genero: Genero.MASCULINO,
      telefono: '11-2222-3333',
      email: 'juan.perez@email.com',
      direccion: 'Av. Corrientes 1234',
      localidad: 'CABA',
      provincia: 'Buenos Aires',
      obraSocialId: osde.id,
      numeroAfiliado: '123456789/01',
    },
  });

  const paciente2 = await prisma.paciente.create({
    data: {
      dni: '28987654',
      nombre: 'Ana',
      apellido: 'González',
      fechaNacimiento: new Date('1990-07-22'),
      genero: Genero.FEMENINO,
      telefono: '11-3333-4444',
      email: 'ana.gonzalez@email.com',
      direccion: 'Callao 567',
      localidad: 'CABA',
      provincia: 'Buenos Aires',
      obraSocialId: swissMedical.id,
      numeroAfiliado: 'SM-987654',
      familiarResponsableNombre: 'Roberto González',
      familiarResponsableTelefono: '11-9999-8888',
      familiarResponsableRelacion: 'Hermano',
    },
  });

  console.log('✓ Pacientes de prueba creados');

  // ============================================
  // 7. TURNO DE EJEMPLO
  // ============================================
  const proximoLunes = new Date();
  proximoLunes.setDate(proximoLunes.getDate() + ((1 + 7 - proximoLunes.getDay()) % 7 || 7));
  proximoLunes.setHours(10, 0, 0, 0);

  await prisma.turno.create({
    data: {
      pacienteId: paciente1.id,
      profesionalId: drGarcia.id,
      fechaHora: proximoLunes,
      duracionMinutos: 45,
      tipo: 'PRIMERA_VEZ',
      motivoConsulta: 'Consulta inicial',
      obraSocialId: osde.id,
      creadoPor: recepcion.id,
    },
  });

  console.log('✓ Turno de ejemplo creado');

  console.log('\n✅ Seed completado exitosamente!\n');
  console.log('📋 Credenciales de prueba:');
  console.log('----------------------------');
  console.log('SUPERADMIN:');
  console.log('  Email: admin@sanatorio.com');
  console.log('  Pass:  Admin123!');
  console.log('\nRECEPCIÓN:');
  console.log('  Email: recepcion@sanatorio.com');
  console.log('  Pass:  Recepcion123!');
  console.log('\nPROFESIONALES:');
  console.log('  Email: garcia@sanatorio.com');
  console.log('  Pass:  Garcia123!');
  console.log('  Email: lopez@sanatorio.com');
  console.log('  Pass:  Lopez123!');
  console.log('\nPACIENTE:');
  console.log('  Email: juan.perez@email.com');
  console.log('  Pass:  Paciente123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
