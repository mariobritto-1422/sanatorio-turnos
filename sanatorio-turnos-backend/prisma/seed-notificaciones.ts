import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNotificaciones() {
  console.log('🌱 Seeding notificaciones...');

  // ============================================
  // PLANTILLAS DE EMAIL
  // ============================================

  await prisma.plantillaNotificacion.upsert({
    where: { tipo: 'CONFIRMACION_TURNO' },
    update: {},
    create: {
      tipo: 'CONFIRMACION_TURNO',
      canal: 'EMAIL',
      asunto: 'Confirmación de Turno - Sanatorio',
      cuerpo: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0EA5E9;">✅ Turno Confirmado</h2>
          <p>Hola <strong>{paciente}</strong>,</p>
          <p>Tu turno ha sido <strong>confirmado exitosamente</strong>.</p>

          <div style="background-color: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> {fecha}</p>
            <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> {hora}</p>
            <p style="margin: 5px 0;"><strong>👨‍⚕️ Profesional:</strong> {profesional}</p>
            <p style="margin: 5px 0;"><strong>🩺 Especialidad:</strong> {especialidad}</p>
            <p style="margin: 5px 0;"><strong>⏱️ Duración:</strong> {duracion}</p>
            <p style="margin: 5px 0;"><strong>🏥 Obra Social:</strong> {obraSocial}</p>
          </div>

          <p>Te enviaremos recordatorios antes de tu turno.</p>
          <p><strong>¡Te esperamos!</strong></p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="font-size: 12px; color: #6B7280;">
            Si necesitas cancelar o reprogramar tu turno, por favor contactanos con anticipación.
          </p>
        </div>
      `,
      activo: true,
      variables: [
        '{paciente}',
        '{profesional}',
        '{especialidad}',
        '{fecha}',
        '{hora}',
        '{fechaHora}',
        '{obraSocial}',
        '{duracion}',
      ],
    },
  });

  await prisma.plantillaNotificacion.upsert({
    where: {
      tipo_canal: {
        tipo: 'RECORDATORIO_24H',
        canal: 'EMAIL',
      },
    },
    update: {},
    create: {
      tipo: 'RECORDATORIO_24H',
      canal: 'EMAIL',
      asunto: 'Recordatorio: Turno mañana - Sanatorio',
      cuerpo: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F59E0B;">⏰ Recordatorio de Turno</h2>
          <p>Hola <strong>{paciente}</strong>,</p>
          <p>Te recordamos que <strong>mañana</strong> tienes turno programado:</p>

          <div style="background-color: #FFFBEB; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> {fecha}</p>
            <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> {hora}</p>
            <p style="margin: 5px 0;"><strong>👨‍⚕️ Profesional:</strong> {profesional}</p>
            <p style="margin: 5px 0;"><strong>🩺 Especialidad:</strong> {especialidad}</p>
          </div>

          <p>Por favor, llega <strong>10 minutos antes</strong> de tu hora.</p>
          <p><strong>¡Te esperamos!</strong></p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="font-size: 12px; color: #6B7280;">
            Si no puedes asistir, por favor avísanos con anticipación.
          </p>
        </div>
      `,
      activo: true,
      variables: [
        '{paciente}',
        '{profesional}',
        '{especialidad}',
        '{fecha}',
        '{hora}',
        '{fechaHora}',
        '{obraSocial}',
        '{duracion}',
      ],
    },
  });

  await prisma.plantillaNotificacion.upsert({
    where: {
      tipo_canal: {
        tipo: 'RECORDATORIO_2H',
        canal: 'EMAIL',
      },
    },
    update: {},
    create: {
      tipo: 'RECORDATORIO_2H',
      canal: 'EMAIL',
      asunto: '🔔 Tu turno es en 2 horas - Sanatorio',
      cuerpo: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">🔔 ¡Tu turno es pronto!</h2>
          <p>Hola <strong>{paciente}</strong>,</p>
          <p>Tu turno es <strong>en 2 horas</strong>:</p>

          <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> {hora}</p>
            <p style="margin: 5px 0;"><strong>👨‍⚕️ Profesional:</strong> {profesional}</p>
          </div>

          <p><strong>Recuerda:</strong></p>
          <ul>
            <li>Llegar 10 minutos antes</li>
            <li>Traer tu documentación</li>
            <li>Traer tu carnet de obra social (si aplica)</li>
          </ul>

          <p><strong>¡Te esperamos!</strong></p>
        </div>
      `,
      activo: true,
      variables: [
        '{paciente}',
        '{profesional}',
        '{especialidad}',
        '{fecha}',
        '{hora}',
        '{fechaHora}',
        '{obraSocial}',
        '{duracion}',
      ],
    },
  });

  await prisma.plantillaNotificacion.upsert({
    where: {
      tipo_canal: {
        tipo: 'CANCELACION',
        canal: 'EMAIL',
      },
    },
    update: {},
    create: {
      tipo: 'CANCELACION',
      canal: 'EMAIL',
      asunto: 'Turno Cancelado - Sanatorio',
      cuerpo: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6B7280;">❌ Turno Cancelado</h2>
          <p>Hola <strong>{paciente}</strong>,</p>
          <p>Te informamos que tu turno ha sido <strong>cancelado</strong>:</p>

          <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> {fecha}</p>
            <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> {hora}</p>
            <p style="margin: 5px 0;"><strong>👨‍⚕️ Profesional:</strong> {profesional}</p>
          </div>

          <p>Si deseas solicitar un nuevo turno, por favor contactanos.</p>
          <p><strong>Disculpa las molestias.</strong></p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="font-size: 12px; color: #6B7280;">
            Sanatorio Psiquiátrico
          </p>
        </div>
      `,
      activo: true,
      variables: [
        '{paciente}',
        '{profesional}',
        '{especialidad}',
        '{fecha}',
        '{hora}',
        '{fechaHora}',
        '{obraSocial}',
        '{duracion}',
      ],
    },
  });

  // ============================================
  // PLANTILLAS DE WHATSAPP
  // ============================================

  await prisma.plantillaNotificacion.upsert({
    where: {
      tipo_canal: {
        tipo: 'CONFIRMACION_TURNO',
        canal: 'WHATSAPP',
      },
    },
    update: {},
    create: {
      tipo: 'CONFIRMACION_TURNO',
      canal: 'WHATSAPP',
      cuerpo: `✅ *TURNO CONFIRMADO*

Hola {paciente},

Tu turno ha sido confirmado:

📅 Fecha: {fecha}
🕐 Hora: {hora}
👨‍⚕️ Profesional: {profesional}
🩺 Especialidad: {especialidad}

¡Te esperamos!

_Recibirás recordatorios antes de tu turno._`,
      activo: true,
      variables: [
        '{paciente}',
        '{profesional}',
        '{especialidad}',
        '{fecha}',
        '{hora}',
        '{fechaHora}',
        '{obraSocial}',
        '{duracion}',
      ],
    },
  });

  await prisma.plantillaNotificacion.upsert({
    where: {
      tipo_canal: {
        tipo: 'RECORDATORIO_24H',
        canal: 'WHATSAPP',
      },
    },
    update: {},
    create: {
      tipo: 'RECORDATORIO_24H',
      canal: 'WHATSAPP',
      cuerpo: `⏰ *RECORDATORIO DE TURNO*

Hola {paciente},

Te recordamos que *mañana* tienes turno:

📅 Fecha: {fecha}
🕐 Hora: {hora}
👨‍⚕️ Profesional: {profesional}

Por favor, llega 10 minutos antes.

¡Te esperamos!`,
      activo: true,
      variables: [
        '{paciente}',
        '{profesional}',
        '{especialidad}',
        '{fecha}',
        '{hora}',
        '{fechaHora}',
        '{obraSocial}',
        '{duracion}',
      ],
    },
  });

  await prisma.plantillaNotificacion.upsert({
    where: {
      tipo_canal: {
        tipo: 'RECORDATORIO_2H',
        canal: 'WHATSAPP',
      },
    },
    update: {},
    create: {
      tipo: 'RECORDATORIO_2H',
      canal: 'WHATSAPP',
      cuerpo: `🔔 *¡TU TURNO ES PRONTO!*

Hola {paciente},

Tu turno es en *2 horas*:

🕐 Hora: {hora}
👨‍⚕️ Profesional: {profesional}

Recuerda traer tu documentación.

¡Te esperamos!`,
      activo: true,
      variables: [
        '{paciente}',
        '{profesional}',
        '{especialidad}',
        '{fecha}',
        '{hora}',
        '{fechaHora}',
        '{obraSocial}',
        '{duracion}',
      ],
    },
  });

  await prisma.plantillaNotificacion.upsert({
    where: {
      tipo_canal: {
        tipo: 'CANCELACION',
        canal: 'WHATSAPP',
      },
    },
    update: {},
    create: {
      tipo: 'CANCELACION',
      canal: 'WHATSAPP',
      cuerpo: `❌ *TURNO CANCELADO*

Hola {paciente},

Tu turno del {fechaHora} con {profesional} ha sido cancelado.

Si deseas un nuevo turno, por favor contactanos.

Disculpa las molestias.`,
      activo: true,
      variables: [
        '{paciente}',
        '{profesional}',
        '{especialidad}',
        '{fecha}',
        '{hora}',
        '{fechaHora}',
        '{obraSocial}',
        '{duracion}',
      ],
    },
  });

  // ============================================
  // CONFIGURACIONES POR DEFECTO
  // ============================================

  const tiposNotificacion = [
    'CONFIRMACION_TURNO',
    'RECORDATORIO_24H',
    'RECORDATORIO_2H',
    'CANCELACION',
  ] as const;

  for (const tipo of tiposNotificacion) {
    await prisma.configuracionNotificaciones.upsert({
      where: { tipoNotificacion: tipo },
      update: {},
      create: {
        tipoNotificacion: tipo,
        emailActivo: true,
        whatsappActivo: false, // Desactivado por defecto (requiere configuración de Twilio)
        smsActivo: false,
        horaInicioEnvio: '08:00',
        horaFinEnvio: '20:00',
      },
    });
  }

  console.log('✅ Notificaciones seeded correctamente');
}

seedNotificaciones()
  .catch((e) => {
    console.error('❌ Error al seed notificaciones:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
