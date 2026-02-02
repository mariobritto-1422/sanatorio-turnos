// ============================================
// API CLIENT - Comunicación con el backend
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{
      success: boolean;
      data: {
        token: string;
        usuario: any;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Profesionales
  async getProfesionales(token: string) {
    return this.request<{
      success: boolean;
      data: any[];
    }>('/profesionales', { token });
  }

  async getProfesional(id: string, token: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/profesionales/${id}`, { token });
  }

  // Turnos
  async getTurnos(filters: any, token: string) {
    const params = new URLSearchParams(filters);
    return this.request<{
      success: boolean;
      data: any[];
    }>(`/turnos?${params}`, { token });
  }

  async getDisponibilidad(profesionalId: string, fecha: string, token: string) {
    return this.request<{
      success: boolean;
      data: {
        disponibles: string[];
      };
    }>(`/turnos/disponibilidad?profesionalId=${profesionalId}&fecha=${fecha}`, {
      token,
    });
  }

  async createTurno(data: any, token: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>('/turnos', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  async cancelarTurno(id: string, motivo: string, token: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/turnos/${id}/cancelar`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
      token,
    });
  }

  // Actualizar turno
  async updateTurno(id: string, data: any, token: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/turnos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    });
  }

  // Método genérico para GET
  async getAll(endpoint: string, token: string) {
    return this.request<{
      success: boolean;
      data: any[];
    }>(endpoint, { token });
  }
}

export const api = new ApiClient(API_URL);
