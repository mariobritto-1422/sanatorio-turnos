/**
 * SEED — Módulo Guardias
 * Crea: Sanatorio + personal de prueba (6 enfermeros, 3 mucamas)
 * Habilita: moduloGuardiasActivo = true
 */
import { PrismaClient, RolGuardia, TipoContrato, Rol } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERSONAL = [
  // Enfermeros
  { nombre: 'María',    apellido: 'González',   email: 'mgonzalez@sanaturno.com',  rol: RolGuardia.ENFERMERO, horas: 40, ingreso: '2019-03-15', contrato: TipoContrato.PLANTA_PERMANENTE },
  { nombre: 'Carlos',   apellido: 'Rodríguez',  email: 'crodriguez@sanaturno.com', rol: RolGuardia.ENFERMERO, horas: 40, ingreso: '2020-07-01', contrato: TipoContrato.PLANTA_PERMANENTE },
  { nombre: 'Lucía',    apellido: 'Martínez',   email: 'lmartinez@sanaturno.com',  rol: RolGuardia.ENFERMERO, horas: 36, ingreso: '2021-01-10', contrato: TipoContrato.CONTRATADO       },
  { nombre: 'Diego',    apellido: 'Fernández',  email: 'dfernandez@sanaturno.com', rol: RolGuardia.ENFERMERO, horas: 40, ingreso: '2018-11-20', contrato: TipoContrato.PLANTA_PERMANENTE },
  { nombre: 'Valeria',  apellido: 'López',      email: 'vlopez@sanaturno.com',     rol: RolGuardia.ENFERMERO, horas: 48, ingreso: '2022-04-05', contrato: TipoContrato.CONTRATADO       },
  { nombre: 'Matías',   apellido: 'Pérez',      email: 'mperez@sanaturno.com',     rol: RolGuardia.ENFERMERO, horas: 40, ingreso: '2023-06-12', contrato: TipoContrato.CONTRATADO       },
  // Mucamas
  { nombre: 'Sandra',   apellido: 'Gómez',      email: 'sgomez@sanaturno.com',     rol: RolGuardia.MUCAMA,    horas: 36, ingreso: '2020-02-28', contrato: TipoContrato.PLANTA_PERMANENTE },
  { nombre: 'Patricia', apellido: 'Díaz',       email: 'pdiaz@sanaturno.com',      rol: RolGuardia.MUCAMA,    horas: 36, ingreso: '2021-09-03', contrato: TipoContrato.CONTRATADO       },
  { nombre: 'Roberto',  apellido: 'Herrera',    email: 'rherrera@sanaturno.com',   rol: RolGuardia.MUCAMA,    horas: 36, ingreso: '2019-12-15', contrato: TipoContrato.PLANTA_PERMANENTE },
];

async function main() {
  console.log('🏥 Creando sanatorio de prueba...');

  // 1. Crear sanatorio
  const sanatorio = await prisma.sanatorio.upsert({
    where: { id: 'sanatorio-prueba-001' },
    create: {
      id: 'sanatorio-prueba-001',
      nombre: 'Sanatorio Psiquiátrico San José',
      moduloGuardiasActivo: true,
    },
    update: {
      nombre: 'Sanatorio Psiquiátrico San José',
      moduloGuardiasActivo: true,
    },
  });
  console.log(`✅ Sanatorio: ${sanatorio.nombre} (moduloGuardias: ${sanatorio.moduloGuardiasActivo})`);

  // 2. Vincular el superadmin al sanatorio
  await prisma.usuario.updateMany({
    where: { rol: Rol.SUPERADMIN },
    data: { sanatorioId: sanatorio.id },
  });
  console.log('✅ SuperAdmin vinculado al sanatorio');

  // 3. Crear usuarios + personal guardia
  const passwordHash = await bcrypt.hash('Guardia123!', 10);

  for (const p of PERSONAL) {
    const rolUsuario = p.rol === RolGuardia.ENFERMERO ? Rol.ENFERMERO : Rol.MUCAMA;

    const usuario = await prisma.usuario.upsert({
      where: { email: p.email },
      create: {
        email: p.email,
        passwordHash,
        rol: rolUsuario,
        sanatorioId: sanatorio.id,
      },
      update: { sanatorioId: sanatorio.id },
    });

    await prisma.personalGuardia.upsert({
      where: { usuarioId: usuario.id },
      create: {
        usuarioId: usuario.id,
        sanatorioId: sanatorio.id,
        nombre: p.nombre,
        apellido: p.apellido,
        email: p.email,
        rol: p.rol,
        tipoContrato: p.contrato,
        fechaIngreso: new Date(p.ingreso),
        horasSemanalesContrato: p.horas,
        activo: true,
      },
      update: { activo: true },
    });

    console.log(`  👤 ${p.apellido}, ${p.nombre} — ${p.rol} (${p.horas}h/sem)`);
  }

  // 4. Configuración de turnos del sanatorio
  await prisma.configuracionTurnos.upsert({
    where: { sanatorioId: sanatorio.id },
    create: {
      sanatorioId: sanatorio.id,
      turnos: [
        { nombre: 'Mañana', horaInicio: '07:00', horaFin: '13:00', horas: 6  },
        { nombre: 'Tarde',  horaInicio: '13:00', horaFin: '19:00', horas: 6  },
        { nombre: 'Noche',  horaInicio: '19:00', horaFin: '07:00', horas: 12 },
      ],
      maxDiasSeguidosSinFranco: 6,
      maxNochesSeguidasPermitidas: 3,
      diasFrancoSemanal: 2,
    },
    update: {},
  });
  console.log('✅ Configuración de turnos creada (M/T/N)');

  // 5. Feriados de prueba (abril 2026)
  const feriadosPrueba = [
    { fecha: '2026-04-02', nombre: 'Día del Veterano y de los Caídos en Malvinas' },
    { fecha: '2026-04-03', nombre: 'Viernes Santo' },
    { fecha: '2026-04-06', nombre: 'Lunes de Pascua' },
  ];

  for (const f of feriadosPrueba) {
    await prisma.feriado.upsert({
      where: { fecha_sanatorioId: { fecha: new Date(f.fecha), sanatorioId: sanatorio.id } },
      create: { fecha: new Date(f.fecha), nombre: f.nombre, tipo: 'NACIONAL', sanatorioId: sanatorio.id },
      update: {},
    });
  }
  console.log(`✅ ${feriadosPrueba.length} feriados de prueba cargados (Abril 2026)`);

  console.log('\n📋 RESUMEN:');
  console.log(`   Sanatorio ID: ${sanatorio.id}`);
  console.log(`   Personal:     ${PERSONAL.length} personas (${PERSONAL.filter(p=>p.rol===RolGuardia.ENFERMERO).length} enfermeros, ${PERSONAL.filter(p=>p.rol===RolGuardia.MUCAMA).length} mucamas)`);
  console.log(`   Credenciales: email del personal / Guardia123!`);
  console.log(`\n🚀 Listo para generar grilla. Usá:`);
  console.log(`   POST /api/guardias/generar`);
  console.log(`   { "mes": 4, "anio": 2026, "sanatorioId": "${sanatorio.id}" }`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
