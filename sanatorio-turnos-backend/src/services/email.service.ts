import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// ============================================
// SERVICIO DE EMAIL
// ============================================

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Inicializa el transporter de nodemailer
   */
  private initializeTransporter() {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASS,
      EMAIL_FROM,
    } = process.env;

    // Validar que las variables de entorno existan
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
      console.warn(
        '⚠️  Variables de entorno de email no configuradas. El servicio de email está deshabilitado.'
      );
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT),
        secure: SMTP_SECURE === 'true', // true para puerto 465, false para otros
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      this.isConfigured = true;
      console.log('✅ Servicio de email configurado correctamente');
    } catch (error) {
      console.error('❌ Error al configurar servicio de email:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Envía un email
   */
  async enviarEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.error('❌ Servicio de email no configurado');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Sanatorio'}" <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || this.htmlToText(options.html),
        html: options.html,
      });

      console.log('✅ Email enviado:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      return false;
    }
  }

  /**
   * Convierte HTML básico a texto plano (fallback simple)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  /**
   * Verifica la conexión SMTP
   */
  async verificarConexion(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Conexión SMTP verificada');
      return true;
    } catch (error) {
      console.error('❌ Error al verificar conexión SMTP:', error);
      return false;
    }
  }

  /**
   * Obtiene el estado del servicio
   */
  getEstado() {
    return {
      configurado: this.isConfigured,
      host: process.env.SMTP_HOST || 'No configurado',
      from: process.env.EMAIL_FROM || 'No configurado',
    };
  }
}

// Exportar instancia única (singleton)
export const emailService = new EmailService();
