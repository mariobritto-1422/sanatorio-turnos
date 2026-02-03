'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Settings, FileText, BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

type Vista = 'plantillas' | 'configuracion' | 'log' | 'estadisticas';

export default function NotificacionesPage() {
  const { token } = useAuthStore();
  const [vistaActual, setVistaActual] = useState<Vista>('plantillas');
  const [estadoServicios, setEstadoServicios] = useState<any>(null);

  useEffect(() => {
    cargarEstadoServicios();
  }, []);

  const cargarEstadoServicios = async () => {
    if (!token) return;

    try {
      const response = await api.get('/notificaciones/estado', token);
      if (response.success) {
        setEstadoServicios(response.data);
      }
    } catch (error) {
      console.error('Error al cargar estado de servicios:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-8 h-8 text-sky-600" />
                Sistema de Notificaciones
              </h1>
              <p className="text-gray-600 mt-2">
                Configura y gestiona las notificaciones automáticas del sanatorio
              </p>
            </div>
          </div>
        </div>

        {/* Estado de servicios */}
        {estadoServicios && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Estado de los Servicios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Email (SMTP)</p>
                  <p className="text-sm text-gray-600">
                    {estadoServicios.email?.configurado ? (
                      <span className="text-green-600">✓ Configurado</span>
                    ) : (
                      <span className="text-red-600">✗ No configurado</span>
                    )}
                  </p>
                  {estadoServicios.email?.from && (
                    <p className="text-xs text-gray-500">{estadoServicios.email.from}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">WhatsApp (Twilio)</p>
                  <p className="text-sm text-gray-600">
                    {estadoServicios.whatsapp?.configurado ? (
                      <span className="text-green-600">✓ Configurado</span>
                    ) : (
                      <span className="text-amber-600">⚠ No configurado</span>
                    )}
                  </p>
                  {estadoServicios.whatsapp?.numero && (
                    <p className="text-xs text-gray-500">{estadoServicios.whatsapp.numero}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs de navegación */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setVistaActual('plantillas')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  vistaActual === 'plantillas'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Plantillas
              </button>
              <button
                onClick={() => setVistaActual('configuracion')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  vistaActual === 'configuracion'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Configuración
              </button>
              <button
                onClick={() => setVistaActual('log')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  vistaActual === 'log'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="w-4 h-4 inline mr-2" />
                Log de Envíos
              </button>
              <button
                onClick={() => setVistaActual('estadisticas')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  vistaActual === 'estadisticas'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Estadísticas
              </button>
            </nav>
          </div>

          <div className="p-6">
            {vistaActual === 'plantillas' && <VistaPlantillas />}
            {vistaActual === 'configuracion' && <VistaConfiguracion />}
            {vistaActual === 'log' && <VistaLog />}
            {vistaActual === 'estadisticas' && <VistaEstadisticas />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// VISTA: PLANTILLAS
// ============================================
function VistaPlantillas() {
  const { token } = useAuthStore();
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<any>(null);

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const cargarPlantillas = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await api.get('/notificaciones/plantillas', token);
      if (response.success) {
        setPlantillas(response.data);
      }
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
    } finally {
      setLoading(false);
    }
  };

  const tipoNombres: Record<string, string> = {
    CONFIRMACION_TURNO: 'Confirmación de Turno',
    RECORDATORIO_24H: 'Recordatorio 24h',
    RECORDATORIO_2H: 'Recordatorio 2h',
    CANCELACION: 'Cancelación',
  };

  const canalIconos: Record<string, any> = {
    EMAIL: Mail,
    WHATSAPP: MessageSquare,
  };

  if (loading) {
    return <div className="text-center py-8">Cargando plantillas...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Plantillas de Notificación
        </h3>
        <p className="text-sm text-gray-600">
          Personaliza el contenido de los mensajes automáticos.
          Variables disponibles: <code className="bg-gray-100 px-1 rounded">{'{paciente}'}</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">{'{profesional}'}</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">{'{fecha}'}</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">{'{hora}'}</code>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {plantillas.map((plantilla) => {
          const Icon = canalIconos[plantilla.canal] || Bell;

          return (
            <div
              key={plantilla.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    plantilla.canal === 'EMAIL' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      plantilla.canal === 'EMAIL' ? 'text-blue-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {tipoNombres[plantilla.tipo] || plantilla.tipo}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {plantilla.canal}
                      </span>
                      {!plantilla.activo && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
                          Desactivada
                        </span>
                      )}
                    </div>
                    {plantilla.asunto && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Asunto:</strong> {plantilla.asunto}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {plantilla.cuerpo.substring(0, 150)}...
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPlantillaSeleccionada(plantilla)}
                  className="ml-4 px-4 py-2 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                >
                  Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de edición (placeholder) */}
      {plantillaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Editar Plantilla: {tipoNombres[plantillaSeleccionada.tipo]}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Funcionalidad de edición en desarrollo...
            </p>
            <button
              onClick={() => setPlantillaSeleccionada(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// VISTA: CONFIGURACIÓN
// ============================================
function VistaConfiguracion() {
  const { token } = useAuthStore();
  const [configuraciones, setConfiguraciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const cargarConfiguraciones = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await api.get('/notificaciones/configuracion', token);
      if (response.success) {
        setConfiguraciones(response.data);
      }
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarConfiguracion = async (tipo: string, campo: string, valor: any) => {
    if (!token) return;

    try {
      const config = configuraciones.find((c) => c.tipoNotificacion === tipo);
      const updated = { ...config, [campo]: valor };

      await api.put(`/notificaciones/configuracion/${tipo}`, updated, token);

      cargarConfiguraciones();
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
    }
  };

  const tipoNombres: Record<string, string> = {
    CONFIRMACION_TURNO: 'Confirmación de Turno',
    RECORDATORIO_24H: 'Recordatorio 24h',
    RECORDATORIO_2H: 'Recordatorio 2h',
    CANCELACION: 'Cancelación',
  };

  if (loading) {
    return <div className="text-center py-8">Cargando configuraciones...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Configuración de Canales y Horarios
        </h3>
        <p className="text-sm text-gray-600">
          Activa o desactiva los canales de notificación y configura los horarios de envío.
        </p>
      </div>

      <div className="space-y-6">
        {configuraciones.map((config) => (
          <div key={config.id} className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">
              {tipoNombres[config.tipoNotificacion] || config.tipoNotificacion}
            </h4>

            {/* Canales */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Canales Activos:</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.emailActivo}
                    onChange={(e) =>
                      actualizarConfiguracion(
                        config.tipoNotificacion,
                        'emailActivo',
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Email</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.whatsappActivo}
                    onChange={(e) =>
                      actualizarConfiguracion(
                        config.tipoNotificacion,
                        'whatsappActivo',
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">WhatsApp</span>
                </label>
              </div>
            </div>

            {/* Horarios */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Horario de Envío:</p>
              <div className="flex gap-4 items-center">
                <div>
                  <label className="text-xs text-gray-600">Desde:</label>
                  <input
                    type="time"
                    value={config.horaInicioEnvio}
                    onChange={(e) =>
                      actualizarConfiguracion(
                        config.tipoNotificacion,
                        'horaInicioEnvio',
                        e.target.value
                      )
                    }
                    className="block mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Hasta:</label>
                  <input
                    type="time"
                    value={config.horaFinEnvio}
                    onChange={(e) =>
                      actualizarConfiguracion(
                        config.tipoNotificacion,
                        'horaFinEnvio',
                        e.target.value
                      )
                    }
                    className="block mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Las notificaciones fuera de este horario se programarán para el próximo día hábil.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// VISTA: LOG
// ============================================
function VistaLog() {
  const { token } = useAuthStore();
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    tipo: '',
    canal: '',
  });

  useEffect(() => {
    cargarLog();
  }, [filtros]);

  const cargarLog = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.canal) params.append('canal', filtros.canal);
      params.append('limit', '50');

      const response = await api.get(`/notificaciones/log?${params}`, token);
      if (response.success) {
        setNotificaciones(response.data.notificaciones || []);
      }
    } catch (error) {
      console.error('Error al cargar log:', error);
    } finally {
      setLoading(false);
    }
  };

  const estadoColores: Record<string, string> = {
    ENVIADO: 'bg-green-100 text-green-800',
    FALLIDO: 'bg-red-100 text-red-800',
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    PROGRAMADO: 'bg-blue-100 text-blue-800',
  };

  const tipoNombres: Record<string, string> = {
    CONFIRMACION_TURNO: 'Confirmación',
    RECORDATORIO_24H: 'Recordatorio 24h',
    RECORDATORIO_2H: 'Recordatorio 2h',
    CANCELACION: 'Cancelación',
  };

  if (loading) {
    return <div className="text-center py-8">Cargando log...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Log de Notificaciones Enviadas
        </h3>

        {/* Filtros */}
        <div className="flex gap-4 mb-4">
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Todos los estados</option>
            <option value="ENVIADO">Enviado</option>
            <option value="FALLIDO">Fallido</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="PROGRAMADO">Programado</option>
          </select>

          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Todos los tipos</option>
            <option value="CONFIRMACION_TURNO">Confirmación</option>
            <option value="RECORDATORIO_24H">Recordatorio 24h</option>
            <option value="RECORDATORIO_2H">Recordatorio 2h</option>
            <option value="CANCELACION">Cancelación</option>
          </select>

          <select
            value={filtros.canal}
            onChange={(e) => setFiltros({ ...filtros, canal: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Todos los canales</option>
            <option value="EMAIL">Email</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Canal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Destinatario
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Intentos
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {notificaciones.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No hay notificaciones registradas
                </td>
              </tr>
            ) : (
              notificaciones.map((notif) => (
                <tr key={notif.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(notif.createdAt).toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {tipoNombres[notif.tipo] || notif.tipo}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {notif.canal}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{notif.destinatario}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        estadoColores[notif.estado] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {notif.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{notif.intentos}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// VISTA: ESTADÍSTICAS
// ============================================
function VistaEstadisticas() {
  const { token } = useAuthStore();
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await api.get('/notificaciones/estadisticas', token);
      if (response.success) {
        setEstadisticas(response.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando estadísticas...</div>;
  }

  if (!estadisticas) {
    return <div className="text-center py-8 text-gray-500">No hay datos disponibles</div>;
  }

  const tipoNombres: Record<string, string> = {
    CONFIRMACION_TURNO: 'Confirmación',
    RECORDATORIO_24H: 'Recordatorio 24h',
    RECORDATORIO_2H: 'Recordatorio 2h',
    CANCELACION: 'Cancelación',
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Estadísticas de Notificaciones
      </h3>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-900">{estadisticas.totalEnviadas}</p>
          <p className="text-sm text-green-700">Enviadas</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-500 rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-900">{estadisticas.totalFallidas}</p>
          <p className="text-sm text-red-700">Fallidas</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-900">{estadisticas.totalProgramadas}</p>
          <p className="text-sm text-blue-700">Programadas</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-900">{estadisticas.tasaExito}%</p>
          <p className="text-sm text-purple-700">Tasa de Éxito</p>
        </div>
      </div>

      {/* Distribución por tipo */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Por Tipo de Notificación</h4>
        <div className="space-y-3">
          {estadisticas.porTipo?.map((item: any) => (
            <div key={item.tipo} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {tipoNombres[item.tipo] || item.tipo}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-sky-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (item._count /
                          estadisticas.porTipo.reduce(
                            (acc: number, t: any) => acc + t._count,
                            0
                          )) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {item._count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribución por canal */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Por Canal</h4>
        <div className="space-y-3">
          {estadisticas.porCanal?.map((item: any) => (
            <div key={item.canal} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.canal === 'EMAIL' ? (
                  <Mail className="w-4 h-4 text-blue-600" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-green-600" />
                )}
                <span className="text-sm text-gray-700">{item.canal}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.canal === 'EMAIL' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{
                      width: `${
                        (item._count /
                          estadisticas.porCanal.reduce(
                            (acc: number, c: any) => acc + c._count,
                            0
                          )) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {item._count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
