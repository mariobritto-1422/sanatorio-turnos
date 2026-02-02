import twilio from 'twilio';
import type { Twilio } from 'twilio';

// ============================================
// SERVICIO DE WHATSAPP / SMS (TWILIO)
// ============================================

interface WhatsAppOptions {
  to: string; // Número en formato E.164: +5491123456789
  mensaje: string;
}

class WhatsAppService {
  private client: Twilio | null = null;
  private isConfigured = false;
  private twilioNumber: string = '';

  constructor() {
    this.initializeClient();
  }

  /**
   * Inicializa el cliente de Twilio
   */
  private initializeClient() {
    const {
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_WHATSAPP_NUMBER,
    } = process.env;

    // Validar que las variables de entorno existan
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      console.warn(
        '⚠️  Variables de entorno de Twilio no configuradas. El servicio de WhatsApp está deshabilitado.'
      );
      this.isConfigured = false;
      return;
    }

    try {
      this.client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      this.twilioNumber = TWILIO_WHATSAPP_NUMBER;
      this.isConfigured = true;
      console.log('✅ Servicio de WhatsApp (Twilio) configurado correctamente');
    } catch (error) {
      console.error('❌ Error al configurar servicio de WhatsApp:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Envía un mensaje de WhatsApp
   */
  async enviarWhatsApp(options: WhatsAppOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (!this.isConfigured || !this.client) {
      return {
        success: false,
        error: 'Servicio de WhatsApp no configurado',
      };
    }

    try {
      // Twilio requiere prefijo 'whatsapp:' para WhatsApp
      const fromNumber = `whatsapp:${this.twilioNumber}`;
      const toNumber = `whatsapp:${this.formatearNumero(options.to)}`;

      const message = await this.client.messages.create({
        from: fromNumber,
        to: toNumber,
        body: options.mensaje,
      });

      console.log('✅ WhatsApp enviado:', message.sid);
      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error: any) {
      console.error('❌ Error al enviar WhatsApp:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido',
      };
    }
  }

  /**
   * Envía un SMS (fallback si WhatsApp no está disponible)
   */
  async enviarSMS(options: WhatsAppOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (!this.isConfigured || !this.client) {
      return {
        success: false,
        error: 'Servicio de SMS no configurado',
      };
    }

    try {
      // Para SMS, NO usar el prefijo 'whatsapp:'
      const message = await this.client.messages.create({
        from: this.twilioNumber,
        to: this.formatearNumero(options.to),
        body: options.mensaje,
      });

      console.log('✅ SMS enviado:', message.sid);
      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error: any) {
      console.error('❌ Error al enviar SMS:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido',
      };
    }
  }

  /**
   * Formatea el número al formato E.164
   * Si el número no tiene +, lo agrega
   */
  private formatearNumero(numero: string): string {
    // Eliminar espacios, guiones, paréntesis
    let numeroLimpio = numero.replace(/[\s\-\(\)]/g, '');

    // Si no empieza con +, agregar +54 (Argentina) por defecto
    // NOTA: Esto debería ser configurable según el país
    if (!numeroLimpio.startsWith('+')) {
      numeroLimpio = `+54${numeroLimpio}`;
    }

    return numeroLimpio;
  }

  /**
   * Verifica si un número es válido para WhatsApp
   */
  validarNumero(numero: string): boolean {
    const numeroFormateado = this.formatearNumero(numero);
    // Validación básica: debe empezar con + y tener entre 10 y 15 dígitos
    const regex = /^\+[1-9]\d{9,14}$/;
    return regex.test(numeroFormateado);
  }

  /**
   * Obtiene el estado del servicio
   */
  getEstado() {
    return {
      configurado: this.isConfigured,
      numero: this.twilioNumber || 'No configurado',
    };
  }
}

// Exportar instancia única (singleton)
export const whatsappService = new WhatsAppService();
